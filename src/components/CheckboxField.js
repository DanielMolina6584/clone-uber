import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export default function CheckboxField({ label, value, onChange, error }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.row}
        onPress={() => {
          Keyboard.dismiss();
          onChange(!value);
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!value }}
        hitSlop={8}
      >
        <View style={[styles.box, value ? styles.boxChecked : null, error ? styles.boxError : null]}>
          {value ? <Ionicons name="checkmark" size={18} color={colors.textoPrimario} /> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  box: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primario },
  boxError: { borderColor: colors.error },
  label: { ...typography.texto, color: colors.texto, flex: 1 },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs },
});
