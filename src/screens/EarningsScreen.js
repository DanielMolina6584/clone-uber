import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import InfoRow from '../components/InfoRow';
import { useLanguage } from '../context/LanguageContext';
import { useEarnings } from '../hooks/useEarnings';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/formatters';

const PERIODS = [
  { key: 'today', title: 'earnings.today' },
  { key: 'week', title: 'earnings.week' },
  { key: 'month', title: 'earnings.month' },
];

export default function EarningsScreen() {
  const { t } = useLanguage();
  const earnings = useEarnings();

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.content}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('earnings.balance')}</Text>
        <Text style={styles.balanceValue}>{formatCurrency(earnings.balance)}</Text>
        <Text style={styles.balanceHint}>
          {t('earnings.balanceHint')}
        </Text>
      </View>

      {earnings.loading ? <ActivityIndicator color={colors.texto} /> : null}
      {earnings.error ? <Text style={styles.error}>{t(earnings.error)}</Text> : null}

      {PERIODS.map(({ key, title }) => {
        const summary = earnings[key];
        return (
          <View key={key} style={styles.card}>
            <Text style={styles.cardTitle}>{t(title)}</Text>
            <InfoRow label={t('earnings.trips')} value={String(summary.count)} />
            <InfoRow label={t('earnings.billed')} value={formatCurrency(summary.billed)} />
            <InfoRow label={t('earnings.commissions')} value={formatCurrency(summary.commissions)} />
            <InfoRow label={t('earnings.tips')} value={formatCurrency(summary.tips)} />
            <InfoRow label={t('earnings.net')} value={formatCurrency(summary.net)} strong />
            <InfoRow label={t('earnings.average')} value={formatCurrency(summary.average)} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.lg },
  balanceCard: { backgroundColor: colors.primario, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  balanceLabel: { ...typography.etiqueta, color: colors.textoPrimario },
  balanceValue: { ...typography.titulo, color: colors.textoPrimario, marginTop: spacing.xs },
  balanceHint: { ...typography.error, color: colors.deshabilitado, marginTop: spacing.sm },
  card: { backgroundColor: colors.superficie, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { ...typography.etiqueta, fontSize: 18, color: colors.texto, marginBottom: spacing.xs },
  error: { ...typography.error, color: colors.error, marginBottom: spacing.md },
});
