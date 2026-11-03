import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CheckboxField from '../components/CheckboxField';
import DateField from '../components/DateField';
import FormField from '../components/FormField';
import PhotoPicker from '../components/PhotoPicker';
import PrimaryButton from '../components/PrimaryButton';
import RegistrationHeader from '../components/RegistrationHeader';
import { PRICING } from '../config/pricing';
import { colors, spacing, typography } from '../theme';
import {
  isTechInspectionRequired,
  validateDocumentPhoto,
  validateEmail,
  validateExpiryDate,
  validateLicenseNumber,
  validateTerms,
} from '../utils/validators';

// AI-assisted: see BITACORA.md #010
const BASE_VALIDATORS = {
  licenseNumber: validateLicenseNumber,
  licensePhotoUri: validateDocumentPhoto,
  licenseExpiry: validateExpiryDate,
  soatPhotoUri: validateDocumentPhoto,
  soatExpiry: validateExpiryDate,
  mercadoPagoEmail: validateEmail,
  acceptedTerms: validateTerms,
};

const TECH_VALIDATORS = {
  techInspectionPhotoUri: validateDocumentPhoto,
  techInspectionExpiry: validateExpiryDate,
};

const INITIAL_FORM = {
  licenseNumber: '',
  licensePhotoUri: '',
  licenseExpiry: null,
  soatPhotoUri: '',
  soatExpiry: null,
  techInspectionPhotoUri: '',
  techInspectionExpiry: null,
  mercadoPagoEmail: '',
  acceptedTerms: false,
};

const today = new Date();
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
const commissionPercent = Math.round(PRICING.commissionRate * 100);

export default function DocumentsScreen({ vehicleYear, onBack, onSubmit, submitting, submitError }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  const techRequired = isTechInspectionRequired(vehicleYear);
  const validators = useMemo(
    () => (techRequired ? { ...BASE_VALIDATORS, ...TECH_VALIDATORS } : BASE_VALIDATORS),
    [techRequired]
  );

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field) => (touched[field] ? validators[field](form[field]) : '');
  const onlyDigits = (value) => value.replace(/\D/g, '');

  const isValid = useMemo(
    () => Object.keys(validators).every((field) => !validators[field](form[field])),
    [form, validators]
  );

  const handleSubmit = () => {
    setTouched(Object.keys(validators).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    if (!isValid || submitting) return;
    const documents = { ...form, mercadoPagoEmail: form.mercadoPagoEmail.trim(), commissionRate: PRICING.commissionRate };
    if (!techRequired) {
      documents.techInspectionPhotoUri = '';
      documents.techInspectionExpiry = null;
    }
    onSubmit?.(documents);
  };

  const photoProps = (field, title) => ({
    variant: 'card',
    title,
    label: 'Toma o elige una foto legible del documento',
    uri: form[field],
    onChange: (uri) => {
      setField(field, uri);
      touch(field);
    },
    error: errorOf(field),
  });

  const dateProps = (field, label) => ({
    label,
    value: form[field],
    onChange: (date) => setField(field, date),
    onClose: () => touch(field),
    error: errorOf(field),
    minimumDate: tomorrow,
    initialDate: tomorrow,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <RegistrationHeader
            step={3}
            onBack={onBack}
            title="Documentos y pagos"
            subtitle="Sube tus documentos vigentes y dinos dónde recibir tus pagos."
          />

          <Text style={styles.section}>Licencia de conducción</Text>
          <FormField
            label="Número de licencia"
            value={form.licenseNumber}
            onChangeText={(v) => setField('licenseNumber', onlyDigits(v))}
            onBlur={() => touch('licenseNumber')}
            error={errorOf('licenseNumber')}
            keyboardType="numeric"
            maxLength={10}
          />
          <PhotoPicker {...photoProps('licensePhotoUri', 'Foto de la licencia')} />
          <DateField {...dateProps('licenseExpiry', 'Fecha de vencimiento de la licencia')} />

          <Text style={styles.section}>SOAT</Text>
          <PhotoPicker {...photoProps('soatPhotoUri', 'Foto del SOAT')} />
          <DateField {...dateProps('soatExpiry', 'Fecha de vencimiento del SOAT')} />

          <Text style={styles.section}>Revisión técnico-mecánica</Text>
          {techRequired ? (
            <>
              <PhotoPicker {...photoProps('techInspectionPhotoUri', 'Foto de la revisión técnico-mecánica')} />
              <DateField {...dateProps('techInspectionExpiry', 'Fecha de vencimiento de la revisión')} />
            </>
          ) : (
            <Text style={styles.note}>
              {`Tu vehículo (${vehicleYear}) aún no requiere revisión técnico-mecánica.`}
            </Text>
          )}

          <Text style={styles.section}>Pagos</Text>
          <FormField
            label="Correo de tu cuenta de Mercado Pago"
            value={form.mercadoPagoEmail}
            onChangeText={(v) => setField('mercadoPagoEmail', v)}
            onBlur={() => touch('mercadoPagoEmail')}
            error={errorOf('mercadoPagoEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <CheckboxField
            label={`Acepto los términos y condiciones. La plataforma cobra una comisión del ${commissionPercent} % sobre la tarifa de cada viaje; las propinas son 100 % para mí.`}
            value={form.acceptedTerms}
            onChange={(v) => {
              setField('acceptedTerms', v);
              touch('acceptedTerms');
            }}
            error={errorOf('acceptedTerms')}
          />

          <View style={styles.footer}>
            <PrimaryButton
              title={submitting ? 'Enviando…' : 'Enviar registro'}
              onPress={handleSubmit}
              disabled={!isValid || submitting}
            />
            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  section: { ...typography.subtitulo, fontWeight: '700', color: colors.texto, marginTop: spacing.sm, marginBottom: spacing.md },
  note: { ...typography.texto, color: colors.textoSecundario, marginBottom: spacing.md },
  footer: { marginTop: spacing.md },
  submitError: { ...typography.error, color: colors.error, marginTop: spacing.sm, textAlign: 'center' },
});
