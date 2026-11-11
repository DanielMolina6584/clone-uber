import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { subscribeDriverTrips } from '../services/trips';
import { sortByRecent } from '../utils/trips';

// Viajes del conductor en tiempo real, del más reciente al más antiguo
export function useDriverTrips() {
  const { driverId } = useSession();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!driverId) return undefined;
    return subscribeDriverTrips(
      driverId,
      (data) => {
        setTrips(sortByRecent(data));
        setError('');
        setLoading(false);
      },
      (err) => {
        console.warn('useDriverTrips', err);
        setError('No pudimos cargar tu historial.');
        setLoading(false);
      }
    );
  }, [driverId]);

  return { trips, loading, error };
}
