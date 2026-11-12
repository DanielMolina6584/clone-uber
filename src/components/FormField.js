import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

const NUMERIC_KEYBOARDS = ['numeric', 'number-pad', 'phone-pad', 'decimal-pad'];
const ACCESSORY_ID = 'numericKeyboardDone';

// Los teclados numéricos de iOS no traen tecla para cerrarse: se agrega una barra con "Listo"
export default function FormField({ label, error, ...inputProps }) {
  const { t } = useLanguage();
  const needsDone = Platform.OS === 'ios' && NUMERIC_KEYBOARDS.includes(inputProps.keyboardType);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={colors.textoDeshabilitado}
        inputAccessoryViewID={needsDone ? ACCESSORY_ID : undefined}
        {...inputProps}
      />
      {needsDone ? (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View style={styles.accessory}>
            <Pressable onPress={Keyboard.dismiss} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.accessoryText}>{t('common.done')}</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}
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
  accessory: { alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.superficie, borderTopWidth: 1, borderTopColor: colors.borde },
  accessoryText: { ...typography.etiqueta, fontSize: 16, color: colors.texto },
  inputError: { borderColor: colors.error },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs },
});
