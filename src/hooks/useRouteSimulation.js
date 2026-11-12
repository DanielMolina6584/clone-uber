import { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '../config/app';
import { buildRoute, headingAhead, pointAtDistance, smoothAngle } from '../utils/geo';

const FRAME_MS = 60;
const TURN_SMOOTHING_MS = 180;

// Mueve un punto a lo largo de `points` a `speedKmh`, interpolando entre vértices.
// `onPublish` se llama cada `publishMs` (para Firestore); `onArrive` una sola vez al final.
export function useRouteSimulation({ points, active, speedKmh, publishMs = APP_CONFIG.locationIntervalMs, onPublish, onArrive }) {
  const [position, setPosition] = useState(null);
  const [arrived, setArrived] = useState(false);
  const callbacks = useRef({ onPublish, onArrive });
  callbacks.current = { onPublish, onArrive };
  const speedRef = useRef(speedKmh);
  speedRef.current = speedKmh;

  useEffect(() => {
    setArrived(false);
    if (!points || points.length === 0) {
      setPosition(null);
      return undefined;
    }
    const route = buildRoute(points);
    let heading = headingAhead(route, 0);
    setPosition({ ...pointAtDistance(route, 0), bearing: heading, remainingKm: route.totalKm });
    if (!active) return undefined;

    let frame = null;
    let travelled = 0;
    let last = Date.now();
    let lastRender = 0;
    let lastPublish = 0;
    let finished = false;

    const step = () => {
      const now = Date.now();
      const elapsed = now - last;
      travelled += (elapsed / 3600000) * speedRef.current;
      last = now;
      heading = smoothAngle(heading, headingAhead(route, travelled), 1 - Math.exp(-elapsed / TURN_SMOOTHING_MS));
      const point = { ...pointAtDistance(route, travelled), bearing: heading, remainingKm: Math.max(route.totalKm - travelled, 0) };

      if (now - lastRender >= FRAME_MS || point.done) {
        lastRender = now;
        setPosition(point);
      }
      if (now - lastPublish >= publishMs || point.done) {
        lastPublish = now;
        callbacks.current.onPublish?.(point);
      }
      if (point.done) {
        if (!finished) {
          finished = true;
          setArrived(true);
          callbacks.current.onArrive?.();
        }
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [points, active, publishMs]);

  return { position, arrived };
}
