import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export default function PendingApprovalScreen({ name }) {
  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={72} color={colors.texto} />
      <Text style={styles.title}>Registro enviado</Text>
      <Text style={styles.text}>
        {`${name ? `${name}, tu` : 'Tu'} cuenta está en estado Pendiente de aprobación. Podrás ponerte Disponible cuando sea Aprobada.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.fondo },
  title: { ...typography.titulo, color: colors.texto, marginTop: spacing.md, textAlign: 'center' },
  text: { ...typography.subtitulo, color: colors.textoSecundario, marginTop: spacing.sm, textAlign: 'center' },
});
