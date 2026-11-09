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
