const REQUIRED = 'validation.required';

export function validateFullName(value) {
  const name = value.trim();
  if (!name) return REQUIRED;
  if (name.length > 50) return 'validation.max50';
  if (!/^\p{L}+(?: \p{L}+)*$/u.test(name)) return 'validation.lettersOnly';
  return '';
}

export function validateIdNumber(value) {
  if (!value) return REQUIRED;
  if (!/^\d+$/.test(value)) return 'validation.digitsOnly';
  if (value.length < 6 || value.length > 10) return 'validation.between6and10';
  return '';
}

export function validatePhone(value) {
  if (!value) return REQUIRED;
  if (!/^\d+$/.test(value)) return 'validation.digitsOnly';
  if (value.length !== 10) return 'validation.tenDigits';
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
  if (getAge(value) < MIN_AGE) return 'validation.minAge';
  return '';
}

export function validateGender(value) {
  return value ? '' : 'validation.selectOption';
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return REQUIRED;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'validation.invalidEmail';
  return '';
}

export function validateLanguage(value) {
  return value ? '' : 'validation.selectLanguage';
}

export function validatePhoto(value) {
  return value ? '' : 'validation.profilePhoto';
}

const VEHICLE_TEXT_MAX = 30;

export function validateCategory(value) {
  return value ? '' : 'validation.selectCategory';
}

export function normalizePlate(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function validatePlate(value) {
  const plate = normalizePlate(value);
  if (!plate) return REQUIRED;
  if (!/^[A-Z]{3}\d{3}$/.test(plate)) return 'validation.invalidPlate';
  return '';
}

export function validateVehicleText(value) {
  const text = value.trim();
  if (!text) return REQUIRED;
  if (text.length > VEHICLE_TEXT_MAX) return 'validation.max30';
  return '';
}

// AI-assisted: see BITACORA.md #009
const XL_MIN_CAPACITY = 6;

export function validateYear(value) {
  if (!value) return REQUIRED;
  if (!/^\d{4}$/.test(value)) return 'validation.fourDigits';
  if (Number(value) > new Date().getFullYear()) return 'validation.futureYear';
  return '';
}

export function validateColor(value) {
  return value ? '' : 'validation.selectColor';
}

export function validateCapacity(value, form = {}) {
  if (!value) return REQUIRED;
  if (!/^\d+$/.test(value)) return 'validation.digitsOnly';
  const capacity = Number(value);
  if (capacity < 1) return 'validation.minCapacity';
  if (form.category === 'xl' && capacity < XL_MIN_CAPACITY) return 'validation.xlCapacity';
  return '';
}

export function validateVehiclePhoto(value) {
  return value ? '' : 'validation.vehiclePhoto';
}

// AI-assisted: see BITACORA.md #010
// Particulares nuevos: primera revisión técnico-mecánica al sexto año de matrícula (Decreto 019 de 2012, art. 202).
export const TECH_INSPECTION_EXEMPT_YEARS = 6;

export function isTechInspectionRequired(vehicleYear, today = new Date()) {
  if (!vehicleYear) return true;
  return today.getFullYear() - Number(vehicleYear) >= TECH_INSPECTION_EXEMPT_YEARS;
}

export function validateLicenseNumber(value) {
  if (!value) return REQUIRED;
  if (!/^\d+$/.test(value)) return 'validation.digitsOnly';
  if (value.length < 6 || value.length > 10) return 'validation.between6and10';
  return '';
}

export function validateExpiryDate(value, today = new Date()) {
  if (!value) return REQUIRED;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expiry = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  if (expiry <= startOfToday) return 'validation.afterToday';
  return '';
}

export function validateDocumentPhoto(value) {
  return value ? '' : 'validation.documentPhoto';
}

export function validateTerms(value) {
  return value ? '' : 'validation.terms';
}
