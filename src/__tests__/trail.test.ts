import { describe, expect, it } from 'vitest';
import { bodyRadius, hurry, resampleTrail, steerAngle, strayFraction, wanderZone } from '../scene/trail';

describe('steerAngle', () => {
  it('llega al ángulo deseado si está dentro del giro máximo', () => {
    expect(steerAngle(0, 0.1, 0.5)).toBeCloseTo(0.1);
  });

  it('no gira más que el máximo', () => {
    expect(steerAngle(0, 2, 0.25)).toBeCloseTo(0.25);
    expect(steerAngle(0, -2, 0.25)).toBeCloseTo(-0.25);
  });

  it('cruza ±π por el camino corto', () => {
    const next = steerAngle(3, -3, 0.1); // de 172° a -172°: 16° por el lado de π
    expect(next).toBeCloseTo(3.1);
  });
});

describe('resampleTrail', () => {
  const straight = [0, 0, 0, 1, 0, 0, 3, 0, 0, 6, 0, 0]; // tramos de 1, 2 y 3

  it('reparte los puntos a distancias iguales aunque los tramos no lo sean', () => {
    const out = resampleTrail(straight, 4, 1.5, 4);
    expect(Array.from(out)).toEqual([0, 0, 0, 1.5, 0, 0, 3, 0, 0, 4.5, 0, 0]);
  });

  it('deja en el final los puntos que no caben en el recorrido', () => {
    const out = resampleTrail(straight, 4, 4, 3);
    expect(Array.from(out)).toEqual([0, 0, 0, 4, 0, 0, 6, 0, 0]);
  });

  it('solo usa los puntos válidos del búfer', () => {
    const out = resampleTrail(straight, 2, 0.5, 4);
    expect(Array.from(out)).toEqual([0, 0, 0, 0.5, 0, 0, 1, 0, 0, 1, 0, 0]);
  });

  it('sigue las esquinas', () => {
    const corner = [0, 0, 0, 2, 0, 0, 2, 2, 0];
    const out = resampleTrail(corner, 3, 1, 5);
    expect(Array.from(out)).toEqual([0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 1, 0, 2, 2, 0]);
  });

  it('con un solo punto los deja todos en él', () => {
    expect(Array.from(resampleTrail([5, 6, 7], 1, 1, 2))).toEqual([5, 6, 7, 5, 6, 7]);
  });
});

describe('bodyRadius', () => {
  it('se cierra en el hocico y en la punta de la cola', () => {
    expect(bodyRadius(0)).toBe(0);
    expect(bodyRadius(1)).toBe(0);
  });

  it('la cabeza es más ancha que el cuello y el cuerpo no pasa del radio máximo', () => {
    expect(bodyRadius(0.03)).toBeGreaterThan(bodyRadius(0.08));
    for (let s = 0.1; s < 1; s += 0.05) {
      expect(bodyRadius(s)).toBeLessThanOrEqual(1);
      expect(bodyRadius(s)).toBeGreaterThan(0);
    }
  });

  it('la cola se afina de forma monótona', () => {
    let previous = bodyRadius(0.6);
    for (let s = 0.65; s < 1; s += 0.05) {
      const radius = bodyRadius(s);
      expect(radius).toBeLessThan(previous);
      previous = radius;
    }
  });
});

describe('wanderZone', () => {
  const halfWidth = 8.9;

  it('en el hero la zona está centrada y ocupa casi todo el ancho', () => {
    const zone = wanderZone(0, halfWidth, false);
    expect(zone.centre).toBe(0);
    expect(zone.span).toBeCloseTo(halfWidth * 0.8);
  });

  it('al bajar a la introducción la zona se va a la mitad derecha y deja libre la columna de texto', () => {
    const zone = wanderZone(1, halfWidth, false);
    expect(zone.centre - zone.span).toBeGreaterThan(0);
    expect(zone.centre + zone.span).toBeLessThan(halfWidth);
  });

  it('se desplaza de forma continua con el scroll, nunca hacia la izquierda', () => {
    let previous = wanderZone(0, halfWidth, false);
    for (let scroll = 0.1; scroll <= 1.0001; scroll += 0.1) {
      const zone = wanderZone(scroll, halfWidth, false);
      expect(zone.centre).toBeGreaterThan(previous.centre);
      expect(zone.centre - zone.span).toBeGreaterThan(previous.centre - previous.span);
      previous = zone;
    }
  });

  it('en pantallas estrechas no hay sitio al lado: la zona no se mueve', () => {
    expect(wanderZone(0, 2.4, true)).toEqual(wanderZone(1, 2.4, true));
    expect(wanderZone(1, 2.4, true).centre).toBe(0);
  });
});

describe('strayFraction', () => {
  // Cuatro anillos en x = -3, -1, 1 y 3.
  const centres = new Float32Array([-3, 0, 0, -1, 5, 0, 1, 0, 0, 3, -2, 0]);

  it('cuenta la parte del cuerpo que queda a la izquierda del borde', () => {
    expect(strayFraction(centres, 4, -4)).toBe(0);
    expect(strayFraction(centres, 4, -2)).toBe(0.25);
    expect(strayFraction(centres, 4, 0)).toBe(0.5);
    expect(strayFraction(centres, 4, 10)).toBe(1);
  });

  it('sin anillos no hay nada fuera', () => {
    expect(strayFraction(centres, 0, 10)).toBe(0);
  });
});

describe('hurry', () => {
  it('con todo el cuerpo en su zona la serpiente va a su ritmo', () => {
    expect(hurry(0)).toBe(1);
  });

  it('se da más prisa cuanto más cuerpo queda fuera, hasta un tope', () => {
    expect(hurry(0.1)).toBeGreaterThan(1);
    expect(hurry(0.2)).toBeGreaterThan(hurry(0.1));
    expect(hurry(0.25)).toBe(hurry(1));
    expect(hurry(1)).toBe(5);
  });
});
