export const APP_CONFIG = {
  requestTimeoutSeconds: 15,
  requestMaxAgeMinutes: 10,
  locationIntervalMs: 4000,
  historyPageSize: 20,
  // Velocidad del carro simulado en el viaje (km/h, acelerada para probar rápido)
  simulationSpeedKmh: 120,
  // Bogotá: se usa cuando no hay ubicación del conductor (permiso denegado o simulador sin GPS)
  defaultLocation: { lat: 4.711, lng: -74.0721 },
};
