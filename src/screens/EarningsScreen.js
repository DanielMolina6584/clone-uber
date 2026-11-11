import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import InfoRow from '../components/InfoRow';
import { useEarnings } from '../hooks/useEarnings';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/formatters';

const PERIODS = [
  { key: 'today', title: 'Hoy' },
  { key: 'week', title: 'Esta semana' },
  { key: 'month', title: 'Este mes' },
];

export default function EarningsScreen() {
  const earnings = useEarnings();

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.content}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo del conductor</Text>
        <Text style={styles.balanceValue}>{formatCurrency(earnings.balance)}</Text>
        <Text style={styles.balanceHint}>
          Ganancias de viajes pagados por la pasarela menos comisiones de viajes en efectivo. Puede quedar negativo.
        </Text>
      </View>

      {earnings.loading ? <ActivityIndicator color={colors.texto} /> : null}
      {earnings.error ? <Text style={styles.error}>{earnings.error}</Text> : null}

      {PERIODS.map(({ key, title }) => {
        const summary = earnings[key];
        return (
          <View key={key} style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <InfoRow label="Viajes" value={String(summary.count)} />
            <InfoRow label="Total facturado" value={formatCurrency(summary.billed)} />
            <InfoRow label="Comisiones" value={formatCurrency(summary.commissions)} />
            <InfoRow label="Propinas" value={formatCurrency(summary.tips)} />
            <InfoRow label="Ganancia neta" value={formatCurrency(summary.net)} strong />
            <InfoRow label="Promedio por viaje" value={formatCurrency(summary.average)} />
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
