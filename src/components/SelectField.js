import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

// Campo compacto de 44 px. Las opciones se muestran en una hoja inferior con una lista propia, igual en iOS y Android
// (el Picker nativo cambia de aspecto según la plataforma y en iOS ocupa mucho espacio).
export default function SelectField({ label, value, options, onChange, error, placeholder }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const text = (option) => (option.labelKey ? t(option.labelKey) : option.label);
  const placeholderText = placeholder || t('common.selectOption');
  const selected = options.find((option) => option.value === value);

  const choose = (next) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.box, error ? styles.boxError : null]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={[styles.value, !selected ? styles.placeholder : null]} numberOfLines={1}>
          {selected ? text(selected) : placeholderText}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.texto} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{label}</Text>
          <ScrollView bounces={false}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}
                  onPress={() => choose(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>{text(option)}</Text>
                  {isSelected ? <Ionicons name="checkmark" size={20} color={colors.texto} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.sm },
  label: { ...typography.etiqueta, fontSize: 13, color: colors.texto, marginBottom: spacing.xs },
  box: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.superficie,
    borderWidth: 2,
    borderColor: colors.superficie,
    borderRadius: radius.md,
  },
  boxError: { borderColor: colors.error },
  value: { ...typography.texto, fontSize: 15, color: colors.texto, flex: 1, marginRight: spacing.sm },
  placeholder: { color: colors.textoDeshabilitado },
  error: { ...typography.error, color: colors.error, marginTop: spacing.xs },
  backdrop: { flex: 1, backgroundColor: '#00000066' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '60%',
    backgroundColor: colors.fondo,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetTitle: { ...typography.etiqueta, fontSize: 16, color: colors.texto, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, height: 48 },
  optionPressed: { backgroundColor: colors.superficie },
  optionText: { ...typography.texto, color: colors.texto },
  optionTextSelected: { fontWeight: '700' },
});
