import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

export default function SegmentedControl({ label, options, value, onChange }) {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.segment, selected ? styles.segmentSelected : null]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.segmentText, selected ? styles.segmentTextSelected : null]}>{option.labelKey ? t(option.labelKey) : option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.sm },
  label: { ...typography.etiqueta, fontSize: 13, color: colors.texto, marginBottom: spacing.xs },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    padding: 2,
  },
  segment: { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md - 2 },
  segmentSelected: { backgroundColor: colors.primario },
  segmentText: { ...typography.boton, fontSize: 13, color: colors.texto },
  segmentTextSelected: { color: colors.textoPrimario },
});
