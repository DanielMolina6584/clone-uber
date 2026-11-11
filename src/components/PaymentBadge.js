import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { paymentLabel } from '../utils/trips';

const BADGE_COLORS = {
  Aprobado: { background: colors.exito, text: colors.textoPrimario },
  Efectivo: { background: colors.texto, text: colors.textoPrimario },
  Pendiente: { background: colors.superficie, text: colors.texto },
  Rechazado: { background: colors.error, text: colors.textoPrimario },
};

export default function PaymentBadge({ trip }) {
  const label = paymentLabel(trip);
  const palette = BADGE_COLORS[label];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.pill },
  text: { fontSize: 12, fontWeight: '700' },
});
