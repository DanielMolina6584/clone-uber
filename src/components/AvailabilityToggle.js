import { StyleSheet, Switch, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';

export default function AvailabilityToggle({ available, onChange, disabled, error }) {
  const { t } = useLanguage();
  return (
    <View>
      <View style={styles.pill}>
        <View style={[styles.dot, { backgroundColor: available ? colors.exito : colors.textoDeshabilitado }]} />
        <Text style={styles.label}>{available ? t('availability.available') : t('availability.unavailable')}</Text>
        <Switch
          value={available}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: colors.borde, true: colors.exito }}
          thumbColor={colors.fondo}
          accessibilityLabel={t('availability.switchLabel')}
        />
      </View>
      {disabled ? <Text style={styles.hint}>{t('availability.hint')}</Text> : null}
      {error ? <Text style={styles.error}>{t(error)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    backgroundColor: colors.fondo,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  label: { ...typography.etiqueta, color: colors.texto },
  hint: { ...typography.error, color: colors.textoSecundario, textAlign: 'center', marginTop: spacing.xs },
  error: { ...typography.error, color: colors.error, textAlign: 'center', marginTop: spacing.xs },
});
