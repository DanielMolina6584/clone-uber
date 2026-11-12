import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { subscribeDriverTrips } from '../services/trips';

const ACTIVE_STATUSES = ['accepted', 'driver_arriving', 'in_progress'];

// Viaje en curso del conductor (aceptado y sin terminar), o null. Sirve para volver al viaje al reabrir la app
export function useActiveTrip() {
  const { driverId } = useSession();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if (!driverId) return undefined;
    return subscribeDriverTrips(
      driverId,
      setTrips,
      (err) => console.warn('useActiveTrip', err)
    );
  }, [driverId]);

  return useMemo(() => trips.find((trip) => ACTIVE_STATUSES.includes(trip.status)) ?? null, [trips]);
}
