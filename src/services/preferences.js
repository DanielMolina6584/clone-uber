import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@driver_language';
const SESSION_KEY = '@driver_session_id';
const AVAILABILITY_KEY = '@driver_available';

export async function getLanguage() {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export async function saveLanguage(language) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // La preferencia es opcional: si falla, el formulario sigue funcionando
  }
}

export async function getSessionId() {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function saveSessionId(id) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, id);
  } catch {
    // Si falla, la sesión solo dura mientras la app esté abierta
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // Nada que limpiar si el almacenamiento no responde
  }
}

export async function getAvailability() {
  try {
    return (await AsyncStorage.getItem(AVAILABILITY_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function saveAvailability(isAvailable) {
  try {
    await AsyncStorage.setItem(AVAILABILITY_KEY, String(isAvailable));
  } catch {
    // Solo recuerda el último estado: si falla, el conductor inicia como No disponible
  }
}
