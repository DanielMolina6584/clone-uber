import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import PhotoPicker from '../components/PhotoPicker';
import PrimaryButton from '../components/PrimaryButton';
import RegistrationHeader from '../components/RegistrationHeader';
import SelectField from '../components/SelectField';
import { useLanguage } from '../context/LanguageContext';
import { VEHICLE_CATEGORIES, VEHICLE_COLORS } from '../data/options';
import { colors, spacing } from '../theme';
import {
  normalizePlate,
  validateCapacity,
  validateCategory,
  validateColor,
  validatePlate,
  validateVehiclePhoto,
  validateVehicleText,
  validateYear,
} from '../utils/validators';

// AI-assisted: see BITACORA.md #009
const validators = {
  category: validateCategory,
  plate: validatePlate,
  brand: validateVehicleText,
  model: validateVehicleText,
  year: validateYear,
  color: validateColor,
  capacity: validateCapacity,
  vehiclePhotoUri: validateVehiclePhoto,
};

const INITIAL_FORM = {
  category: '',
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  vehiclePhotoUri: '',
};

export default function VehicleScreen({ onContinue, onBack }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field) => t(touched[field] ? validators[field](form[field], form) : '');
  const onlyDigits = (value) => value.replace(/\D/g, '');

  const isValid = useMemo(
    () => Object.keys(validators).every((field) => !validators[field](form[field], form)),
    [form]
  );

  const handleContinue = () => {
    setTouched(Object.keys(validators).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    if (isValid) {
      onContinue?.({
        ...form,
        plate: normalizePlate(form.plate),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        capacity: Number(form.capacity),
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <RegistrationHeader
            step={2}
            onBack={onBack}
            title={t('vehicle.title')}
            subtitle={t('vehicle.subtitle')}
          />

          <SelectField
            label={t('vehicle.category')}
            value={form.category}
            options={VEHICLE_CATEGORIES}
            onChange={(v) => {
              setField('category', v);
              touch('category');
            }}
            error={errorOf('category')}
            placeholder={t('vehicle.selectCategory')}
          />
          <FormField
            label={t('vehicle.plate')}
            value={form.plate}
            onChangeText={(v) => setField('plate', normalizePlate(v))}
            onBlur={() => touch('plate')}
            error={errorOf('plate')}
            placeholder="ABC123"
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <FormField
            label={t('vehicle.brand')}
            value={form.brand}
            onChangeText={(v) => setField('brand', v)}
            onBlur={() => touch('brand')}
            error={errorOf('brand')}
            maxLength={30}
            autoCapitalize="words"
          />
          <FormField
            label={t('vehicle.model')}
            value={form.model}
            onChangeText={(v) => setField('model', v)}
            onBlur={() => touch('model')}
            error={errorOf('model')}
            maxLength={30}
            autoCapitalize="words"
          />
          <FormField
            label={t('vehicle.year')}
            value={form.year}
            onChangeText={(v) => setField('year', onlyDigits(v))}
            onBlur={() => touch('year')}
            error={errorOf('year')}
            placeholder={t('vehicle.yearPlaceholder')}
            keyboardType="numeric"
            maxLength={4}
          />
          <SelectField
            label={t('vehicle.color')}
            value={form.color}
            options={VEHICLE_COLORS}
            onChange={(v) => {
              setField('color', v);
              touch('color');
            }}
            error={errorOf('color')}
            placeholder={t('vehicle.selectColor')}
          />
          <FormField
            label={t('vehicle.capacity')}
            value={form.capacity}
            onChangeText={(v) => setField('capacity', onlyDigits(v))}
            onBlur={() => touch('capacity')}
            error={errorOf('capacity')}
            placeholder={form.category === 'xl' ? t('vehicle.minSix') : undefined}
            keyboardType="numeric"
            maxLength={2}
          />
          <PhotoPicker
            variant="card"
            title={t('vehicle.photoTitle')}
            label={t('vehicle.photoLabel')}
            uri={form.vehiclePhotoUri}
            onChange={(uri) => {
              setField('vehiclePhotoUri', uri);
              touch('vehiclePhotoUri');
            }}
            error={errorOf('vehiclePhotoUri')}
          />

          <View style={styles.footer}>
            <PrimaryButton title={t('common.continue')} onPress={handleContinue} disabled={!isValid} />
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
});
