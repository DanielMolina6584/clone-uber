import { useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config/app';
import { updateDriverLocation } from '../services/drivers';

// Mientras `publish` sea true, escribe la posición en Firestore como máximo una vez por intervalo
export function usePublishLocation({ driverId, publish, location, intervalMs = APP_CONFIG.locationIntervalMs }) {
  const lastWrite = useRef(0);

  useEffect(() => {
    if (!publish || !driverId || !location) return;
    const now = Date.now();
    if (now - lastWrite.current < intervalMs) return;
    lastWrite.current = now;
    updateDriverLocation(driverId, location).catch((err) => console.warn('updateDriverLocation', err));
  }, [publish, driverId, location, intervalMs]);
}
