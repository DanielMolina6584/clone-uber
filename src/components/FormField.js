import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function FormField({ label, error, ...inputProps }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={colors.textoDeshabilitado}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.etiqueta, color: colors.texto, marginBottom: spacing.sm },
  input: {
    ...typography.texto,
    color: colors.texto,
    backgroundColor: colors.superficie,
    borderWidth: 2,
    borderColor: colors.superficie,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputError: { borderColor: colors.error },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs },
});
