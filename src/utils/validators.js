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
