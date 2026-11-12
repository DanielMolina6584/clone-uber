import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_CONFIG } from '../config/app';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';
import { formatCurrency, formatDistance, formatDuration } from '../utils/formatters';
import PrimaryButton from './PrimaryButton';

export default function TripRequestCard({ trip, onAccept, onReject, busy, error }) {
  const { t, language } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(APP_CONFIG.requestTimeoutSeconds);
  const finished = useRef(false);

  const handleReject = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onReject(trip.id);
  }, [onReject, trip.id]);

  const handleAccept = useCallback(() => {
    if (finished.current) return;
    onAccept(trip.id);
  }, [onAccept, trip.id]);

  // Cada solicitud nueva reinicia el temporizador; al llegar a cero se rechaza sola
  useEffect(() => {
    finished.current = false;
    const deadline = Date.now() + APP_CONFIG.requestTimeoutSeconds * 1000;
    setSecondsLeft(APP_CONFIG.requestTimeoutSeconds);
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        handleReject();
      }
    }, 250);
    return () => clearInterval(timer);
  }, [trip.id, handleReject]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('request.title')}</Text>
        <View style={styles.timer} accessibilityLabel={t('request.timeLeft', { seconds: secondsLeft })}>
          <Text style={styles.timerText}>{secondsLeft}</Text>
        </View>
      </View>

      <Text style={styles.label}>{t('request.pickup')}</Text>
      <Text style={styles.address} numberOfLines={2}>{trip.origin?.address}</Text>
      <Text style={[styles.label, styles.spaced]}>{t('request.destination')}</Text>
      <Text style={styles.address} numberOfLines={2}>{trip.destination?.address}</Text>

      <View style={styles.summary}>
        <Text style={styles.detail}>{formatDistance(trip.distanceKm, language)} · {formatDuration(trip.durationMin)}</Text>
        <Text style={styles.fare}>{formatCurrency(trip.fare)}</Text>
      </View>
      <Text style={styles.net}>{t('request.net', { amount: formatCurrency(trip.driverEarnings) })}</Text>

      {error ? <Text style={styles.error}>{t(error)}</Text> : null}
      <View style={styles.actions}>
        <View style={styles.action}>
          <PrimaryButton title={t('request.reject')} variant="secondary" onPress={handleReject} />
        </View>
        <View style={styles.action}>
          <PrimaryButton title={busy ? t('request.accepting') : t('request.accept')} onPress={handleAccept} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.fondo, borderRadius: radius.md, padding: spacing.md, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { ...typography.etiqueta, fontSize: 20, color: colors.texto },
  timer: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.primario, alignItems: 'center', justifyContent: 'center' },
  timerText: { ...typography.boton, fontSize: 18, color: colors.textoPrimario },
  label: { ...typography.etiqueta, color: colors.textoSecundario },
  spaced: { marginTop: spacing.sm },
  address: { ...typography.texto, color: colors.texto, marginTop: spacing.xs },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  detail: { ...typography.texto, color: colors.textoSecundario },
  fare: { ...typography.etiqueta, fontSize: 20, color: colors.texto },
  net: { ...typography.error, color: colors.exito, marginTop: spacing.xs },
  error: { ...typography.error, color: colors.error, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
});
