import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, radius, spacing, typography } from '../theme';

export default function SelectField({ label, value, options, onChange, error, placeholder = 'Selecciona una opción' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, error ? styles.boxError : null]}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
          dropdownIconColor={colors.texto}
        >
          <Picker.Item label={placeholder} value="" color={colors.textoDeshabilitado} />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} color={colors.texto} />
          ))}
        </Picker>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.etiqueta, color: colors.texto, marginBottom: spacing.sm },
  box: {
    backgroundColor: colors.superficie,
    borderWidth: 2,
    borderColor: colors.superficie,
    borderRadius: radius.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boxError: { borderColor: colors.error },
  picker: { color: colors.texto },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs },
});
