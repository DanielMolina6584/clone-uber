import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing } from '../theme';
import { paymentLabel, paymentState } from '../utils/trips';

const BADGE_COLORS = {
  paid: { background: colors.exito, text: colors.textoPrimario },
  pending: { background: colors.superficie, text: colors.texto },
  rejected: { background: colors.error, text: colors.textoPrimario },
};

export default function PaymentBadge({ trip }) {
  const { t } = useLanguage();
  const key = paymentLabel(trip);
  const palette = BADGE_COLORS[paymentState(trip)];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <Text style={[styles.text, { color: palette.text }]}>{t(key)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.pill },
  text: { fontSize: 12, fontWeight: '700' },
});
