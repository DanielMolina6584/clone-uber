export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

// La semana empieza el lunes
export function startOfWeek(date) {
  const offset = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
}

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

export function getPeriodRange(period, now = new Date(), custom = {}) {
  if (period === 'today') return { from: startOfDay(now), to: endOfDay(now) };
  if (period === 'week') return { from: startOfWeek(now), to: endOfDay(now) };
  if (period === 'month') return { from: startOfMonth(now), to: endOfDay(now) };
  if (period === 'range') {
    return {
      from: custom.from ? startOfDay(custom.from) : null,
      to: custom.to ? endOfDay(custom.to) : null,
    };
  }
  return { from: null, to: null };
}

export function isInRange(value, range) {
  const date = toDate(value);
  if (!date) return false;
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}
