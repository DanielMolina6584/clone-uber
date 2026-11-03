import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import RegistrationHeader from '../components/RegistrationHeader';
import SelectField from '../components/SelectField';
import { VEHICLE_CATEGORIES } from '../data/options';
import { colors, spacing } from '../theme';
import { normalizePlate, validateCategory, validatePlate, validateVehicleText } from '../utils/validators';

// Mitad pendiente: year, color, capacity (XL exige mínimo 6) y vehiclePhotoUri
const validators = {
  category: validateCategory,
  plate: validatePlate,
  brand: validateVehicleText,
  model: validateVehicleText,
};

const INITIAL_FORM = { category: '', plate: '', brand: '', model: '' };

export default function VehicleScreen({ onContinue, onBack }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field) => (touched[field] ? validators[field](form[field]) : '');

  const isValid = useMemo(
    () => Object.keys(validators).every((field) => !validators[field](form[field])),
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
            title="Tu vehículo"
            subtitle="Registra el vehículo con el que vas a recibir viajes."
          />

          <SelectField
            label="Categoría"
            value={form.category}
            options={VEHICLE_CATEGORIES}
            onChange={(v) => {
              setField('category', v);
              touch('category');
            }}
            error={errorOf('category')}
            placeholder="Selecciona una categoría"
          />
          <FormField
            label="Placa"
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
            label="Marca"
            value={form.brand}
            onChangeText={(v) => setField('brand', v)}
            onBlur={() => touch('brand')}
            error={errorOf('brand')}
            maxLength={30}
            autoCapitalize="words"
          />
          <FormField
            label="Modelo"
            value={form.model}
            onChangeText={(v) => setField('model', v)}
            onBlur={() => touch('model')}
            error={errorOf('model')}
            maxLength={30}
            autoCapitalize="words"
          />

          <View style={styles.footer}>
            <PrimaryButton title="Continuar" onPress={handleContinue} disabled={!isValid} />
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
