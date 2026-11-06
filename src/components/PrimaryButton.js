import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '../theme';

export default function PrimaryButton({ title, onPress, disabled, variant = 'primary' }) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondary : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[styles.text, secondary ? styles.textSecondary : null, disabled ? styles.textDisabled : null]}>{title}</Text>
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
  secondary: { backgroundColor: colors.superficie },
  disabled: { backgroundColor: colors.deshabilitado },
  text: { ...typography.boton, color: colors.textoPrimario },
  textSecondary: { color: colors.texto },
  textDisabled: { color: colors.textoDeshabilitado },
});
