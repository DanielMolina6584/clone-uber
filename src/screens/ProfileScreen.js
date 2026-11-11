import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import FormField from '../components/FormField';
import InfoRow from '../components/InfoRow';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import SelectField from '../components/SelectField';
import { LANGUAGES, VEHICLE_COLORS } from '../data/options';
import { useSession } from '../context/SessionContext';
import { updateDriverProfile } from '../services/drivers';
import { saveLanguage } from '../services/preferences';
import { colors, radius, spacing, typography } from '../theme';
import { formatDate } from '../utils/formatters';
import { toDate } from '../utils/dates';
import { validateCapacity, validateColor, validateEmail, validateFullName, validatePhone, validateVehicleText } from '../utils/validators';
import { CATEGORY_LABELS } from '../utils/trips';

const validators = {
  fullName: validateFullName,
  phone: validatePhone,
  email: validateEmail,
  brand: validateVehicleText,
  model: validateVehicleText,
  color: validateColor,
  capacity: validateCapacity,
  mercadoPagoEmail: validateEmail,
};

const buildForm = (driver) => ({
  fullName: driver?.personal?.fullName || '',
  phone: driver?.personal?.phone || '',
  email: driver?.personal?.email || '',
  language: driver?.personal?.language || 'es',
  brand: driver?.vehicle?.brand || '',
  model: driver?.vehicle?.model || '',
  color: driver?.vehicle?.color || '',
  capacity: String(driver?.vehicle?.capacity || ''),
  mercadoPagoEmail: driver?.documents?.mercadoPagoEmail || '',
});

const dateText = (value) => {
  const date = toDate(value);
  return date ? formatDate(date) : 'No aplica';
};

export default function ProfileScreen() {
  const { driver } = useSession();
  const [form, setForm] = useState(() => buildForm(driver));
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (driver && !Object.keys(touched).length) setForm(buildForm(driver));
  }, [driver, touched]);

  const context = useMemo(() => ({ category: driver?.vehicle?.category }), [driver]);
  const setField = (field, value) => {
    setMessage('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field) => (touched[field] ? validators[field](form[field], context) : '');
  const onlyDigits = (value) => value.replace(/\D/g, '');

  const handleSave = useCallback(async () => {
    const allTouched = Object.keys(validators).reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    if (Object.keys(validators).some((field) => validators[field](form[field], context))) return;
    setSaving(true);
    setSaveError('');
    setMessage('');
    try {
      await updateDriverProfile(driver.id, {
        'personal.fullName': form.fullName.trim(),
        'personal.phone': form.phone,
        'personal.email': form.email.trim(),
        'personal.language': form.language,
        'vehicle.brand': form.brand.trim(),
        'vehicle.model': form.model.trim(),
        'vehicle.color': form.color,
        'vehicle.capacity': form.capacity,
        'documents.mercadoPagoEmail': form.mercadoPagoEmail.trim(),
      });
      setMessage('Cambios guardados');
    } catch (error) {
      console.warn('updateDriverProfile', error);
      setSaveError('No pudimos guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [driver, form, context]);

  if (!driver) return null;
  const documents = driver.documents || {};

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Datos personales</Text>
        <FormField label="Nombre completo" value={form.fullName} onChangeText={(v) => setField('fullName', v)} onBlur={() => touch('fullName')} error={errorOf('fullName')} maxLength={50} autoCapitalize="words" />
        <FormField label="Número de celular" value={form.phone} onChangeText={(v) => setField('phone', onlyDigits(v))} onBlur={() => touch('phone')} error={errorOf('phone')} keyboardType="phone-pad" maxLength={10} />
        <FormField label="Correo electrónico" value={form.email} onChangeText={(v) => setField('email', v)} onBlur={() => touch('email')} error={errorOf('email')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <SegmentedControl
          label="Idioma"
          options={LANGUAGES}
          value={form.language}
          onChange={(v) => {
            setField('language', v);
            saveLanguage(v);
          }}
        />

        <Text style={styles.section}>Vehículo</Text>
        <View style={styles.card}>
          <InfoRow label="Categoría" value={CATEGORY_LABELS[driver.vehicle?.category] || ''} />
          <InfoRow label="Placa" value={driver.vehicle?.plate || ''} />
          <InfoRow label="Año" value={String(driver.vehicle?.year || '')} />
        </View>
        <FormField label="Marca" value={form.brand} onChangeText={(v) => setField('brand', v)} onBlur={() => touch('brand')} error={errorOf('brand')} maxLength={30} />
        <FormField label="Modelo" value={form.model} onChangeText={(v) => setField('model', v)} onBlur={() => touch('model')} error={errorOf('model')} maxLength={30} />
        <SelectField label="Color" value={form.color} options={VEHICLE_COLORS} onChange={(v) => { setField('color', v); touch('color'); }} error={errorOf('color')} />
        <FormField label="Capacidad de pasajeros" value={form.capacity} onChangeText={(v) => setField('capacity', onlyDigits(v))} onBlur={() => touch('capacity')} error={errorOf('capacity')} keyboardType="numeric" maxLength={2} />

        <Text style={styles.section}>Documentos y pagos</Text>
        <View style={styles.card}>
          <InfoRow label="Licencia, vence" value={dateText(documents.licenseExpiry)} />
          <InfoRow label="SOAT, vence" value={dateText(documents.soatExpiry)} />
          <InfoRow label="Técnico-mecánica, vence" value={dateText(documents.techInspectionExpiry)} />
        </View>
        <FormField label="Correo de Mercado Pago" value={form.mercadoPagoEmail} onChangeText={(v) => setField('mercadoPagoEmail', v)} onBlur={() => touch('mercadoPagoEmail')} error={errorOf('mercadoPagoEmail')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

        {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <View style={styles.actions}>
          <PrimaryButton title={saving ? 'Guardando...' : 'Guardar cambios'} onPress={handleSave} disabled={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  section: { ...typography.etiqueta, fontSize: 18, color: colors.texto, marginVertical: spacing.md },
  card: { backgroundColor: colors.superficie, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  error: { ...typography.error, color: colors.error },
  success: { ...typography.etiqueta, color: colors.exito },
});
