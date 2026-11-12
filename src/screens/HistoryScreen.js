import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../components/DateField';
import PaymentBadge from '../components/PaymentBadge';
import SegmentedControl from '../components/SegmentedControl';
import TripStatusBadge from '../components/TripStatusBadge';
import { APP_CONFIG } from '../config/app';
import { useLanguage } from '../context/LanguageContext';
import { useDriverTrips } from '../hooks/useDriverTrips';
import { colors, radius, spacing, typography } from '../theme';
import { getPeriodRange } from '../utils/dates';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { filterHistory, tripDate } from '../utils/trips';

const PERIOD_OPTIONS = [
  { labelKey: 'history.today', value: 'today' },
  { labelKey: 'history.week', value: 'week' },
  { labelKey: 'history.month', value: 'month' },
  { labelKey: 'history.range', value: 'range' },
];

const METHOD_OPTIONS = [
  { labelKey: 'history.all', value: 'all' },
  { labelKey: 'method.mercadopagoShort', value: 'mercadopago' },
  { labelKey: 'method.cash', value: 'cash' },
];

export default function HistoryScreen({ navigation }) {
  const { t, language } = useLanguage();
  const { trips, loading, error } = useDriverTrips();
  const [period, setPeriod] = useState('week');
  const [method, setMethod] = useState('all');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(APP_CONFIG.historyPageSize);

  const rangeError = period === 'range' && from && to && from > to ? t('history.rangeError') : '';

  const filtered = useMemo(() => {
    if (rangeError) return [];
    const range = getPeriodRange(period, new Date(), { from, to });
    return filterHistory(trips, { range, method });
  }, [trips, period, method, from, to, rangeError]);

  useEffect(() => {
    setVisibleCount(APP_CONFIG.historyPageSize);
  }, [period, method, from, to]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const loadMore = useCallback(() => setVisibleCount((count) => count + APP_CONFIG.historyPageSize), []);

  const renderItem = useCallback(
    ({ item }) => {
      const cancelled = item.status === 'cancelled';
      return (
        <Pressable
          style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
          onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
          accessibilityRole="button"
        >
          <View style={styles.itemHeader}>
            <Text style={styles.date}>{formatDateTime(tripDate(item), language)}</Text>
            <View style={styles.badges}>
              <TripStatusBadge trip={item} />
              {cancelled ? null : <PaymentBadge trip={item} />}
            </View>
          </View>
          <Text style={styles.route} numberOfLines={2}>{`${item.origin.address} → ${item.destination.address}`}</Text>
          <View style={styles.itemFooter}>
            <Text style={[styles.meta, cancelled ? styles.struck : null]}>
              {`${t(`category.${item.category}`)} · ${t('history.fare', { amount: formatCurrency(item.fare) })}`}
            </Text>
            {cancelled ? null : <Text style={styles.net}>{formatCurrency(item.driverEarnings)}</Text>}
          </View>
        </Pressable>
      );
    },
    [navigation, t, language]
  );

  const header = (
    <View style={styles.filters}>
      <SegmentedControl label={t('history.period')} options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      {period === 'range' ? (
        <>
          <DateField label={t('history.from')} value={from} onChange={setFrom} maximumDate={new Date()} />
          <DateField label={t('history.to')} value={to} onChange={setTo} maximumDate={new Date()} error={rangeError} />
        </>
      ) : null}
      <SegmentedControl label={t('history.method')} options={METHOD_OPTIONS} value={method} onChange={setMethod} />
      {error ? <Text style={styles.error}>{t(error)}</Text> : null}
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
        loading ? <ActivityIndicator color={colors.texto} /> : <Text style={styles.empty}>{t('history.empty')}</Text>
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
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  badges: { flexDirection: 'row', gap: spacing.xs },
  date: { ...typography.etiqueta, color: colors.texto, flexShrink: 1 },
  route: { ...typography.texto, color: colors.texto, marginTop: spacing.sm },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  meta: { ...typography.error, color: colors.textoSecundario },
  struck: { textDecorationLine: 'line-through' },
  net: { ...typography.etiqueta, fontSize: 18, color: colors.texto },
  separator: { height: spacing.sm },
  empty: { ...typography.subtitulo, color: colors.textoSecundario, textAlign: 'center', marginTop: spacing.xl },
  error: { ...typography.error, color: colors.error },
});
