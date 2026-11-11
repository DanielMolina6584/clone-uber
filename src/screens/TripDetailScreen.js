import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import InfoRow from '../components/InfoRow';
import PaymentBadge from '../components/PaymentBadge';
import { subscribeTrip } from '../services/trips';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency, formatDateTime, formatDistance, formatDuration } from '../utils/formatters';
import { CATEGORY_LABELS, PAYMENT_METHODS, tripDate } from '../utils/trips';

const toCoordinate = (point) => ({ latitude: point.lat, longitude: point.lng });

export default function TripDetailScreen({ route }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef(null);

  useEffect(
    () =>
      subscribeTrip(
        tripId,
        (data) => {
          setTrip(data);
          setLoaded(true);
        },
        () => setLoaded(true)
      ),
    [tripId]
  );

  // Todavía no se guarda la ruta recorrida: se dibuja la línea recta entre origen y destino
  useEffect(() => {
    if (trip && mapRef.current) {
      mapRef.current.fitToCoordinates([toCoordinate(trip.origin), toCoordinate(trip.destination)], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: false,
      });
    }
  }, [trip]);

  if (!loaded) return <ActivityIndicator style={styles.loading} color={colors.texto} />;
  if (!trip) return <Text style={styles.empty}>No encontramos este viaje.</Text>;

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.content}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude: trip.origin.lat, longitude: trip.origin.lng, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Polyline coordinates={[toCoordinate(trip.origin), toCoordinate(trip.destination)]} strokeWidth={5} strokeColor={colors.texto} />
        <Marker coordinate={toCoordinate(trip.origin)} title="Origen" pinColor={colors.exito} />
        <Marker coordinate={toCoordinate(trip.destination)} title="Destino" pinColor={colors.error} />
      </MapView>

      <Text style={styles.date}>{formatDateTime(tripDate(trip))}</Text>
      <Text style={styles.route}>{`${trip.origin.address} → ${trip.destination.address}`}</Text>

      <View style={styles.card}>
        <InfoRow label="Categoría" value={CATEGORY_LABELS[trip.category]} />
        <InfoRow label="Duración" value={formatDuration(trip.durationMin)} />
        <InfoRow label="Distancia" value={formatDistance(trip.distanceKm)} />
        <InfoRow label="Tarifa" value={formatCurrency(trip.fare)} />
        <InfoRow label={`Comisión (${Math.round((trip.commissionRate || 0) * 100)} %)`} value={formatCurrency(trip.commission)} />
        <InfoRow label="Propina" value={formatCurrency(trip.tip || 0)} />
        <InfoRow label="Ganancia neta" value={formatCurrency(trip.driverEarnings)} strong />
        <InfoRow label="Calificación del pasajero" value={trip.rating ? `${trip.rating} de 5` : 'Sin calificar'} />
      </View>

      <View style={styles.card}>
        <InfoRow label="Método de pago" value={PAYMENT_METHODS[trip.paymentMethod]} />
        <View style={styles.badgeRow}>
          <Text style={styles.badgeLabel}>Estado del pago</Text>
          <PaymentBadge trip={trip} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.lg },
  loading: { marginTop: spacing.xl },
  map: { height: 220, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
  date: { ...typography.etiqueta, color: colors.textoSecundario },
  route: { ...typography.texto, color: colors.texto, marginVertical: spacing.sm },
  card: { backgroundColor: colors.superficie, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  badgeLabel: { ...typography.texto, color: colors.textoSecundario },
  empty: { ...typography.subtitulo, color: colors.textoSecundario, textAlign: 'center', marginTop: spacing.xl },
});
