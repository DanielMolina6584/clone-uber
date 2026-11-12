import { isInRange, toDate } from './dates';

export const isFinished = (trip) => trip.status === 'completed' || trip.status === 'paid';
// Un viaje cancelado no tiene completedAt: se fecha por cancelledAt o, si falta, por createdAt
export const tripDate = (trip) => toDate(trip.completedAt) || toDate(trip.cancelledAt) || toDate(trip.createdAt);

// Claves de traducción de la insignia de pago; el texto se obtiene con t()


const PAYMENT_METHOD_KEYS = ['cash', 'mercadopago', 'stripe'];

// Estado del pago: paid (cobrado), rejected (la pasarela lo rechazó) o pending (aún sin cobrar)
export function paymentState(trip) {
  if (trip.status === 'paid' || trip.paymentStatus === 'approved' || trip.paymentStatus === 'cash') return 'paid';
  if (trip.paymentStatus === 'rejected') return 'rejected';
  return 'pending';
}

export function paymentLabel(trip) {
  const method = PAYMENT_METHOD_KEYS.includes(trip.paymentMethod) ? trip.paymentMethod : 'cash';
  return `payment.${method}.${paymentState(trip)}`;
}

export function sortByRecent(trips) {
  return [...trips].sort((a, b) => (tripDate(b)?.getTime() || 0) - (tripDate(a)?.getTime() || 0));
}

export function filterTrips(trips, { range, method = 'all' }) {
  return trips.filter(
    (trip) => isFinished(trip) && isInRange(tripDate(trip), range) && (method === 'all' || trip.paymentMethod === method)
  );
}

// Estado del viaje para el historial: completado, pagado o cancelado (clave de traducción)
export function tripStatusLabel(trip) {
  if (trip.status === 'cancelled') return 'tripStatus.cancelled';
  if (trip.status === 'paid') return 'tripStatus.paid';
  return 'tripStatus.completed';
}

const HISTORY_STATUSES = ['completed', 'paid', 'cancelled'];

// El historial incluye también los viajes cancelados; ganancias y saldo siguen usando filterTrips
export function filterHistory(trips, { range, method = 'all' }) {
  return trips.filter(
    (trip) => HISTORY_STATUSES.includes(trip.status) && isInRange(tripDate(trip), range) && (method === 'all' || trip.paymentMethod === method)
  );
}

export function summarizeTrips(trips) {
  const totals = trips.reduce(
    (acc, trip) => ({
      count: acc.count + 1,
      billed: acc.billed + (trip.fare || 0),
      commissions: acc.commissions + (trip.commission || 0),
      tips: acc.tips + (trip.tip || 0),
      net: acc.net + (trip.driverEarnings || 0),
    }),
    { count: 0, billed: 0, commissions: 0, tips: 0, net: 0 }
  );
  return { ...totals, average: totals.count ? Math.round(totals.net / totals.count) : 0 };
}

// Pasarela pagada suma la ganancia; efectivo cobrado resta la comisión (puede quedar negativo)
export function computeBalance(trips) {
  return trips.reduce((balance, trip) => {
    if (trip.status !== 'paid') return balance;
    if (trip.paymentMethod === 'cash') return balance - (trip.commission || 0);
    if (trip.paymentStatus === 'approved') return balance + (trip.driverEarnings || 0);
    return balance;
  }, 0);
}
