const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

export function decodePolyline(encoded, precision = 5) {
  const factor = 10 ** precision;
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  const readValue = () => {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index <= encoded.length);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    lat += readValue();
    lng += readValue();
    points.push({ lat: lat / factor, lng: lng / factor });
  }
  return points;
}

export function encodePolyline(points, precision = 5) {
  const factor = 10 ** precision;
  let prevLat = 0;
  let prevLng = 0;
  let output = '';

  const writeValue = (value) => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    while (v >= 0x20) {
      output += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    output += String.fromCharCode(v + 63);
  };

  points.forEach((point) => {
    const lat = Math.round(point.lat * factor);
    const lng = Math.round(point.lng * factor);
    writeValue(lat - prevLat);
    writeValue(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  });
  return output;
}

export function distanceKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing(a, b) {
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function interpolate(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function straightLine(a, b, steps = 20) {
  return Array.from({ length: steps + 1 }, (_, i) => interpolate(a, b, i / steps));
}

// Ruta con distancias acumuladas para ubicar un punto a X km del inicio
export function buildRoute(points) {
  const cumulative = [0];
  for (let i = 1; i < points.length; i += 1) {
    cumulative.push(cumulative[i - 1] + distanceKm(points[i - 1], points[i]));
  }
  return { points, cumulative, totalKm: cumulative[cumulative.length - 1] || 0 };
}

export function pointAtDistance(route, km) {
  const { points, cumulative, totalKm } = route;
  if (points.length === 0) return null;
  if (points.length === 1) return { ...points[0], bearing: 0, done: true };

  const clamped = Math.min(Math.max(km, 0), totalKm);
  let i = 1;
  while (i < points.length - 1 && cumulative[i] < clamped) i += 1;

  const segmentLength = cumulative[i] - cumulative[i - 1];
  const t = segmentLength === 0 ? 1 : (clamped - cumulative[i - 1]) / segmentLength;
  const position = interpolate(points[i - 1], points[i], t);

  // Rumbo del tramo actual; si es de largo cero se busca el siguiente tramo útil
  let heading = bearing(points[i - 1], points[i]);
  if (segmentLength === 0) {
    for (let j = i; j < points.length - 1; j += 1) {
      if (cumulative[j + 1] > cumulative[j]) {
        heading = bearing(points[j], points[j + 1]);
        break;
      }
    }
  }
  return { ...position, bearing: heading, done: clamped >= totalKm };
}

// Diferencia angular más corta entre dos rumbos, en (-180, 180]
export function angleDiff(from, to) {
  const diff = ((to - from + 540) % 360) - 180;
  return diff === -180 ? 180 : diff;
}

// Acerca `current` a `target` por el camino angular más corto; `factor` va de 0 a 1
export function smoothAngle(current, target, factor) {
  return (current + angleDiff(current, target) * factor + 360) % 360;
}

// Rumbo mirando `lookKm` por delante del punto actual, para que el carro gire antes de la curva
export function headingAhead(route, km, lookKm = 0.02) {
  const here = pointAtDistance(route, km);
  const ahead = pointAtDistance(route, km + lookKm);
  if (!here || !ahead || distanceKm(here, ahead) < 0.002) return here ? here.bearing : 0;
  return bearing(here, ahead);
}
