import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { subscribeDriverTrips } from '../services/trips';
import { getPeriodRange } from '../utils/dates';
import { computeBalance, filterTrips, summarizeTrips } from '../utils/trips';

export function useEarnings() {
  const { driverId } = useSession();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!driverId) return undefined;
    return subscribeDriverTrips(
      driverId,
      (data) => {
        setTrips(data);
        setError('');
        setLoading(false);
      },
      (err) => {
        console.warn('useEarnings', err);
        setError('earnings.failed');
        setLoading(false);
      }
    );
  }, [driverId]);

  const summaries = useMemo(() => {
    const now = new Date();
    const summarize = (period) => summarizeTrips(filterTrips(trips, { range: getPeriodRange(period, now) }));
    return { today: summarize('today'), week: summarize('week'), month: summarize('month') };
  }, [trips]);

  const balance = useMemo(() => computeBalance(trips), [trips]);

  return { ...summaries, balance, loading, error };
}
