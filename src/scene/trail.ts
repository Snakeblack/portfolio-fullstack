/**
 * Geometría del recorrido de la serpiente, sin dependencias, para poder probarla.
 */

const TAU = Math.PI * 2;

/** Gira `current` hacia `desired` por el camino corto, sin pasar de `maxTurn` radianes. */
export function steerAngle(current: number, desired: number, maxTurn: number): number {
  let delta = (desired - current) % TAU;
  if (delta > Math.PI) delta -= TAU;
  if (delta < -Math.PI) delta += TAU;
  if (delta > maxTurn) delta = maxTurn;
  if (delta < -maxTurn) delta = -maxTurn;
  return current + delta;
}

/**
 * Reparte `count` puntos a `spacing` de distancia a lo largo de una polilínea.
 * `path` guarda ternas xyz con el punto más reciente (la cabeza) primero; solo valen las
 * `pointCount` primeras. Si el recorrido se acaba, los puntos que sobran se quedan en su final.
 */
export function resampleTrail(
  path: ArrayLike<number>,
  pointCount: number,
  spacing: number,
  count: number,
  out: Float32Array = new Float32Array(count * 3),
): Float32Array {
  if (pointCount <= 0) {
    out.fill(0, 0, count * 3);
    return out;
  }

  let segment = 0;
  let segmentStart = 0; // distancia recorrida hasta el inicio del tramo actual
  let segmentLength = pointCount > 1 ? distance(path, 0, 1) : 0;

  for (let i = 0; i < count; i++) {
    const target = i * spacing;
    while (segment < pointCount - 2 && target > segmentStart + segmentLength) {
      segmentStart += segmentLength;
      segment++;
      segmentLength = distance(path, segment, segment + 1);
    }

    const a = segment * 3;
    const b = Math.min(segment + 1, pointCount - 1) * 3;
    const t = segmentLength > 0 ? Math.min((target - segmentStart) / segmentLength, 1) : 0;
    const o = i * 3;
    out[o] = path[a] + (path[b] - path[a]) * t;
    out[o + 1] = path[a + 1] + (path[b + 1] - path[a + 1]) * t;
    out[o + 2] = path[a + 2] + (path[b + 2] - path[a + 2]) * t;
  }

  return out;
}

function distance(path: ArrayLike<number>, i: number, j: number): number {
  const a = i * 3;
  const b = j * 3;
  return Math.hypot(path[b] - path[a], path[b + 1] - path[a + 1], path[b + 2] - path[a + 2]);
}

/**
 * Radio del cuerpo en la fracción `s` de su largo (0 en el hocico, 1 en la punta de la cola),
 * como proporción del radio máximo: hocico redondeado, cuello algo más fino y cola larga.
 */
export function bodyRadius(s: number): number {
  if (s <= 0 || s >= 1) return 0;
  const snout = Math.sqrt(Math.min(s / 0.022, 1));
  const head = 1.12 - 0.3 * smooth((s - 0.03) / 0.05);
  const body = 0.82 + 0.18 * smooth((s - 0.08) / 0.2);
  const neckToBody = s < 0.08 ? head : body;
  const tail = 1 - smooth((s - 0.55) / 0.45);
  return snout * neckToBody * Math.pow(tail, 0.8);
}

function smooth(x: number): number {
  const t = Math.min(Math.max(x, 0), 1);
  return t * t * (3 - 2 * t);
}
