import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { APP_CONFIG } from '../config/app';

const toPoint = (position) => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  heading: position.coords.heading >= 0 ? position.coords.heading : 0,
});

// Pide el permiso y sigue la posición del conductor; al desmontar cancela la suscripción
export function useDriverLocation({ intervalMs = APP_CONFIG.locationIntervalMs } = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let subscription = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (status !== 'granted') {
          setError('Activa el permiso de ubicación para ver el mapa y recibir solicitudes.');
          return;
        }
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: intervalMs, distanceInterval: 5 },
          (position) => {
            setLocation(toPoint(position));
            setError('');
          }
        );
        if (active) subscription = sub;
        else sub.remove();
      } catch (err) {
        console.warn('useDriverLocation', err);
        if (active) setError('No pudimos obtener tu ubicación.');
      }
    })();

    return () => {
      active = false;
      subscription?.remove();
    };
  }, [intervalMs]);

  return { location, error };
}
