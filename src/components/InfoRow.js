import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function InfoRow({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong ? styles.strong : null]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: spacing.sm, gap: spacing.md },
  label: { ...typography.texto, color: colors.textoSecundario },
  value: { ...typography.texto, color: colors.texto, flexShrink: 1, textAlign: 'right' },
  strong: { fontWeight: '700' },
});
