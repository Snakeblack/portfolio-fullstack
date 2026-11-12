import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const component = readFileSync(resolve(__dirname, '../components/WebGLBackground.astro'), 'utf-8');
const scene = readFileSync(resolve(__dirname, '../scene/snake.ts'), 'utf-8');

describe('Escena 3D', () => {
  it('carga three.js aparte, después del primer pintado', () => {
    expect(component).toMatch(/import\('\.\.\/scene\/snake'\)/);
    expect(component).not.toMatch(/^\s*import .* from ['"]three['"]/m);
    expect(component).toMatch(/requestIdleCallback/);
  });

  it('si la escena no arranca, retira el lienzo y la página sigue', () => {
    expect(component).toMatch(/\.catch\(/);
    expect(component).toMatch(/dataset\.scene\s*=\s*'off'/);
  });

  it('con movimiento reducido pinta una pose y no arranca el bucle', () => {
    const reduced = scene.indexOf('if (reducedMotion) return;');
    const loop = scene.indexOf('requestAnimationFrame(loop)');
    expect(reduced).toBeGreaterThan(-1);
    expect(loop).toBeGreaterThan(reduced);
    expect(scene).toMatch(/prefers-reduced-motion: reduce/);
  });

  it('para el bucle cuando la vista sale de pantalla o la pestaña se oculta', () => {
    expect(scene).toMatch(/IntersectionObserver/);
    expect(scene).toMatch(/visibilitychange/);
    expect(scene).toMatch(/cancelAnimationFrame/);
  });

  it('limita la densidad de píxeles', () => {
    expect(scene).toMatch(/setPixelRatio\(Math\.min\(Math\.max\(window\.devicePixelRatio, 1\.5\), 2\)\)/);
  });

  it('no deja que el tiempo de un fotograma sea negativo ni largo', () => {
    expect(scene).toMatch(/Math\.min\(Math\.max\(\(now - last\) \/ 1000, 0\), 0\.05\)/);
  });
});
