import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { formatDate } from '../utils/formatters';

export default function DateField({ label, value, onChange, onClose, error, maximumDate, initialDate }) {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const handleChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'set' && selected) onChange(selected);
      onClose?.();
      return;
    }
    if (selected) onChange(selected);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.field, error ? styles.fieldError : null]}
        onPress={() => (open ? close() : setOpen(true))}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={value ? styles.value : styles.placeholder}>{value ? formatDate(value) : 'DD/MM/AAAA'}</Text>
        <Ionicons name="calendar-outline" size={20} color={colors.texto} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value || initialDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.etiqueta, color: colors.texto, marginBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.superficie,
    borderWidth: 2,
    borderColor: colors.superficie,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  fieldError: { borderColor: colors.error },
  value: { ...typography.texto, color: colors.texto },
  placeholder: { ...typography.texto, color: colors.textoDeshabilitado },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs },
});
