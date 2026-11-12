import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import { APP_CONFIG } from '../config/app';
import { PRICING } from '../config/pricing';
import { VEHICLE_CATEGORIES } from '../data/options';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { getDistanceMatrix, snapToRoad } from '../services/maps';
import { createTestTrip } from '../services/trips';
import { colors, spacing, typography } from '../theme';
import { calculateFare } from '../utils/calculateFare';
import { formatCurrency } from '../utils/formatters';

const METHODS = [
  { labelKey: 'method.mercadopagoShort', value: 'mercadopago' },
  { labelKey: 'method.cash', value: 'cash' },
];

const STREETS = ['Cl. 72', 'Cra. 15', 'Av. Caracas', 'Cl. 100', 'Cra. 7', 'Av. Boyacá', 'Cl. 26', 'Cra. 30'];

const randomBetween = (min, max) => min + Math.random() * (max - min);
const randomAddress = (suffix) =>
  `${STREETS[Math.floor(Math.random() * STREETS.length)]} # ${Math.floor(randomBetween(5, 90))}-${Math.floor(randomBetween(1, 99))} ${suffix}`;

// Desplazamiento aleatorio de entre minKm y maxKm en una dirección cualquiera
function offsetPoint(point, minKm, maxKm) {
  const km = randomBetween(minKm, maxKm);
  const angle = randomBetween(0, 2 * Math.PI);
  const dLat = (km * Math.cos(angle)) / 111;
  const dLng = (km * Math.sin(angle)) / (111 * Math.cos((point.lat * Math.PI) / 180));
  return { lat: point.lat + dLat, lng: point.lng + dLng };
}

export default function PassengerSimulatorScreen() {
  const { location, error: locationError } = useLocation();
  const { t } = useLanguage();
  const [category, setCategory] = useState('economy');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tip, setTip] = useState('0');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreate = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    setMessage('');
    setError('');
    try {
      // El pasajero aparece cerca del conductor; sin permiso de ubicación se usa Bogotá
      if (!location && !locationError) {
        setError(t('simulator.waitingLocation'));
        return;
      }
      const center = location || APP_CONFIG.defaultLocation;
      const originPoint = await snapToRoad(offsetPoint(center, 0.3, 1));
      const destinationPoint = await snapToRoad(offsetPoint(originPoint, 2, 5));
      const tipValue = Number(tip) || 0;

      // Lo que haría la app del pasajero: una consulta de distancia y duración al crear la solicitud
      const matrix = await getDistanceMatrix(originPoint, destinationPoint);
      const distanceKm = Math.round(matrix.distanceKm * 10) / 10;
      const durationMin = Math.round(matrix.durationMin);
      const money = calculateFare({ distanceKm, durationMin, category, tip: tipValue });

      const id = await createTestTrip({
        passengerId: 'simulated-passenger',
        origin: { ...originPoint, address: randomAddress(t('simulator.simulated')) },
        destination: { ...destinationPoint, address: randomAddress(t('simulator.simulated')) },
        distanceKm,
        durationMin,
        category,
        tip: tipValue,
        ...money,
        commissionRate: PRICING.commissionRate,
        paymentMethod,
      });
      setMessage(t('simulator.created', { id: id.slice(0, 6), fare: formatCurrency(money.fare) }));
    } catch (err) {
      console.warn('createTestTrip', err);
      setError(t('simulator.failed'));
    } finally {
      setCreating(false);
    }
  }, [creating, location, locationError, category, paymentMethod, tip, t]);

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.content}>
      <Text style={styles.warning}>{t('simulator.warning')}</Text>
      <SegmentedControl label={t('simulator.category')} options={VEHICLE_CATEGORIES} value={category} onChange={setCategory} />
      <SegmentedControl label={t('simulator.method')} options={METHODS} value={paymentMethod} onChange={setPaymentMethod} />
      <FormField label={t('simulator.tip')} value={tip} onChangeText={(v) => setTip(v.replace(/\D/g, ''))} keyboardType="numeric" maxLength={6} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <View style={styles.actions}>
        <PrimaryButton title={creating ? t('simulator.creating') : t('simulator.create')} onPress={handleCreate} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.lg },
  warning: { ...typography.etiqueta, color: colors.textoSecundario, marginBottom: spacing.md },
  actions: { marginTop: spacing.md },
  error: { ...typography.error, color: colors.error },
  success: { ...typography.etiqueta, color: colors.exito },
});
