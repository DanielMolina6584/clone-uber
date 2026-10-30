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

## #005 · 2026-10-30 14:20 (UTC-5) · Validar mayoría de edad con DateTimePicker

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo valido que el conductor tenga al menos 18 años usando `@react-native-community/datetimepicker`, considerando que en Android abre
  un diálogo y en iOS se renderiza inline?
- **Respuesta:** Calcula la edad real, no solo la diferencia de años: resta los años y descuenta uno si el cumpleaños de este año aún no ha pasado
  (comparando mes y día). Usa `maximumDate={new Date()}` para impedir fechas futuras e inicia el selector en hoy menos 18 años para no obligar a
  scrollear décadas. En Android el componente funciona como diálogo: al montarlo se abre y `onChange` llega con `event.type` `'set'` o `'dismissed'`,
  por lo que debes desmontarlo siempre y solo guardar la fecha cuando es `'set'`. En iOS con `display="spinner"` `onChange` se dispara en cada giro, así
  que se guarda continuamente y se oculta al volver a pulsar el campo. Marca el campo como tocado al cerrar para mostrar el error.
- **Archivos afectados:** `src/components/DateField.js`, `src/utils/validators.js`, `src/utils/formatters.js`.

## #006 · 2026-10-30 14:50 (UTC-5) · Foto de perfil con expo-image-picker y permisos

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo implemento la foto de perfil obligatoria desde cámara o galería con `expo-image-picker` en SDK 58, y cómo manejo el permiso denegado
  sin usar `Alert` para el error?
- **Respuesta:** En SDK 58 `mediaTypes` es un arreglo de strings (`['images']`), no el enum `MediaTypeOptions` antiguo. Para la cámara llama a
  `requestCameraPermissionsAsync()` y, si `granted` es falso, muestra el mensaje bajo el avatar en lugar de abrir un `Alert`. La galería usa el selector
  del sistema y no requiere permiso de lectura. Con `allowsEditing: true`, `aspect: [1, 1]` y `quality: 0.7` obtienes un recorte cuadrado y una imagen
  ligera. El resultado trae `canceled` y `assets[0].uri`; solo guarda la URI si no se canceló. El `Alert` se reserva para elegir el origen (cámara o
  galería). La URI es local: subirla a Cloudinary y guardar la URL en Firestore queda como paso posterior. Los textos de permisos se declaran en el
  plugin `expo-image-picker` de `app.json`.
- **Archivos afectados:** `src/components/PhotoPicker.js`, `src/utils/validators.js`.

## #007 · 2026-10-30 15:25 (UTC-5) · Tema visual estilo Uber con tokens reutilizables

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo aproximo el lenguaje visual de Uber (negro y blanco, inputs grises, botón negro) con `StyleSheet` y sin librerías de UI, de forma que
  luego lo reutilicen las otras pestañas?
- **Respuesta:** Centraliza todo en `theme/index.js`: negro `#000` como color primario y de texto, gris `#F3F3F3` para la superficie de los inputs,
  rojo `#E11900` para errores y un gris `#E2E2E2` para el estado deshabilitado. Los campos son rellenos y sin borde (borde de 2 px del mismo color
  que el fondo para que no cambie el tamaño al marcar error). Los botones son negros de 56 px de alto, y el selector segmentado marca la opción
  activa en negro. Un indicador de tres barras ("Paso 1 de 3") refleja el flujo de registro. Cada control es un componente aislado (`FormField`,
  `SelectField`, `DateField`, `SegmentedControl`, `PrimaryButton`) que lee solo del tema. Uber usa una tipografía propia no disponible aquí, así que se
  usa la fuente del sistema en peso 600/700.
- **Archivos afectados:** `src/theme/index.js`, `src/components/*`, `src/screens/PersonalDataScreen.js`.

## #008 · 2026-10-30 15:58 (UTC-5) · Guardar el idioma en AsyncStorage

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo persisto la preferencia de idioma con `@react-native-async-storage/async-storage` sin bloquear el formulario si el almacenamiento falla?
- **Respuesta:** Aísla el acceso en `services/preferences.js` con `getLanguage` y `saveLanguage` envueltas en `try/catch`: la preferencia es opcional y
  un fallo de lectura o escritura no debe romper el registro. Lee el valor una vez al montar con un `useEffect` de dependencias vacías y una bandera
  `active` en la función de limpieza para no actualizar el estado si la pantalla ya se desmontó. Valida que lo leído sea `es` o `en` antes de usarlo,
  y guarda en el `onChange` del selector. Se usa una clave con prefijo (`@driver_language`) y solo se guarda el idioma, nunca datos sensibles, como pide
  el PDF para AsyncStorage.
- **Archivos afectados:** `src/services/preferences.js`, `src/screens/PersonalDataScreen.js`.
