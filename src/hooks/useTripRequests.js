import { useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../config/app';
import { subscribeRequestedTrips } from '../services/trips';

const toMillis = (timestamp) => (timestamp?.toDate ? timestamp.toDate().getTime() : null);

// Escucha solicitudes 'requested' mientras `enabled`; devuelve la más antigua que este conductor no rechazó
export function useTripRequests({ driverId, enabled }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled || !driverId) {
      setRequests([]);
      return undefined;
    }
    return subscribeRequestedTrips(
      (trips) => {
        setRequests(trips);
        setError('');
      },
      (err) => {
        console.warn('useTripRequests', err);
        setError('request.listenFailed');
      }
    );
  }, [enabled, driverId]);

  const currentRequest = useMemo(() => {
    const cutoff = Date.now() - APP_CONFIG.requestMaxAgeMinutes * 60 * 1000;
    const candidates = requests.filter((trip) => {
      if (trip.driverId || trip.rejectedBy?.includes(driverId)) return false;
      const created = toMillis(trip.createdAt);
      return created === null || created >= cutoff;
    });
    candidates.sort((a, b) => (toMillis(a.createdAt) ?? Date.now()) - (toMillis(b.createdAt) ?? Date.now()));
    return candidates[0] ?? null;
  }, [requests, driverId]);

  return { currentRequest, error };
}
