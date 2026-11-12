import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CheckboxField from '../components/CheckboxField';
import DateField from '../components/DateField';
import FormField from '../components/FormField';
import PhotoPicker from '../components/PhotoPicker';
import PrimaryButton from '../components/PrimaryButton';
import RegistrationHeader from '../components/RegistrationHeader';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  const techRequired = isTechInspectionRequired(vehicleYear);
  const validators = useMemo(
    () => (techRequired ? { ...BASE_VALIDATORS, ...TECH_VALIDATORS } : BASE_VALIDATORS),
    [techRequired]
  );

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field) => t(touched[field] ? validators[field](form[field]) : '');
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
    label: t('documents.photoHint'),
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
            title={t('documents.title')}
            subtitle={t('documents.subtitle')}
          />

          <Text style={styles.section}>{t('documents.license')}</Text>
          <FormField
            label={t('documents.licenseNumber')}
            value={form.licenseNumber}
            onChangeText={(v) => setField('licenseNumber', onlyDigits(v))}
            onBlur={() => touch('licenseNumber')}
            error={errorOf('licenseNumber')}
            keyboardType="numeric"
            maxLength={10}
          />
          <PhotoPicker {...photoProps('licensePhotoUri', t('documents.licensePhoto'))} />
          <DateField {...dateProps('licenseExpiry', t('documents.licenseExpiry'))} />

          <Text style={styles.section}>{t('documents.soat')}</Text>
          <PhotoPicker {...photoProps('soatPhotoUri', t('documents.soatPhoto'))} />
          <DateField {...dateProps('soatExpiry', t('documents.soatExpiry'))} />

          <Text style={styles.section}>{t('documents.tech')}</Text>
          {techRequired ? (
            <>
              <PhotoPicker {...photoProps('techInspectionPhotoUri', t('documents.techPhoto'))} />
              <DateField {...dateProps('techInspectionExpiry', t('documents.techExpiry'))} />
            </>
          ) : (
            <Text style={styles.note}>
              {t('documents.techNotRequired', { year: vehicleYear })}
            </Text>
          )}

          <Text style={styles.section}>{t('documents.payments')}</Text>
          <FormField
            label={t('documents.mercadoPagoEmail')}
            value={form.mercadoPagoEmail}
            onChangeText={(v) => setField('mercadoPagoEmail', v)}
            onBlur={() => touch('mercadoPagoEmail')}
            error={errorOf('mercadoPagoEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <CheckboxField
            label={t('documents.terms', { percent: commissionPercent })}
            value={form.acceptedTerms}
            onChange={(v) => {
              setField('acceptedTerms', v);
              touch('acceptedTerms');
            }}
            error={errorOf('acceptedTerms')}
          />

          <View style={styles.footer}>
            <PrimaryButton
              title={submitting ? t('documents.submitting') : t('documents.submit')}
              onPress={handleSubmit}
              disabled={!isValid || submitting}
            />
            {submitError ? <Text style={styles.submitError}>{t(submitError)}</Text> : null}
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
