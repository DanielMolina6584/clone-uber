import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { APP_CONFIG } from '../config/app';

const toPoint = (position) => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  heading: position.coords.heading >= 0 ? position.coords.heading : 0,
});

// Pide el permiso y sigue la posición del conductor; al desmontar cancela la suscripción.
// Primero entrega la última posición conocida (inmediata) y luego la lectura real, para que el mapa no espere al GPS.
export function useDriverLocation({ intervalMs = APP_CONFIG.locationIntervalMs } = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let subscription = null;
    const update = (position) => {
      if (!active || !position) return;
      setLocation(toPoint(position));
      setError('');
    };

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (status !== 'granted') {
          setError('location.denied');
          return;
        }
        Location.getLastKnownPositionAsync().then(update).catch(() => {});
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(update).catch(() => {});
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: intervalMs, distanceInterval: 5 },
          update
        );
        if (active) subscription = sub;
        else sub.remove();
      } catch (err) {
        console.warn('useDriverLocation', err);
        if (active) setError('location.failed');
      }
    })();

    return () => {
      active = false;
      subscription?.remove();
    };
  }, [intervalMs]);

  return { location, error };
}
