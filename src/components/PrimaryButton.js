import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '../theme';

export default function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, disabled ? styles.disabled : null, pressed && !disabled ? styles.pressed : null]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[styles.text, disabled ? styles.textDisabled : null]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: colors.primario,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: colors.deshabilitado },
  text: { ...typography.boton, color: colors.textoPrimario },
  textDisabled: { color: colors.textoDeshabilitado },
});
