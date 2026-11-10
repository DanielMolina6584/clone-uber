import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TripRequestCard from '../components/TripRequestCard';
import { useSession } from '../context/SessionContext';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { acceptTrip, rejectTrip } from '../services/trips';
import { colors, spacing, typography } from '../theme';

const INITIAL_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.02, longitudeDelta: 0.02 };

export default function MapScreen() {
  const { driverId } = useSession();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { location, error: locationError } = useDriverLocation();
  // enabled pasará a depender del botón Disponible cuando exista
  const { currentRequest } = useTripRequests({ driverId, enabled: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // El mapa sigue al conductor cada vez que llega una posición nueva
  useEffect(() => {
    if (!location) return;
    mapRef.current?.animateToRegion(
      { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500
    );
  }, [location]);

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
            ? 'Otro conductor ya tomó esta solicitud o el pasajero la canceló.'
            : 'No pudimos aceptar el viaje. Revisa tu conexión e inténtalo de nuevo.'
        );
      } finally {
        setBusy(false);
      }
    },
    [driverId]
  );

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={INITIAL_REGION} showsUserLocation showsMyLocationButton />
      {locationError ? (
        <View style={[styles.banner, { top: spacing.md }]}>
          <Text style={styles.bannerText}>{locationError}</Text>
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
  banner: { position: 'absolute', left: 16, right: 16, backgroundColor: colors.error, borderRadius: 8, padding: spacing.sm },
  bannerText: { ...typography.error, color: colors.textoPrimario, textAlign: 'center' },
  cardWrapper: { position: 'absolute', left: 16, right: 16 },
});
