# Reglas del proyecto: Clone Uber — Versión Conductor

Este archivo es la **fuente única de reglas** para cualquier agente de IA (Claude, Codex, Copilot, etc.) y para todo el equipo.
`CLAUDE.md` lo importa con `@AGENTS.md`; no dupliques reglas allí: edítalas aquí.

## Descripción

App móvil (iOS y Android) inspirada en Uber, **versión conductor**. El conductor se registra, se pone Disponible, recibe solicitudes
de viaje en tiempo real, navega hasta el pasajero y el destino, cobra (Mercado Pago, Stripe en modo de prueba o efectivo) y consulta
sus ganancias netas después de la comisión de la plataforma. El enunciado completo está en `UberClone — Versión Conductor (2).pdf`.

## Expo HAS CHANGED

El proyecto usa **Expo SDK 58** (React Native 0.88, React 19.3). Lee la documentación de la versión exacta en
https://docs.expo.dev/versions/v58.0.0/ y el índice https://docs.expo.dev/llms.txt antes de escribir código.
No asumas APIs de versiones anteriores.

## Reglas obligatorias

1. **Dependencias.** Las librerías ya instaladas son la base del proyecto (ver `package.json`).
   - Para agregar una nueva, preguntar primero y usar siempre `npx expo install <paquete>` (resuelve la versión compatible con el SDK).
   - No actualizar Expo ni paquetes del SDK salvo petición explícita (`npx expo install --fix`, `npm update`).
   - `npm install` sin argumentos (restaurar `node_modules` desde `package-lock.json`) está permitido.
2. **Bitácora de preguntas** en [`BITACORA.md`](./BITACORA.md).
   - Cada pregunta o solicitud se registra con: número, fecha y hora (salida del comando `date`, nunca inventada),
     quién la realizó, quién respondió, la pregunta, la respuesta resumida y los archivos afectados.
   - Las entradas se agregan al final, en orden cronológico. No se borran ni se reescriben entradas anteriores;
     si algo cambió, se agrega una entrada nueva que lo aclare.
3. **Explicar cada cambio.** Al terminar una tarea, explicar (en la respuesta y en la bitácora):
   **qué** cambió, **por qué** y **en qué afecta**.
4. **Reportar errores, no ocultarlos.** Si se detecta un error ajeno a la tarea, se reporta al responsable antes de corregirlo.
5. **Secretos.** Llaves de Firebase, Google Maps, Cloudinary, `access_token` de Mercado Pago o `secret key` de Stripe nunca van en el
   código ni en Git. La app lee solo variables `EXPO_PUBLIC_*` desde `.env` (excluido de Git; los nombres están en `.env.example`).
   Las llaves secretas de pasarela viven únicamente en el backend. Solo credenciales de prueba.
6. **Datos sensibles.** No guardar números de cuenta bancaria ni de tarjeta en la app ni en AsyncStorage.
   AsyncStorage solo para preferencias y sesión (idioma, último estado de disponibilidad).

## Stack

- Expo (plantilla blank, JavaScript, sin Expo Router) + React Native.
- Navegación: `@react-navigation` — Stack (flujo del viaje), Tabs (registro del conductor) y Drawer (perfil, historial, ganancias, configuración).
- Firebase (JS SDK `firebase`): Firestore en tiempo real (`onSnapshot`) para ubicación del conductor y estado del viaje.
  Cliente en `src/services/firebase.js`.
- Mapas: `react-native-maps` · Ubicación: `expo-location` · Fotos: `expo-image-picker` (subida a Cloudinary) ·
  Notificaciones: `expo-notifications` · Pagos: `react-native-webview` / `expo-web-browser` (Checkout Pro) ·
  Formularios: `@react-native-picker/picker`, `@react-native-community/datetimepicker`.
- Backend de pagos (Node.js/Express o Cloud Functions): fuera de esta app; la app solo envía `tripId` y monto.

## Estructura del proyecto

```
App.js                     # Raíz: SafeAreaProvider > providers > NavigationContainer
index.js                   # registerRootComponent
.env.example               # Nombres de variables de entorno (sin valores)
src/
  components/              # Componentes reutilizables
  config/                  # Configuración única (pricing.js: tarifas y comisión)
  context/                 # Contextos globales (sesión del conductor, viaje activo)
  data/                    # Datos estáticos (categorías, colores, géneros)
  hooks/                   # Hooks (useDriverLocation, useTripRequests, useEarnings)
  navigation/              # Stack, Tabs y Drawer
  screens/                 # Pantallas
  services/                # Acceso a APIs y Firebase (sin JSX ni estilos)
  theme/                   # colors, spacing, radius, typography
  utils/                   # Funciones puras sin React (calculateFare, validaciones)
```

## Convenciones de código

- JavaScript (no TypeScript), componentes funcionales y hooks.
- Código (variables, funciones, archivos, campos de Firestore) **en inglés**; textos visibles de la interfaz **en español**.
- Comentarios mínimos, solo donde el porqué no sea evidente.
- Estilos con `StyleSheet.create` al final del archivo, usando los tokens de `src/theme`.
- Las llamadas a APIs y a Firebase van en `src/services/`, no dentro de componentes ni mezcladas con estilos.
- Estado global con Context + hooks. `useState`, `useEffect` (con función de limpieza para ubicación, temporizador y suscripciones),
  `useMemo` para totales de ganancias y `useCallback` para aceptar/rechazar.
- Errores de formulario debajo de cada campo, no en `Alert`.

## Reglas de negocio

- Estados del viaje (`status`): `requested` → `accepted` → `driver_arriving` → `in_progress` → `completed` → `paid`; o `cancelled` / `rejected`.
- Tarifa: una sola función pura `calculateFare({ distanceKm, durationMin, category, tip })` que devuelve `{ fare, commission, driverEarnings }`,
  usada en la estimación y en el cierre del viaje. Valores configurables solo en `src/config/pricing.js`, en pesos colombianos enteros.
  Comisión 20 % (las propinas van completas al conductor); la tarifa se redondea al múltiplo de 100 COP más cercano antes de calcular la comisión.
- Cada viaje guarda el `commissionRate` aplicado.
- El conductor no puede ponerse Disponible hasta que su cuenta pase de `Pendiente de aprobación` a `Aprobado`.
- Solicitud entrante: temporizador de 15 segundos; al llegar a cero se rechaza automáticamente.
- Llamar Distance Matrix / Directions solo al crear y al aceptar la solicitud, nunca en cada actualización de ubicación.

## Comandos

```bash
npm install        # restaurar dependencias
npm start          # expo start
npm run android    # expo start --android
npm run ios        # expo start --ios
npx expo-doctor    # diagnóstico de dependencias
```

> `react-native-maps` y `expo-notifications` (push) no funcionan completos en Expo Go: para probarlos usar un development build
> (`npx expo run:android` o `eas build --profile development`).
