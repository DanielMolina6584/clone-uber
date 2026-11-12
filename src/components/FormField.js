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
  container: { marginBottom: spacing.sm },
  label: { ...typography.etiqueta, fontSize: 13, color: colors.texto, marginBottom: spacing.xs },
  input: {
    ...typography.texto,
    fontSize: 15,
    color: colors.texto,
    backgroundColor: colors.superficie,
    borderWidth: 2,
    borderColor: colors.superficie,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  inputError: { borderColor: colors.error },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs },
});
