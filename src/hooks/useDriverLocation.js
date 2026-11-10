import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { APP_CONFIG } from '../config/app';
import { updateDriverLocation } from '../services/drivers';

const toPoint = (position) => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  heading: position.coords.heading >= 0 ? position.coords.heading : 0,
});

// Pide el permiso y sigue la posición del conductor; al desmontar cancela la suscripción.
// Mientras `publish` sea true, escribe la posición en Firestore como máximo una vez por intervalo.
export function useDriverLocation({ driverId, publish = false, intervalMs = APP_CONFIG.locationIntervalMs } = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const lastWrite = useRef(0);

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

  useEffect(() => {
    if (!publish || !driverId || !location) return;
    const now = Date.now();
    if (now - lastWrite.current < intervalMs) return;
    lastWrite.current = now;
    updateDriverLocation(driverId, location).catch((err) => console.warn('updateDriverLocation', err));
  }, [publish, driverId, location, intervalMs]);

  return { location, error };
}
