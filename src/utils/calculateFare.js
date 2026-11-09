import { PRICING } from '../config/pricing';

export function calculateFare({ distanceKm, durationMin, category, tip = 0 }, pricing = PRICING) {
  const multiplier = pricing.categoryMultipliers[category];
  if (multiplier === undefined) throw new Error(`Categoría desconocida: ${category}`);

  const raw = pricing.baseFare + distanceKm * pricing.perKm + durationMin * pricing.perMinute;
  const withCategory = Math.max(raw * multiplier, pricing.minimumFare);
  const fare = Math.round(withCategory / pricing.roundTo) * pricing.roundTo;
  const commission = Math.round(fare * pricing.commissionRate);
  const safeTip = Math.max(0, Math.round(tip || 0));

  return { fare, commission, driverEarnings: fare - commission + safeTip };
}
