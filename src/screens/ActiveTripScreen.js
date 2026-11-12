import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import CarMarker from '../components/CarMarker';
import PrimaryButton from '../components/PrimaryButton';
import { APP_CONFIG } from '../config/app';
import { PRICING } from '../config/pricing';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useSession } from '../context/SessionContext';
import { useRouteSimulation } from '../hooks/useRouteSimulation';
import { updateDriverLocation } from '../services/drivers';
import { getDirections, getDistanceMatrix, snapToRoad } from '../services/maps';
import { completeTrip, markCashReceived, subscribeTrip, updateTripStatus } from '../services/trips';
import { colors, radius, spacing, typography } from '../theme';
import { calculateFare } from '../utils/calculateFare';
import { formatDistance, formatDuration } from '../utils/formatters';
import { distanceKm } from '../utils/geo';

const toCoordinate = (point) => ({ latitude: point.lat, longitude: point.lng });

// Punto de partida del carro: la ubicación del conductor, o cerca de la recogida si está lejos o no se conoce
function simulationStart(startLocation, origin) {
  if (startLocation && distanceKm(startLocation, origin) < 15) return { lat: startLocation.lat, lng: startLocation.lng };
  return { lat: origin.lat - 0.011, lng: origin.lng - 0.006 };
}

export default function ActiveTripScreen({ navigation, route }) {
  const { tripId } = route.params;
  const { driverId } = useSession();
  const { t, language } = useLanguage();
  const { location: driverLocation } = useLocation();
  const startLocation = useRef(driverLocation);
  if (driverLocation) startLocation.current = driverLocation;
  const mapRef = useRef(null);
  const [trip, setTrip] = useState(null);
  const [leg, setLeg] = useState(null);
  const [eta, setEta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState('');

  const status = trip?.status;
  const phase = status === 'in_progress' ? 'destination' : 'pickup';
  const moving = status === 'driver_arriving' || status === 'in_progress';

  useEffect(() => subscribeTrip(tripId, setTrip, () => setError('trip.realtimeFailed')), [tripId]);

  // La ruta se pide solo al aceptar (a la recogida) y al pasar a destino, nunca en cada actualización
  const loadedTrip = trip?.id;
  useEffect(() => {
    if (!loadedTrip) return undefined;
    let active = true;
    const { origin, destination } = trip;

    (async () => {
      try {
        const from = phase === 'pickup' ? await snapToRoad(simulationStart(startLocation.current, origin)) : origin;
        const to = phase === 'pickup' ? origin : destination;
        if (phase === 'pickup') {
          const matrix = await getDistanceMatrix(from, to);
          if (active) setEta(matrix);
        }
        const directions = await getDirections(from, to);
        if (!active) return;
        setLeg({ phase, ...directions });
        if (phase === 'pickup' && trip.status === 'accepted') {
          await updateTripStatus(tripId, 'driver_arriving', { driverArrivingAt: new Date() });
        }
      } catch (err) {
        console.warn('ActiveTrip.loadRoute', err);
        if (active) setError('trip.routeFailed');
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedTrip, phase]);

  const legPoints = leg && leg.phase === phase ? leg.points : null;

  const handlePublish = useCallback(
    (point) => {
      updateDriverLocation(driverId, { lat: point.lat, lng: point.lng, heading: point.bearing }).catch((err) =>
        console.warn('updateDriverLocation', err)
      );
    },
    [driverId]
  );

  const sim = useRouteSimulation({
    points: legPoints,
    active: moving && !!legPoints,
    speedKmh: APP_CONFIG.simulationSpeedKmh,
    onPublish: handlePublish,
  });

  const lastPosition = useRef(null);
  if (sim.position) lastPosition.current = sim.position;
  const carPosition = sim.position || lastPosition.current;
  const arrived = moving && !!legPoints && sim.arrived;
  const target = phase === 'pickup' ? trip?.origin : trip?.destination;

  useEffect(() => {
    if (!legPoints || !mapRef.current) return;
    mapRef.current.fitToCoordinates(legPoints.map(toCoordinate), {
      edgePadding: { top: 80, right: 60, bottom: 280, left: 60 },
      animated: true,
    });
  }, [legPoints]);

  useEffect(() => {
    if (status === 'completed' || status === 'paid') navigation.replace('TripSummary', { tripId });
  }, [status, tripId, navigation]);

  const handlePassengerOnBoard = useCallback(async () => {
    if (busy || !arrived || status !== 'driver_arriving') return;
    setBusy(true);
    setError('');
    try {
      await updateTripStatus(tripId, 'in_progress', { startedAt: new Date() });
    } catch (err) {
      console.warn('in_progress', err);
      setError('trip.startFailed');
    } finally {
      setBusy(false);
    }
  }, [busy, arrived, status, tripId]);

  const handleFinish = useCallback(async () => {
    if (busy || !arrived) return;
    setBusy(true);
    setError('');
    const destinationLeg = leg && leg.phase === 'destination' ? leg : null;
    const distance = destinationLeg?.distanceKm ?? trip.distanceKm;
    const duration = destinationLeg?.durationMin ?? trip.durationMin;
    // Mismo cálculo que la estimación del pasajero, con la distancia y duración reales del tramo
    const money = calculateFare({ distanceKm: distance, durationMin: duration, category: trip.category, tip: trip.tip || 0 });
    try {
      await completeTrip(tripId, {
        distanceKm: Math.round(distance * 10) / 10,
        durationMin: Math.round(duration),
        ...money,
        commissionRate: PRICING.commissionRate,
        route: destinationLeg?.encoded || null,
      });
      // En efectivo el pasajero paga al bajar: el viaje queda cobrado de una vez
      if (trip.paymentMethod === 'cash') {
        await markCashReceived(tripId).catch((err) => console.warn('markCashReceived', err));
      }
    } catch (err) {
      console.warn('completeTrip', err);
      setError('trip.finishFailed');
      setBusy(false);
    }
  }, [busy, arrived, leg, trip, tripId]);

  const handleCancel = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await updateTripStatus(tripId, 'cancelled', { cancelledBy: 'driver', cancelledAt: new Date() });
      navigation.goBack();
    } catch (err) {
      console.warn('cancel', err);
      setError('trip.cancelFailed');
      setBusy(false);
    }
  }, [busy, tripId, navigation]);

  const info = useMemo(() => (leg && leg.phase === phase ? leg : null), [leg, phase]);

  // Lo que falta por recorrer: baja a medida que el carro avanza. El tiempo se reparte en proporción a la distancia
  const remaining = useMemo(() => {
    if (!info) return null;
    const totalKm = info.distanceKm;
    const km = sim.position?.remainingKm ?? totalKm;
    const totalMin = phase === 'pickup' && eta ? eta.durationMin : info.durationMin;
    const minutes = totalKm > 0 ? (totalMin * km) / totalKm : 0;
    return { km, minutes: km <= 0.005 ? 0 : Math.ceil(minutes) };
  }, [info, sim.position, phase, eta]);

  if (!trip) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.texto} />
        {error ? <Text style={styles.error}>{t(error)}</Text> : null}
      </SafeAreaView>
    );
  }

  if (status === 'cancelled') {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>{t('trip.cancelledTitle')}</Text>
        <Text style={styles.subtitle}>{t('trip.cancelledText')}</Text>
        <View style={styles.fullWidth}>
          <PrimaryButton title={t('common.backHome')} onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = status === 'accepted' || status === 'driver_arriving';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude: trip.origin.lat, longitude: trip.origin.lng, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
      >
        {legPoints ? <Polyline coordinates={legPoints.map(toCoordinate)} strokeWidth={5} strokeColor={colors.texto} /> : null}
        <Marker coordinate={toCoordinate(trip.origin)} title={t('trip.pickupMarker')} pinColor={colors.exito} />
        <Marker coordinate={toCoordinate(trip.destination)} title={t('trip.destinationMarker')} pinColor={colors.error} />
        {carPosition ? <CarMarker coordinate={carPosition} heading={carPosition.bearing || 0} /> : null}
      </MapView>

      <SafeAreaView edges={['bottom']} style={styles.panelWrapper} pointerEvents="box-none">
        <View style={styles.panel}>
          <Text style={styles.title}>{phase === 'pickup' ? t('trip.toPickup') : t('trip.toDestination')}</Text>
          <Text style={styles.address} numberOfLines={2}>
            {target?.address}
          </Text>
          <Text style={styles.meta}>
            {remaining
              ? `${formatDistance(remaining.km, language)} · ${formatDuration(remaining.minutes)}${info.source === 'straight' ? t('trip.straightRoute') : ''}`
              : t('trip.calculating')}
          </Text>
          <Text style={styles.meta}>{t('trip.simulation')}</Text>
          {arrived ? <Text style={styles.arrived}>{phase === 'pickup' ? t('trip.arrivedPickup') : t('trip.arrivedDestination')}</Text> : null}
          {error ? <Text style={styles.error}>{t(error)}</Text> : null}

          <View style={styles.actions}>
            {status === 'in_progress' ? (
              <PrimaryButton title={t('trip.finish')} onPress={handleFinish} disabled={!arrived || busy} />
            ) : (
              <PrimaryButton title={t('trip.onBoard')} onPress={handlePassengerOnBoard} disabled={!arrived || busy || status !== 'driver_arriving'} />
            )}
            {canCancel ? (
              <PrimaryButton
                title={confirmCancel ? t('trip.confirmCancel') : t('trip.cancel')}
                variant="secondary"
                onPress={confirmCancel ? handleCancel : () => setConfirmCancel(true)}
              />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.fondo },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.fondo },
  fullWidth: { alignSelf: 'stretch' },
  map: { flex: 1 },
  panelWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.md },
  panel: {
    backgroundColor: colors.fondo,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { ...typography.titulo, fontSize: 22, color: colors.texto },
  subtitle: { ...typography.subtitulo, color: colors.textoSecundario, textAlign: 'center', marginVertical: spacing.md },
  address: { ...typography.texto, color: colors.texto, marginTop: spacing.xs },
  meta: { ...typography.error, color: colors.textoSecundario, marginTop: spacing.xs },
  arrived: { ...typography.etiqueta, color: colors.exito, marginTop: spacing.sm },
  error: { ...typography.error, color: colors.error, marginTop: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.md },
});
