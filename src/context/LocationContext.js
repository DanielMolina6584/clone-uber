import { createContext, useContext, useMemo } from 'react';
import { useDriverLocation } from '../hooks/useDriverLocation';

const LocationContext = createContext({ location: null, error: '' });

// Una sola suscripción de ubicación para toda la app del conductor aprobado: el mapa, el simulador
// y el viaje comparten la misma posición, ya disponible al abrir cada pantalla.
export function LocationProvider({ children }) {
  const { location, error } = useDriverLocation();
  const value = useMemo(() => ({ location, error }), [location, error]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useLocation = () => useContext(LocationContext);
