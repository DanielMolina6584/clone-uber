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

const MIN_AGE = 18;

export function getAge(birthDate, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export function validateBirthDate(value) {
  if (!value) return REQUIRED;
  if (getAge(value) < MIN_AGE) return 'Debes ser mayor de 18 años';
  return '';
}

export function validateGender(value) {
  return value ? '' : 'Selecciona una opción';
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return REQUIRED;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Ingresa un correo válido';
  return '';
}

export function validateLanguage(value) {
  return value ? '' : 'Selecciona un idioma';
}

export function validatePhoto(value) {
  return value ? '' : 'La foto de perfil es obligatoria';
}

const VEHICLE_TEXT_MAX = 30;

export function validateCategory(value) {
  return value ? '' : 'Selecciona una categoría';
}

export function normalizePlate(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function validatePlate(value) {
  const plate = normalizePlate(value);
  if (!plate) return REQUIRED;
  if (!/^[A-Z]{3}\d{3}$/.test(plate)) return 'Formato inválido, usa ABC123';
  return '';
}

export function validateVehicleText(value) {
  const text = value.trim();
  if (!text) return REQUIRED;
  if (text.length > VEHICLE_TEXT_MAX) return 'Máximo 30 caracteres';
  return '';
}

// AI-assisted: see BITACORA.md #009
const XL_MIN_CAPACITY = 6;

export function validateYear(value) {
  if (!value) return REQUIRED;
  if (!/^\d{4}$/.test(value)) return 'Debe tener 4 dígitos';
  if (Number(value) > new Date().getFullYear()) return 'No puede ser mayor al año actual';
  return '';
}

export function validateColor(value) {
  return value ? '' : 'Selecciona un color';
}

export function validateCapacity(value, form = {}) {
  if (!value) return REQUIRED;
  if (!/^\d+$/.test(value)) return 'Solo números';
  const capacity = Number(value);
  if (capacity < 1) return 'Debe ser al menos 1 pasajero';
  if (form.category === 'xl' && capacity < XL_MIN_CAPACITY) return 'La categoría XL exige mínimo 6 pasajeros';
  return '';
}

export function validateVehiclePhoto(value) {
  return value ? '' : 'La foto del vehículo es obligatoria';
}
