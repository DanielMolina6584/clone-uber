import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import { useSession } from '../context/SessionContext';
import { findDriverByIdNumber } from '../services/drivers';
import { colors, spacing, typography } from '../theme';
import { validateIdNumber } from '../utils/validators';

export default function LoginScreen({ navigation }) {
  const { startSession } = useSession();
  const [idNumber, setIdNumber] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fieldError = touched ? validateIdNumber(idNumber) : '';

  const handleSubmit = async () => {
    setTouched(true);
    if (loading) return;
    if (validateIdNumber(idNumber)) return;
    setLoading(true);
    setSubmitError('');
    try {
      const id = await findDriverByIdNumber(idNumber);
      if (!id) {
        setSubmitError('No encontramos una cuenta con ese documento.');
        return;
      }
      await startSession(id);
    } catch (error) {
      console.warn('findDriverByIdNumber', error);
      setSubmitError('No pudimos buscar tu cuenta. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Ya tengo cuenta</Text>
          <Text style={styles.subtitle}>Ingresa tu documento de identidad para recuperar tu sesión.</Text>
          <FormField label="Documento de identidad" value={idNumber} onChangeText={(v) => setIdNumber(v.replace(/\D/g, ''))} onBlur={() => setTouched(true)} error={fieldError} keyboardType="numeric" maxLength={10} />
          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
          <PrimaryButton title={loading ? 'Buscando...' : 'Ingresar'} onPress={handleSubmit} disabled={loading} />
          <Text style={styles.link} onPress={() => navigation.goBack()} accessibilityRole="link">
            Volver al registro
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.lg },
  title: { ...typography.titulo, color: colors.texto },
  subtitle: { ...typography.subtitulo, color: colors.textoSecundario, marginVertical: spacing.md },
  error: { ...typography.error, color: colors.error, marginBottom: spacing.md },
  link: { ...typography.etiqueta, color: colors.texto, textAlign: 'center', textDecorationLine: 'underline', marginTop: spacing.lg },
});
