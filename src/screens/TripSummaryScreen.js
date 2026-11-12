import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InfoRow from '../components/InfoRow';
import PaymentBadge from '../components/PaymentBadge';
import PrimaryButton from '../components/PrimaryButton';
import { useLanguage } from '../context/LanguageContext';
import { subscribeTrip } from '../services/trips';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency, formatDistance, formatDuration } from '../utils/formatters';

export default function TripSummaryScreen({ navigation, route }) {
  const { t, language } = useLanguage();
  const [trip, setTrip] = useState(null);

  useEffect(() => subscribeTrip(route.params.tripId, setTrip, () => {}), [route.params.tripId]);

  if (!trip) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.texto} />
      </SafeAreaView>
    );
  }

  const isCash = trip.paymentMethod === 'cash';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('summary.title')}</Text>
        <Text style={styles.subtitle}>{`${trip.origin.address} → ${trip.destination.address}`}</Text>

        <View style={styles.card}>
          <InfoRow label={t('tripInfo.distance')} value={formatDistance(trip.distanceKm, language)} />
          <InfoRow label={t('tripInfo.duration')} value={formatDuration(trip.durationMin)} />
          <InfoRow label={t('summary.finalFare')} value={formatCurrency(trip.fare)} />
          <InfoRow label={t('tripInfo.commission', { percent: Math.round((trip.commissionRate || 0) * 100) })} value={`- ${formatCurrency(trip.commission)}`} />
          <InfoRow label={t('tripInfo.tip')} value={formatCurrency(trip.tip || 0)} />
          <InfoRow label={t('tripInfo.net')} value={formatCurrency(trip.driverEarnings)} strong />
        </View>

        <View style={styles.card}>
          <InfoRow label={t('tripInfo.method')} value={t(`method.${trip.paymentMethod}`)} />
          <View style={styles.badgeRow}>
            <Text style={styles.badgeLabel}>{t('tripInfo.paymentStatus')}</Text>
            <PaymentBadge trip={trip} />
          </View>
        </View>

        <Text style={styles.note}>
          {isCash
            ? t('summary.cashNote', { amount: formatCurrency(trip.fare + (trip.tip || 0)) })
            : t('summary.gatewayNote')}
        </Text>

        <PrimaryButton title={t('common.backHome')} onPress={() => navigation.popToTop()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fondo },
  content: { padding: spacing.lg },
  title: { ...typography.titulo, color: colors.texto },
  subtitle: { ...typography.subtitulo, color: colors.textoSecundario, marginTop: spacing.xs, marginBottom: spacing.md },
  card: { backgroundColor: colors.superficie, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  badgeLabel: { ...typography.texto, color: colors.textoSecundario },
  note: { ...typography.texto, color: colors.textoSecundario, marginBottom: spacing.md },
});
