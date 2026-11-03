import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

const TOTAL_STEPS = 3;

export default function RegistrationHeader({ step, title, subtitle, onBack }) {
  return (
    <View>
      {onBack ? (
        <Pressable style={styles.back} onPress={onBack} accessibilityRole="button" accessibilityLabel="Volver al paso anterior" hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.texto} />
        </Pressable>
      ) : null}
      <View style={styles.steps}>
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <View key={index} style={[styles.step, index < step ? styles.stepActive : null]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>{`Paso ${step} de ${TOTAL_STEPS}`}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginBottom: spacing.md },
  steps: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  step: { flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: colors.borde },
  stepActive: { backgroundColor: colors.primario },
  stepLabel: { ...typography.etiqueta, color: colors.textoSecundario, marginBottom: spacing.md },
  title: { ...typography.titulo, color: colors.texto },
  subtitle: { ...typography.subtitulo, color: colors.textoSecundario, marginTop: spacing.sm, marginBottom: spacing.lg },
});
