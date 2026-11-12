import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../components/DateField';
import PaymentBadge from '../components/PaymentBadge';
import SegmentedControl from '../components/SegmentedControl';
import { APP_CONFIG } from '../config/app';
import { useDriverTrips } from '../hooks/useDriverTrips';
import { colors, radius, spacing, typography } from '../theme';
import { getPeriodRange } from '../utils/dates';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { CATEGORY_LABELS, filterTrips, tripDate } from '../utils/trips';

const PERIOD_OPTIONS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Rango', value: 'range' },
];

const METHOD_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'M. Pago', value: 'mercadopago' },
  { label: 'Efectivo', value: 'cash' },
];

export default function HistoryScreen({ navigation }) {
  const { trips, loading, error } = useDriverTrips();
  const [period, setPeriod] = useState('week');
  const [method, setMethod] = useState('all');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(APP_CONFIG.historyPageSize);

  const rangeError = period === 'range' && from && to && from > to ? 'La fecha inicial debe ser anterior a la final' : '';

  const filtered = useMemo(() => {
    if (rangeError) return [];
    const range = getPeriodRange(period, new Date(), { from, to });
    return filterTrips(trips, { range, method });
  }, [trips, period, method, from, to, rangeError]);

  useEffect(() => {
    setVisibleCount(APP_CONFIG.historyPageSize);
  }, [period, method, from, to]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const loadMore = useCallback(() => setVisibleCount((count) => count + APP_CONFIG.historyPageSize), []);

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable
        style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
        onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
        accessibilityRole="button"
      >
        <View style={styles.itemHeader}>
          <Text style={styles.date}>{formatDateTime(tripDate(item))}</Text>
          <PaymentBadge trip={item} />
        </View>
        <Text style={styles.route} numberOfLines={2}>{`${item.origin.address} → ${item.destination.address}`}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.meta}>{`${CATEGORY_LABELS[item.category]} · Tarifa ${formatCurrency(item.fare)}`}</Text>
          <Text style={styles.net}>{formatCurrency(item.driverEarnings)}</Text>
        </View>
      </Pressable>
    ),
    [navigation]
  );

  const header = (
    <View style={styles.filters}>
      <SegmentedControl compact label="Periodo" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      {period === 'range' ? (
        <>
          <DateField label="Desde" value={from} onChange={setFrom} maximumDate={new Date()} />
          <DateField label="Hasta" value={to} onChange={setTo} maximumDate={new Date()} error={rangeError} />
        </>
      ) : null}
      <SegmentedControl compact label="Método de pago" options={METHOD_OPTIONS} value={method} onChange={setMethod} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={visible}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={colors.texto} />
        ) : (
          <Text style={styles.empty}>No tienes viajes en este filtro.</Text>
        )
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.fondo },
  content: { padding: spacing.lg },
  filters: { marginBottom: spacing.sm },
  item: { backgroundColor: colors.superficie, borderRadius: radius.md, padding: spacing.md },
  pressed: { opacity: 0.8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { ...typography.etiqueta, color: colors.texto },
  route: { ...typography.texto, color: colors.texto, marginTop: spacing.sm },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  meta: { ...typography.error, color: colors.textoSecundario },
  net: { ...typography.etiqueta, fontSize: 18, color: colors.texto },
  separator: { height: spacing.sm },
  empty: { ...typography.subtitulo, color: colors.textoSecundario, textAlign: 'center', marginTop: spacing.xl },
  error: { ...typography.error, color: colors.error },
});
