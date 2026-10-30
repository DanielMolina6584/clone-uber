import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@driver_language';

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
