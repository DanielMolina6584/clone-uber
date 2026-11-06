import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateField from '../components/DateField';
import FormField from '../components/FormField';
import PhotoPicker from '../components/PhotoPicker';
import PrimaryButton from '../components/PrimaryButton';
import RegistrationHeader from '../components/RegistrationHeader';
import SegmentedControl from '../components/SegmentedControl';
import SelectField from '../components/SelectField';
import { GENDERS, LANGUAGES } from '../data/options';
import { getLanguage, saveLanguage } from '../services/preferences';
import { colors, spacing, typography } from '../theme';
import {
  validateBirthDate,
  validateEmail,
  validateFullName,
  validateGender,
  validateIdNumber,
  validateLanguage,
  validatePhone,
  validatePhoto,
} from '../utils/validators';

const validators = {
  photoUri: validatePhoto,
  fullName: validateFullName,
  idNumber: validateIdNumber,
  phone: validatePhone,
  birthDate: validateBirthDate,
  gender: validateGender,
  email: validateEmail,
  language: validateLanguage,
};

const INITIAL_FORM = {
  photoUri: '',
  fullName: '',
  idNumber: '',
  phone: '',
  birthDate: null,
  gender: '',
  email: '',
  language: 'es',
};

const today = new Date();
const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

export default function PersonalDataScreen({ onContinue, onLogin }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    let active = true;
    getLanguage().then((stored) => {
      if (active && LANGUAGES.some((option) => option.value === stored)) setField('language', stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field) => (touched[field] ? validators[field](form[field]) : '');
  const onlyDigits = (value) => value.replace(/\D/g, '');

  const isValid = useMemo(
    () => Object.keys(validators).every((field) => !validators[field](form[field])),
    [form]
  );

  const handleContinue = () => {
    setTouched(Object.keys(validators).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    if (isValid) onContinue?.({ ...form, email: form.email.trim(), fullName: form.fullName.trim() });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <RegistrationHeader
            step={1}
            title="Datos personales"
            subtitle="Cuéntanos quién eres para empezar a conducir."
          />

          <PhotoPicker
            label="Agregar foto de perfil"
            uri={form.photoUri}
            onChange={(uri) => {
              setField('photoUri', uri);
              touch('photoUri');
            }}
            error={errorOf('photoUri')}
          />
          <FormField
            label="Nombre completo"
            value={form.fullName}
            onChangeText={(v) => setField('fullName', v)}
            onBlur={() => touch('fullName')}
            error={errorOf('fullName')}
            maxLength={50}
            autoCapitalize="words"
          />
          <FormField
            label="Documento de identidad"
            value={form.idNumber}
            onChangeText={(v) => setField('idNumber', onlyDigits(v))}
            onBlur={() => touch('idNumber')}
            error={errorOf('idNumber')}
            keyboardType="numeric"
            maxLength={10}
          />
          <FormField
            label="Número de celular"
            value={form.phone}
            onChangeText={(v) => setField('phone', onlyDigits(v))}
            onBlur={() => touch('phone')}
            error={errorOf('phone')}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <DateField
            label="Fecha de nacimiento"
            value={form.birthDate}
            onChange={(date) => setField('birthDate', date)}
            onClose={() => touch('birthDate')}
            error={errorOf('birthDate')}
            maximumDate={today}
            initialDate={eighteenYearsAgo}
          />
          <SelectField
            label="Género"
            value={form.gender}
            options={GENDERS}
            onChange={(v) => {
              setField('gender', v);
              touch('gender');
            }}
            error={errorOf('gender')}
          />
          <FormField
            label="Correo electrónico"
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            onBlur={() => touch('email')}
            error={errorOf('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <SegmentedControl
            label="Idioma"
            options={LANGUAGES}
            value={form.language}
            onChange={(v) => {
              setField('language', v);
              saveLanguage(v);
            }}
          />

          <View style={styles.footer}>
            <PrimaryButton title="Continuar" onPress={handleContinue} disabled={!isValid} />
            {onLogin ? (
              <Text style={styles.link} onPress={onLogin} accessibilityRole="link">
                Ya tengo cuenta
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  footer: { marginTop: spacing.md },
  link: { ...typography.etiqueta, color: colors.texto, textAlign: 'center', textDecorationLine: 'underline', marginTop: spacing.md },
});
