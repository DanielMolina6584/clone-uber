import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { useLanguage } from '../context/LanguageContext';
import { DRIVER_STATUS } from '../services/drivers';
import { colors, spacing, typography } from '../theme';

export default function PendingApprovalScreen({ name, status = DRIVER_STATUS.pending, onSignOut }) {
  const { t } = useLanguage();
  const approved = status === DRIVER_STATUS.approved;
  return (
    <View style={styles.container}>
      <Ionicons name={approved ? 'checkmark-circle-outline' : 'time-outline'} size={72} color={colors.texto} />
      <Text style={styles.title}>{approved ? t('pending.approvedTitle') : t('pending.sent')}</Text>
      <Text style={styles.text}>
        {approved
          ? t(name ? 'pending.approvedNamed' : 'pending.approved', { name })
          : t(name ? 'pending.waitingNamed' : 'pending.waiting', { name })}
      </Text>
      {onSignOut ? (
        <View style={styles.action}>
          <PrimaryButton title={t('common.signOut')} onPress={onSignOut} variant="secondary" />
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
