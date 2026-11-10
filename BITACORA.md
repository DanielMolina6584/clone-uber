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

## #009 · 2026-11-03 10:17 (UTC-5) · Completar la pestaña Vehículo: año, color, capacidad y foto

- **Solicitado por:** kpineda
- **Respondido por:** Claude Code (Claude Opus 5.5)
- **Pregunta:** La pestaña Vehículo ya tiene categoría, placa, marca y modelo. ¿Cómo termino los campos que faltan según el PDF (año de 4 dígitos no
  mayor al actual, color en lista, capacidad numérica donde XL exige mínimo 6 y foto obligatoria del vehículo donde se vea la placa) reutilizando
  los componentes que ya existen?
- **Respuesta:** Las reglas nuevas van como funciones puras en `validators.js` (`validateYear`, `validateColor`, `validateCapacity`,
  `validateVehiclePhoto`). Como la capacidad depende de la categoría, los validadores reciben `(value, form)`; así, si el conductor cambia a XL, el error
  de capacidad aparece sin lógica extra porque se deriva en render. Año y capacidad se sanean con `replace(/\D/g, '')` y se entregan como `Number` al
  continuar. Los colores viven en `data/options.js`. `PhotoPicker` recibe `variant="card"` (rectángulo 4:3) y `title` para reutilizarlo con el vehículo
  y los documentos sin duplicar la lógica de permisos.
  Verificación: casos de borde de los validadores ejecutados con Node (año vacío, de 3 dígitos, futuro; XL con 5 y 6; capacidad 0) y
  `npx expo export --platform android` sin errores. No probado aún en dispositivo.
- **Archivos afectados:** `src/data/options.js`, `src/utils/validators.js`, `src/components/PhotoPicker.js`, `src/screens/VehicleScreen.js`.
- **Commit:** b51f15c

## #010 · 2026-11-03 11:21 (UTC-5) · Pestaña Documentos y pagos

- **Solicitado por:** kpineda
- **Respondido por:** Claude Code (Claude Opus 5.5)
- **Pregunta:** ¿Cómo armo la pestaña 3 con licencia (número, foto y vencimiento), SOAT (foto y vencimiento), revisión técnico-mecánica solo si
  aplica según el año del vehículo, correo de Mercado Pago y el checkbox de términos con el porcentaje de comisión visible?
- **Respuesta:** Se crea `src/config/pricing.js` con los valores de la sección 5 del PDF y el checkbox lee de ahí el 20 %, para no escribirlo a mano.
  Los vencimientos usan `validateExpiryDate`, que compara solo la fecha (sin hora) y exige que sea posterior a hoy; el `DateField` ahora acepta
  `minimumDate` (mañana). La técnico-mecánica se exige si el vehículo tiene 6 años o más (`isTechInspectionRequired`, Decreto 019 de 2012 para
  particulares); si no aplica, los campos se ocultan y salen del mapa de validadores con `useMemo`. Se agrega `CheckboxField` con
  `accessibilityRole="checkbox"`. `RegistrationTabs` guarda los datos de cada paso para pasarle el año del vehículo a la pestaña 3.
  Verificación: vencimientos hoy/ayer/mañana, técnico-mecánica 2020/2021 y número de licencia probados con Node.
- **Archivos afectados:** `src/config/pricing.js`, `src/utils/validators.js`, `src/components/DateField.js`, `src/components/CheckboxField.js`,
  `src/screens/DocumentsScreen.js`, `src/navigation/RegistrationTabs.js`.
- **Commit:** 08a4eb7

## #011 · 2026-11-03 12:40 (UTC-5) · Envío del registro y estado Pendiente de aprobación

- **Solicitado por:** kpineda
- **Respondido por:** Claude Code (Claude Opus 5.5)
- **Pregunta:** Al pulsar "Enviar registro", ¿cómo subo las fotos y guardo al conductor en Firestore con estado Pendiente de aprobación, sin poner
  llaves secretas en la app y mostrando el error sin `Alert`?
- **Respuesta:** Las fotos se suben a Cloudinary con un *upload preset* sin firma (`services/cloudinary.js`), así la app solo usa
  `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` y `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` y nunca la API secret. `services/drivers.js` sube las cinco fotos en
  paralelo, reemplaza las URI locales por URL y crea el documento en `drivers` con `status: 'pending_approval'` y `createdAt: serverTimestamp()`;
  para aprobar se cambia el campo a `approved` en la consola. El botón se deshabilita mientras envía y el error se muestra debajo del botón. Al
  terminar se muestra `PendingApprovalScreen`. El `commissionRate` aceptado queda guardado con los documentos.
  Verificación: `npx expo export --platform android` sin errores. Falta probar contra un proyecto real de Firebase y Cloudinary con `.env`.
- **Archivos afectados:** `src/services/cloudinary.js`, `src/services/drivers.js`, `src/screens/PendingApprovalScreen.js`,
  `src/navigation/RegistrationTabs.js`.
- **Commit:** facd995

## #012 · 2026-11-06 08:13 (UTC-5) · Guardar el registro en Firestore sin subir imágenes a Cloudinary

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** El PDF solo recomienda Cloudinary (sección 7), no lo exige. ¿Cómo guardo las fotos del registro en Firestore de la forma más simple, sin
  gestionar un servicio de imágenes?
- **Respuesta:** Elimina la subida y guarda en el documento de `drivers` lo que ya devuelve `expo-image-picker`: la URI de cada foto (`photoUri`,
  `vehiclePhotoUri`, `licensePhotoUri`, `soatPhotoUri`, `techInspectionPhotoUri`). `submitDriverRegistration` queda en un solo `addDoc` con
  `personal`, `vehicle`, `documents`, `status: 'pending_approval'` y `createdAt: serverTimestamp()`. Limitación: son rutas locales (`file://...`) que solo
  existen en el teléfono que tomó la foto, así que el panel de aprobación no podrá mostrar las imágenes; sirven para la práctica, no para producción.
  Para producción hay que subir los archivos a un almacenamiento (Cloudinary o Firebase Storage) y guardar su URL pública. No conviene guardar las
  imágenes en base64 dentro de Firestore: cada documento tiene un límite de 1 MiB.
- **Archivos afectados:** `src/services/drivers.js`, `src/services/cloudinary.js` (eliminado), `.env.example`.

## #013 · 2026-11-06 12:48 (UTC-5) · "Ya tengo cuenta": iniciar sesión sin Firebase Auth

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** El conductor ya queda registrado en Firestore, pero si cierra la app o cambia de teléfono no puede volver a entrar. ¿Cómo agrego un "Ya tengo cuenta" sin usar Firebase Auth?
- **Respuesta:** Sin Authentication hace falta algo que haga de "usuario". Como el documento de identidad ya se pide en el registro, se busca el conductor con
  `where('personal.idNumber', '==', idNumber)` (un `getDocs` con `limit(1)`) y se guarda su id de documento como sesión en AsyncStorage. Un
  `SessionContext` restaura esa sesión al abrir la app y escucha el documento con `onSnapshot`, por lo que el estado (Pendiente de aprobación o Aprobado) se
  actualiza solo; si el documento ya no existe, se limpia la sesión. Tras enviar el registro también se inicia sesión con el id devuelto por `addDoc`, en
  lugar de un estado local `submitted`. La navegación raíz decide entre dos casos: sin sesión, un Stack con Registro y Login; con sesión, la pantalla de
  estado con "Cerrar sesión". Límite importante: cualquiera que conozca un documento de identidad entra a esa cuenta, y la consulta exige que las reglas de
  Firestore permitan leer `drivers`; para producción hay que pasar a Firebase Auth. En iOS la consulta por un campo anidado no necesita índice.
- **Archivos afectados:** `App.js`, `src/context/SessionContext.js`, `src/navigation/RootNavigator.js`, `src/navigation/RegistrationTabs.js`, `src/screens/LoginScreen.js`, `src/screens/PendingApprovalScreen.js`, `src/screens/PersonalDataScreen.js`, `src/components/PrimaryButton.js`, `src/services/drivers.js`, `src/services/preferences.js`.

## #014 · 2026-11-09 15:54 (UTC-5) · Drawer y pantalla de mapa al aprobarse el conductor

- **Solicitado por:** kpineda
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** Cuando la cuenta pasa a Aprobado, ¿cómo cambio de la pantalla de estado a una app con menú lateral y un mapa, sin romper el flujo de registro?
- **Respuesta:** En `RootNavigator`, si hay sesión y `driver.status === 'approved'` se devuelve un `AppDrawer`; si sigue pendiente se mantiene
  `PendingApprovalScreen`. Como el estado llega por `onSnapshot`, el cambio ocurre solo cuando alguien aprueba el documento. El Drawer usa
  `drawerContent` propio: nombre del conductor, `DrawerItemList` y un `DrawerItem` "Cerrar sesión" que llama a `endSession`. La pantalla Inicio es
  `MapScreen` con `MapView` de `react-native-maps` centrado en Bogotá. En iOS usa Apple Maps y no necesita llave; en Android el mapa requeriría llave de
  Google. `react-native-maps` no funciona completo en Expo Go: hace falta un development build.
- **Archivos afectados:** `src/navigation/AppDrawer.js`, `src/screens/MapScreen.js`, `src/navigation/RootNavigator.js`.

## #015 · 2026-11-09 15:54 (UTC-5) · Escuchar solicitudes de viaje y mostrar la tarjeta con temporizador

- **Solicitado por:** kpineda
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo escucho en tiempo real los viajes en estado `requested`, muestro una tarjeta con 15 segundos para decidir y evito que dos conductores acepten el mismo viaje?
- **Respuesta:** `useTripRequests` abre un `onSnapshot` sobre `trips` con `where('status', '==', 'requested')`, solo mientras `enabled`, y limpia la
  suscripción al desmontar. Filtra en el cliente las solicitudes que ya tienen `driverId`, las que este conductor rechazó (`rejectedBy`) y las de más de 10
  minutos, y devuelve la más antigua. `TripRequestCard` calcula el tiempo restante contra una hora límite (`Date.now()`) en vez de restar de uno en uno, así
  no se desfasa si la app queda en segundo plano; al llegar a cero rechaza sola. Aceptar usa `runTransaction`: lee el viaje y solo escribe `driverId` y
  `accepted` si sigue en `requested` y sin conductor; si otro se adelantó lanza `trip-taken`. Rechazar no cambia el estado: agrega el id con `arrayUnion` a
  `rejectedBy`, para que el viaje siga visible a los demás. La tarjeta muestra `fare` y `driverEarnings` que escribe el pasajero. Las reglas de
  Firestore deben permitir leer y actualizar `trips`.
- **Archivos afectados:** `src/services/trips.js`, `src/hooks/useTripRequests.js`, `src/components/TripRequestCard.js`, `src/config/app.js`, `src/utils/formatters.js`, `src/screens/MapScreen.js`.

## #016 · 2026-11-09 15:54 (UTC-5) · Función única para calcular la tarifa y la comisión

- **Solicitado por:** kpineda
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo calculo la tarifa, la comisión del 20 % y la ganancia neta en una sola función pura, de forma que la estimación y el cierre del viaje den siempre el mismo resultado?
- **Respuesta:** `calculateFare({ distanceKm, durationMin, category, tip })` en `src/utils/calculateFare.js`, sin React ni Firebase. Toma todos los valores
  de `src/config/pricing.js`: `base + distancia x km + duración x min`, multiplicado por la categoría (economy 1.0, xl 1.4, premium 1.8) y con mínimo de
  $ 6.000. La tarifa se redondea al múltiplo de 100 COP más cercano ANTES de calcular la comisión (`Math.round(fare x 0.2)`), y la propina se suma
  completa a la ganancia: `driverEarnings = fare - commission + tip`. Una categoría desconocida lanza un error en lugar de devolver NaN, y la propina
  negativa se trata como 0. Ejemplo (10 km, 20 min, economy): 3.500 + 12.000 + 5.000 = 20.500; comisión 4.100; neto 16.400. Verificado con pruebas en
  Node (neto, propina, tarifa mínima, categoría XL y categoría inválida). Cada viaje debe guardar además el `commissionRate` usado.
- **Archivos afectados:** `src/utils/calculateFare.js` (nuevo); `src/config/pricing.js` es la fuente de los valores y no cambia.

## #017 · 2026-11-09 16:26 (UTC-5) · Seguir la ubicación del conductor en el mapa

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo pido el permiso de ubicación, sigo la posición del conductor en tiempo real y hago que el mapa lo acompañe sin dejar suscripciones abiertas?
- **Respuesta:** El hook `useDriverLocation` llama a `Location.requestForegroundPermissionsAsync()` y, si el permiso se concede, abre
  `Location.watchPositionAsync` con precisión `Balanced`, cada 4 s y al menos 5 m de movimiento. Guarda `{ lat, lng, heading }` (el rumbo vale -1 cuando el
  dispositivo no lo conoce, por eso se normaliza a 0). Como la suscripción se obtiene de forma asíncrona, el `useEffect` usa una bandera `active`: si el
  componente se desmonta antes de que `watchPositionAsync` responda, la suscripción recién creada se cancela en el acto; si no, se cancela en la función de
  limpieza. `MapScreen` usa `animateToRegion` desde un ref cuando cambia la posición y activa `showsUserLocation`; si el permiso se niega muestra un aviso
  rojo en lugar de `Alert`. Todavía no se escribe nada en Firestore (eso llega con el botón Disponible). En iOS el permiso ya está declarado en
  `app.json` con el plugin de `expo-location`.
- **Archivos afectados:** `src/hooks/useDriverLocation.js`, `src/screens/MapScreen.js`, `src/config/app.js`.

## #018 · 2026-11-10 11:12 (UTC-5) · Botón Disponible/No disponible solo para cuentas aprobadas

- **Solicitado por:** dmolina
- **Respondido por:** Claude Code (Claude Sonnet 5.5)
- **Pregunta:** ¿Cómo agrego un interruptor Disponible/No disponible que solo se pueda activar con la cuenta aprobada, que recuerde el último estado y que controle cuándo se escuchan solicitudes y se publica la ubicación?
- **Respuesta:** `AvailabilityToggle` es un componente de presentación (pastilla con `Switch`) que se deshabilita cuando `isApproved` es falso y muestra
  el motivo debajo. `MapScreen` guarda `available` en estado y calcula `working = isApproved && available`; esa bandera alimenta
  `useTripRequests({ enabled: working })` y `useDriverLocation({ publish: working })`, así que fuera de Disponible no hay `onSnapshot` sobre `trips` ni
  escrituras de posición. Al cambiar el interruptor se actualiza la interfaz de inmediato y luego se escribe `isAvailable` con `updateDoc`; si la escritura
  falla se revierte el interruptor y se muestra un error bajo la pastilla. El último estado se guarda en AsyncStorage (`@driver_available`) y al abrir el
  mapa se restaura y se vuelve a escribir en Firestore, porque la app pudo cerrarse estando Disponible. `useDriverLocation` escribe
  `location: { lat, lng, heading }` y `locationUpdatedAt` como máximo una vez por intervalo (4 s) mientras `publish` sea verdadero. Límite: si la app se cierra
  a la fuerza, `isAvailable` queda en `true` en Firestore hasta que el conductor la vuelva a abrir. Las reglas de Firestore deben permitir actualizar
  `drivers`. AsyncStorage solo guarda una preferencia, no datos sensibles.
- **Archivos afectados:** `src/components/AvailabilityToggle.js`, `src/screens/MapScreen.js`, `src/hooks/useDriverLocation.js`, `src/services/drivers.js`, `src/services/preferences.js`.
