import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import { colors, spacing, typography } from '../theme';
import { validateFullName, validateIdNumber, validatePhone } from '../utils/validators';

const validators = {
  fullName: validateFullName,
  idNumber: validateIdNumber,
  phone: validatePhone,
};

export default function PersonalDataScreen() {
  const [form, setForm] = useState({ fullName: '', idNumber: '', phone: '' });
  const [touched, setTouched] = useState({});

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const errorOf = (field) => (touched[field] ? validators[field](form[field]) : '');
  const onlyDigits = (value) => value.replace(/\D/g, '');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Datos personales</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.md },
  title: { ...typography.titulo, color: colors.texto, marginBottom: spacing.lg },
});
