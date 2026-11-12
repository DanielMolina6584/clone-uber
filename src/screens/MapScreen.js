import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AvailabilityToggle from '../components/AvailabilityToggle';
import TripRequestCard from '../components/TripRequestCard';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { useSession } from '../context/SessionContext';
import { useActiveTrip } from '../hooks/useActiveTrip';
import { usePublishLocation } from '../hooks/usePublishLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { setDriverAvailability } from '../services/drivers';
import { getAvailability, saveAvailability } from '../services/preferences';
import { acceptTrip, rejectTrip } from '../services/trips';
import { colors, spacing, typography } from '../theme';

const INITIAL_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.02, longitudeDelta: 0.02 };

export default function MapScreen() {
  const { t } = useLanguage();
  const { driverId, isApproved } = useSession();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const activeTrip = useActiveTrip();
  const shownTripId = useRef(null);
  const mapRef = useRef(null);
  const [available, setAvailable] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const working = isApproved && available && !activeTrip;
  const { location, error: locationError } = useLocation();
  usePublishLocation({ driverId, publish: working, location });
  const { currentRequest } = useTripRequests({ driverId, enabled: working });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Recupera el último estado y lo sincroniza con Firestore (la app pudo cerrarse estando Disponible)
  useEffect(() => {
    let active = true;
    getAvailability().then((stored) => {
      if (!active || !stored || !isApproved) return;
      setAvailable(true);
      setDriverAvailability(driverId, true).catch((err) => console.warn('setDriverAvailability', err));
    });
    return () => {
      active = false;
    };
  }, [driverId, isApproved]);

  const handleToggle = useCallback(
    async (next) => {
      setAvailabilityError('');
      setAvailable(next);
      try {
        await setDriverAvailability(driverId, next);
        saveAvailability(next);
      } catch (err) {
        console.warn('setDriverAvailability', err);
        setAvailable(!next);
        setAvailabilityError('availability.failed');
      }
    },
    [driverId]
  );

  const [initialRegion] = useState(() =>
    location ? { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 } : INITIAL_REGION
  );

  // El mapa sigue al conductor cada vez que llega una posición nueva
  useEffect(() => {
    if (!location) return;
    mapRef.current?.animateToRegion(
      { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500
    );
  }, [location]);

  // Al aceptar (o al reabrir la app con un viaje en curso) se abre la pantalla del viaje, una sola vez por viaje
  useEffect(() => {
    if (!activeTrip || shownTripId.current === activeTrip.id) return;
    shownTripId.current = activeTrip.id;
    navigation.navigate('ActiveTrip', { tripId: activeTrip.id });
  }, [activeTrip, navigation]);

  const handleReject = useCallback(
    async (tripId) => {
      setError('');
      try {
        await rejectTrip(tripId, driverId);
      } catch (err) {
        console.warn('rejectTrip', err);
      }
    },
    [driverId]
  );

  const handleAccept = useCallback(
    async (tripId) => {
      setBusy(true);
      setError('');
      try {
        await acceptTrip(tripId, driverId);
      } catch (err) {
        setError(
          err.message === 'trip-taken'
            ? 'request.taken'
            : 'request.acceptFailed'
        );
      } finally {
        setBusy(false);
      }
    },
    [driverId]
  );

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation showsMyLocationButton />
      <View style={styles.toggleWrapper}>
        <AvailabilityToggle available={available} onChange={handleToggle} disabled={!isApproved} error={availabilityError} />
      </View>
      {locationError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{t(locationError)}</Text>
        </View>
      ) : null}
      {currentRequest ? (
        <View style={[styles.cardWrapper, { bottom: insets.bottom + 16 }]}>
          <TripRequestCard trip={currentRequest} onAccept={handleAccept} onReject={handleReject} busy={busy} error={error} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  toggleWrapper: { position: 'absolute', top: spacing.md, left: 16, right: 16 },
  banner: { position: 'absolute', top: 96, left: 16, right: 16, backgroundColor: colors.error, borderRadius: 8, padding: spacing.sm },
  bannerText: { ...typography.error, color: colors.textoPrimario, textAlign: 'center' },
  cardWrapper: { position: 'absolute', left: 16, right: 16 },
});
