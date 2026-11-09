import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TripRequestCard from '../components/TripRequestCard';
import { useSession } from '../context/SessionContext';
import { useTripRequests } from '../hooks/useTripRequests';
import { acceptTrip, rejectTrip } from '../services/trips';

const INITIAL_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.02, longitudeDelta: 0.02 };

export default function MapScreen() {
  const { driverId } = useSession();
  const insets = useSafeAreaInsets();
  // enabled pasará a depender del botón Disponible cuando exista
  const { currentRequest } = useTripRequests({ driverId, enabled: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
      <MapView style={styles.map} initialRegion={INITIAL_REGION} showsMyLocationButton />
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
  cardWrapper: { position: 'absolute', left: 16, right: 16 },
});
