import { decodePolyline, distanceKm, encodePolyline, straightLine } from '../utils/geo';

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const OSRM_NEAREST_URL = 'https://router.project-osrm.org/nearest/v1/driving';
const FALLBACK_SPEED_KMH = 30;
const DETOUR_FACTOR = 1.3;

export const hasGoogleKey = () => Boolean(GOOGLE_KEY);

const coords = (point) => `${point.lat},${point.lng}`;

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function googleDirections(origin, destination) {
  const params = `origin=${coords(origin)}&destination=${coords(destination)}&mode=driving&language=es&key=${GOOGLE_KEY}`;
  const data = await fetchJson(`https://maps.googleapis.com/maps/api/directions/json?${params}`);
  if (data.status !== 'OK') throw new Error(`Directions ${data.status}`);
  const leg = data.routes[0].legs[0];
  return {
    points: decodePolyline(data.routes[0].overview_polyline.points),
    distanceKm: leg.distance.value / 1000,
    durationMin: leg.duration.value / 60,
    source: 'google',
  };
}

async function osrmDirections(origin, destination) {
  const path = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const data = await fetchJson(`${OSRM_URL}/${path}?overview=full&geometries=polyline`);
  if (data.code !== 'Ok') throw new Error(`OSRM ${data.code}`);
  const route = data.routes[0];
  return { points: decodePolyline(route.geometry), distanceKm: route.distance / 1000, durationMin: route.duration / 60, source: 'osrm' };
}

// Ajusta un punto a la carretera más cercana (OSRM, sin llave); si falla devuelve el mismo punto
export async function snapToRoad(point) {
  try {
    const data = await fetchJson(`${OSRM_NEAREST_URL}/${point.lng},${point.lat}?number=1`);
    const [lng, lat] = data.waypoints[0].location;
    return { lat, lng };
  } catch (error) {
    console.warn('snapToRoad', error.message);
    return { lat: point.lat, lng: point.lng };
  }
}

function straightDirections(origin, destination) {
  const km = distanceKm(origin, destination) * DETOUR_FACTOR;
  return { points: straightLine(origin, destination), distanceKm: km, durationMin: (km / FALLBACK_SPEED_KMH) * 60, source: 'straight' };
}

// Se llama solo al aceptar y al pasar a destino, nunca en cada actualización de ubicación
export async function getDirections(origin, destination) {
  const providers = [...(GOOGLE_KEY ? [googleDirections] : []), osrmDirections];
  for (const provider of providers) {
    try {
      const result = await provider(origin, destination);
      return { ...result, encoded: encodePolyline(result.points) };
    } catch (error) {
      console.warn('getDirections', error.message);
    }
  }
  const fallback = straightDirections(origin, destination);
  return { ...fallback, encoded: encodePolyline(fallback.points) };
}

// Se llama una vez al crear la solicitud y una vez al aceptarla
export async function getDistanceMatrix(origin, destination) {
  if (GOOGLE_KEY) {
    try {
      const params = `origins=${coords(origin)}&destinations=${coords(destination)}&mode=driving&language=es&key=${GOOGLE_KEY}`;
      const data = await fetchJson(`https://maps.googleapis.com/maps/api/distancematrix/json?${params}`);
      const element = data.rows?.[0]?.elements?.[0];
      if (data.status === 'OK' && element?.status === 'OK') {
        return { distanceKm: element.distance.value / 1000, durationMin: element.duration.value / 60, source: 'google' };
      }
    } catch (error) {
      console.warn('getDistanceMatrix', error.message);
    }
  }
  const { distanceKm: km, durationMin, source } = await getDirections(origin, destination);
  return { distanceKm: km, durationMin, source };
}
