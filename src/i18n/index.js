import es from './es';
import en from './en';

export const LANGUAGES_AVAILABLE = ['es', 'en'];
const dictionaries = { es, en };

// Busca la clave en el idioma pedido, luego en español y, si no existe, devuelve la propia clave.
// Una clave vacía devuelve '' para poder usar t(error) cuando no hay error.
export function translate(language, key, params) {
  if (!key) return '';
  const template = dictionaries[language]?.[key] ?? es[key] ?? key;
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => (params[name] === undefined ? match : String(params[name])));
}
