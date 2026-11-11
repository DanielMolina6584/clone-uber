export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function formatCurrency(value) {
  const rounded = Math.round(value || 0);
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${rounded < 0 ? '-' : ''}$ ${digits}`;
}

export function formatDistance(km) {
  return `${(km || 0).toFixed(1).replace('.', ',')} km`;
}

export function formatDuration(min) {
  return `${Math.round(min || 0)} min`;
}

export function formatDateTime(date) {
  if (!date) return '';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'p. m.' : 'a. m.';
  return `${formatDate(date)} ${hours % 12 || 12}:${minutes} ${suffix}`;
}
