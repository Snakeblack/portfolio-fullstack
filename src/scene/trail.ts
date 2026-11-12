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

/** Lo más deprisa que avanza la simulación cuando la serpiente tiene que salir de detrás del texto. */
const MAX_HURRY = 5;
/** Parte del cuerpo fuera de su zona a partir de la cual la prisa es la máxima. */
const FULL_HURRY_STRAY = 0.25;

/**
 * Franja horizontal por la que deambula la serpiente, en unidades de escena: `centre` ± `span`.
 * En el hero ocupa casi todo el ancho; al bajar a la introducción (`scroll` de 0 a 1) se va a la
 * mitad derecha y deja libre la columna de texto. En pantallas estrechas no hay sitio al lado.
 */
export function wanderZone(scroll: number, halfWidth: number, narrow: boolean): { centre: number; span: number } {
  if (narrow) return { centre: 0, span: halfWidth * 0.62 };
  return { centre: halfWidth * 0.55 * scroll, span: halfWidth * (0.8 - 0.4 * scroll) };
}

/** Parte del cuerpo, de 0 a 1, que queda a la izquierda de `edge`. `centres` guarda ternas xyz. */
export function strayFraction(centres: ArrayLike<number>, count: number, edge: number): number {
  if (count <= 0) return 0;
  let stray = 0;
  for (let i = 0; i < count; i++) {
    if (centres[i * 3] < edge) stray++;
  }
  return stray / count;
}

/**
 * Cuántas veces más deprisa avanza la simulación según la parte del cuerpo que queda fuera de su
 * zona: a su ritmo si no queda nada, y cada vez menos deprisa a medida que el cuerpo va entrando.
 */
export function hurry(stray: number): number {
  const urgency = Math.min(Math.max(stray / FULL_HURRY_STRAY, 0), 1);
  return 1 + (MAX_HURRY - 1) * urgency;
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
