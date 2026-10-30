const REQUIRED = 'Este campo es obligatorio';

export function validateFullName(value) {
  const name = value.trim();
  if (!name) return REQUIRED;
  if (name.length > 50) return 'Máximo 50 caracteres';
  if (!/^\p{L}+(?: \p{L}+)*$/u.test(name)) return 'Solo letras y espacios';
  return '';
}

export function validateIdNumber(value) {
  if (!value) return REQUIRED;
  if (!/^\d+$/.test(value)) return 'Solo números';
  if (value.length < 6 || value.length > 10) return 'Debe tener entre 6 y 10 dígitos';
  return '';
}

export function validatePhone(value) {
  if (!value) return REQUIRED;
  if (!/^\d+$/.test(value)) return 'Solo números';
  if (value.length !== 10) return 'Debe tener 10 dígitos';
  return '';
}
