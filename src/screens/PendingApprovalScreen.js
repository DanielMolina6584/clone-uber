import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { DRIVER_STATUS } from '../services/drivers';
import { colors, spacing, typography } from '../theme';

export default function PendingApprovalScreen({ name, status = DRIVER_STATUS.pending, onSignOut }) {
  const approved = status === DRIVER_STATUS.approved;
  const greeting = name ? `${name}, tu` : 'Tu';
  return (
    <View style={styles.container}>
      <Ionicons name={approved ? 'checkmark-circle-outline' : 'time-outline'} size={72} color={colors.texto} />
      <Text style={styles.title}>{approved ? 'Cuenta aprobada' : 'Registro enviado'}</Text>
      <Text style={styles.text}>
        {approved
          ? `${greeting} cuenta fue aprobada. Pronto podrás ponerte Disponible y recibir viajes.`
          : `${greeting} cuenta está en estado Pendiente de aprobación. Podrás ponerte Disponible cuando sea Aprobada; esta pantalla se actualiza sola.`}
      </Text>
      {onSignOut ? (
        <View style={styles.action}>
          <PrimaryButton title="Cerrar sesión" onPress={onSignOut} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.fondo },
  title: { ...typography.titulo, color: colors.texto, marginTop: spacing.md, textAlign: 'center' },
  text: { ...typography.subtitulo, color: colors.textoSecundario, marginTop: spacing.sm, textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: spacing.xl },
});
