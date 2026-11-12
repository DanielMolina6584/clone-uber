import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import InfoRow from '../components/InfoRow';
import PaymentBadge from '../components/PaymentBadge';
import TripStatusBadge from '../components/TripStatusBadge';
import { useLanguage } from '../context/LanguageContext';
import { subscribeTrip } from '../services/trips';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency, formatDateTime, formatDistance, formatDuration } from '../utils/formatters';
import { tripDate } from '../utils/trips';

const toCoordinate = (point) => ({ latitude: point.lat, longitude: point.lng });

export default function TripDetailScreen({ route }) {
  const { tripId } = route.params;
  const { t, language } = useLanguage();
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
  if (!trip) return <Text style={styles.empty}>{t('tripInfo.notFound')}</Text>;

  const cancelled = trip.status === 'cancelled';

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
        <Marker coordinate={toCoordinate(trip.origin)} title={t('trip.originMarker')} pinColor={colors.exito} />
        <Marker coordinate={toCoordinate(trip.destination)} title={t('trip.destinationMarker')} pinColor={colors.error} />
      </MapView>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{t('tripInfo.status')}</Text>
        <TripStatusBadge trip={trip} />
      </View>
      <Text style={styles.date}>{formatDateTime(tripDate(trip), language)}</Text>
      <Text style={styles.route}>{`${trip.origin.address} → ${trip.destination.address}`}</Text>

      <View style={styles.card}>
        <InfoRow label={t('tripInfo.category')} value={t(`category.${trip.category}`)} />
        <InfoRow label={t('tripInfo.duration')} value={formatDuration(trip.durationMin)} />
        <InfoRow label={t('tripInfo.distance')} value={formatDistance(trip.distanceKm, language)} />
        <InfoRow label={t('tripInfo.fare')} value={formatCurrency(trip.fare)} />
        {cancelled ? (
          <InfoRow label={t('tripInfo.cancelledBy')} value={t(trip.cancelledBy === 'driver' ? 'cancelledBy.driver' : 'cancelledBy.passenger')} />
        ) : (
          <>
            <InfoRow label={t('tripInfo.commission', { percent: Math.round((trip.commissionRate || 0) * 100) })} value={formatCurrency(trip.commission)} />
            <InfoRow label={t('tripInfo.tip')} value={formatCurrency(trip.tip || 0)} />
            <InfoRow label={t('tripInfo.net')} value={formatCurrency(trip.driverEarnings)} strong />
            <InfoRow label={t('tripInfo.rating')} value={trip.rating ? t('tripInfo.ratingValue', { rating: trip.rating }) : t('tripInfo.unrated')} />
          </>
        )}
      </View>

      {cancelled ? null : (
      <View style={styles.card}>
        <InfoRow label={t('tripInfo.method')} value={t(`method.${trip.paymentMethod}`)} />
        <View style={styles.badgeRow}>
          <Text style={styles.badgeLabel}>{t('tripInfo.paymentStatus')}</Text>
          <PaymentBadge trip={trip} />
        </View>
      </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.lg },
  loading: { marginTop: spacing.xl },
  map: { height: 220, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  statusLabel: { ...typography.texto, color: colors.textoSecundario },
  date: { ...typography.etiqueta, color: colors.textoSecundario },
  route: { ...typography.texto, color: colors.texto, marginVertical: spacing.sm },
  card: { backgroundColor: colors.superficie, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  badgeLabel: { ...typography.texto, color: colors.textoSecundario },
  empty: { ...typography.subtitulo, color: colors.textoSecundario, textAlign: 'center', marginTop: spacing.xl },
});
