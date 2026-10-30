# Bitácora de preguntas — Clone Uber (Conductor)

Registro cronológico de las preguntas y solicitudes hechas a los agentes de IA en este proyecto.
Reglas de uso: ver `AGENTS.md` (regla 2). Las entradas nuevas van **al final**; no se editan las anteriores.

**Plantilla**

```
## #NNN · AAAA-MM-DD HH:MM (zona) · Título corto
- **Solicitado por:** nombre
- **Respondido por:** agente / modelo
- **Pregunta:** texto (resumido si es largo)
- **Respuesta:** resumen
- **Archivos afectados:** lista (o "Ninguno")
```

---

## #002 · 2026-10-30 12:15 (UTC-5) · Estado y errores por campo en un formulario sin librerías

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** Para la pestaña de Datos personales sin usar Formik ni react-hook-form, ¿cómo estructuro el estado y las validaciones para mostrar
  el error debajo de cada campo sin que aparezcan antes de que el usuario interactúe, y sin disparar un `Alert`?
- **Respuesta:** Usa dos `useState`: `form` (valores) y `touched` (qué campos ya perdieron el foco). El error no se guarda en el estado: se deriva en
  render con `touched[field] ? validators[field](form[field]) : ''`, así nunca queda desincronizado con el valor. Las reglas van en funciones puras
  `(value) => string` en `utils/validators.js` (cadena vacía = válido), que luego se reutilizan para habilitar el botón "Enviar registro" cuando las
  tres pestañas sean válidas. Marca `touched` en `onBlur`. Para el nombre, `/^\p{L}+(?: \p{L}+)*$/u` acepta tildes y ñ, no admite espacios dobles ni
  espacios sueltos al inicio o al final (haz `trim()` antes). Extrae un `FormField` que reciba `error` y propague el resto de props al `TextInput`.
- **Archivos afectados:** `App.js`, `src/theme/index.js`, `src/utils/validators.js`, `src/components/FormField.js`, `src/screens/PersonalDataScreen.js`.

## #003 · 2026-10-30 12:37 (UTC-5) · Entrada numérica robusta en React Native

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** `keyboardType="numeric"` no me impide pegar letras ni, en algunos teclados, símbolos como `.` o `-`. ¿Cómo garantizo que documento y
  celular contengan solo dígitos, y dónde conviene validar la longitud?
- **Respuesta:** `keyboardType` solo sugiere el teclado; no restringe el valor. Sanea en `onChangeText` con `value.replace(/\D/g, '')` antes de
  guardar en el estado, y usa `maxLength` como tope (10 en ambos). El saneado evita estados inválidos; la longitud mínima/exacta (documento 6–10,
  celular 10) se valida aparte en `validators.js`, porque `maxLength` no impide valores cortos. Documento y celular se guardan como `string`, no como
  número, para no perder ceros a la izquierda ni acercarse al límite de enteros seguros. Para el celular `phone-pad` es suficiente en Android e iOS.
- **Archivos afectados:** `src/screens/PersonalDataScreen.js`, `src/utils/validators.js`.

## #004 · 2026-10-30 12:52 (UTC-5) · Pruebas de la lógica de validación sin emulador

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** Sin emulador ni dispositivo, ¿cómo verifico las validaciones y que el bundle compila, y qué cobertura real me da eso?
- **Respuesta:** Como `validators.js` no importa React ni React Native, se ejecuta directo con Node (ESM): importas las funciones y comparas contra
  casos de borde: nombre con dígitos, vacío, de 51 caracteres, con tilde; documento de 5 y 10 dígitos; celular de 9 y 10. Para el bundle, `npx expo
  export --platform android` corre Metro y Babel y detecta imports rotos y errores de sintaxis. No cubre render, teclado, `onBlur`, ni el
  comportamiento de `KeyboardAvoidingView`; eso solo se ve en Expo Go o un development build.
- **Archivos afectados:** Ninguno.
