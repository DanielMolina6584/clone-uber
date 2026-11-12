import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DRIVER_STATUS, subscribeDriver } from '../services/drivers';
import { clearSession, getSessionId, saveSessionId } from '../services/preferences';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [driverId, setDriverId] = useState(null);
  const [driver, setDriver] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [waitingDriver, setWaitingDriver] = useState(false);
  const [error, setError] = useState('');
  // Id de un conductor recién registrado: su documento puede tardar en llegar al listener y no debe cerrar la sesión
  const freshId = useRef(null);

  useEffect(() => {
    let active = true;
    getSessionId().then((id) => {
      if (!active) return;
      if (id) {
        setDriverId(id);
        setWaitingDriver(true);
      }
      setRestoring(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const endSession = useCallback(async () => {
    await clearSession();
    setDriver(null);
    setDriverId(null);
  }, []);

  useEffect(() => {
    if (!driverId) return undefined;
    setError('');
    const unsubscribe = subscribeDriver(
      driverId,
      (data) => {
        // Si el documento ya no existe, la sesión guardada no sirve (salvo que acabe de crearse)
        if (!data) {
          if (freshId.current !== driverId) endSession();
        } else {
          freshId.current = null;
          setDriver(data);
        }
        setWaitingDriver(false);
      },
      (err) => {
        console.warn('subscribeDriver', err);
        setError('session.updateFailed');
        setWaitingDriver(false);
      }
    );
    return unsubscribe;
  }, [driverId, endSession]);

  // Con `initialDriver` (registro nuevo) se muestra de inmediato lo enviado, sin esperar la lectura del documento
  const startSession = useCallback(async (id, initialDriver = null) => {
    await saveSessionId(id);
    freshId.current = initialDriver ? id : null;
    setDriver(initialDriver ? { id, ...initialDriver } : null);
    setWaitingDriver(!initialDriver);
    setDriverId(id);
  }, []);

  const value = useMemo(
    () => ({
      driverId,
      driver,
      error,
      loading: restoring || waitingDriver,
      isApproved: driver?.status === DRIVER_STATUS.approved,
      startSession,
      endSession,
    }),
    [driverId, driver, error, restoring, waitingDriver, startSession, endSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de SessionProvider');
  return context;
}
