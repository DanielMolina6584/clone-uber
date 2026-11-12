import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function SegmentedControl({ label, options, value, onChange, compact }) {
  return (
    <View style={[styles.container, compact ? styles.containerCompact : null]}>
      <Text style={[styles.label, compact ? styles.labelCompact : null]}>{label}</Text>
      <View style={[styles.track, compact ? styles.trackCompact : null]}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.segment, compact ? styles.segmentCompact : null, selected ? styles.segmentSelected : null]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.segmentText, compact ? styles.segmentTextCompact : null, selected ? styles.segmentTextSelected : null]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.etiqueta, color: colors.texto, marginBottom: spacing.sm },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md - 2 },
  containerCompact: { marginBottom: spacing.sm },
  labelCompact: { fontSize: 12, marginBottom: spacing.xs },
  trackCompact: { padding: 2 },
  segmentCompact: { height: 32 },
  segmentTextCompact: { fontSize: 13 },
  segmentSelected: { backgroundColor: colors.primario },
  segmentText: { ...typography.boton, color: colors.texto },
  segmentTextSelected: { color: colors.textoPrimario },
});
