import { isInRange, toDate } from './dates';

export const isFinished = (trip) => trip.status === 'completed' || trip.status === 'paid';
export const tripDate = (trip) => toDate(trip.completedAt) || toDate(trip.createdAt);

export function filterTrips(trips, { range }) {
  return trips.filter((trip) => isFinished(trip) && isInRange(tripDate(trip), range));
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
