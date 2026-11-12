import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing } from '../theme';
import { tripStatusLabel } from '../utils/trips';

const BADGE_COLORS = {
  'tripStatus.completed': { background: colors.exito, text: colors.textoPrimario },
  'tripStatus.paid': { background: colors.texto, text: colors.textoPrimario },
  'tripStatus.cancelled': { background: colors.error, text: colors.textoPrimario },
};

export default function TripStatusBadge({ trip }) {
  const { t } = useLanguage();
  const key = tripStatusLabel(trip);
  const palette = BADGE_COLORS[key];
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
