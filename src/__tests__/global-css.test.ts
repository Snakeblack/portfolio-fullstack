import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const css = readFileSync(resolve(__dirname, '../styles/global.css'), 'utf-8');

describe('global.css', () => {
  it('no aplica transiciones con el selector universal', () => {
    expect(css).not.toMatch(/\*\s*,[\s\S]*?\*\s*::\s*before[\s\S]*?\*\s*::\s*after[\s\S]*?transition-property/g);
    expect(css).not.toMatch(/\*\s*\{[^}]*transition-property/g);
  });

  it('sirve las fuentes desde el propio sitio, sin CDN de terceros', () => {
    const sources = css.match(/src:\s*url\([^)]+\)/g) ?? [];
    expect(sources.length).toBeGreaterThanOrEqual(3);
    for (const source of sources) {
      expect(source).toMatch(/url\('\.\.\/assets\/fonts\/[a-z0-9-]+\.woff2'\)/);
    }
    expect(css).not.toMatch(/fontshare|googleapis|gstatic/);
  });

  it('no deja el texto invisible mientras carga la fuente', () => {
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    expect(faces.length).toBeGreaterThanOrEqual(3);
    for (const face of faces) {
      expect(face).toMatch(/font-display:\s*swap/);
    }
  });

  it('nunca oculta desde el CSS lo que entra con el scroll: sin script, el contenido se ve', () => {
    const rules = css.match(/[^{}]*\[data-reveal[^{}]*\{[^}]*\}/g) ?? [];
    for (const rule of rules) {
      expect(rule).not.toMatch(/opacity:\s*0|visibility:\s*hidden|display:\s*none/);
    }
  });

  it('las animaciones de carga solo corren con JavaScript y sin movimiento reducido', () => {
    const hidden = css.match(/[^{}]*\{[^}]*(?:opacity:\s*0;|translateY\(105%\))[^}]*animation:[^}]*\}/g) ?? [];
    expect(hidden.length).toBeGreaterThan(0);
    for (const rule of hidden) {
      expect(rule).toMatch(/\.js\s/);
    }
    const block = css.match(/@media \(prefers-reduced-motion: no-preference\)\s*\{([\s\S]*?)\n\}/);
    expect(block).not.toBeNull();
    expect(block![1]).toMatch(/load-line/);
    expect(block![1]).toMatch(/load-rise/);
  });

  it('respeta las reglas de la casa: sin degradados, sombras ni vidrio', () => {
    expect(css).not.toMatch(/gradient\(/);
    expect(css).not.toMatch(/box-shadow/);
    expect(css).not.toMatch(/backdrop-filter/);
  });

  it('de Tailwind solo trae el reinicio de estilos, sin utilidades', () => {
    expect(css).toMatch(/@import "tailwindcss\/preflight\.css" layer\(base\);/);
    expect(css).not.toMatch(/@import "tailwindcss";/);
  });

  it('el tema es solo oscuro', () => {
    expect(css).toMatch(/color-scheme:\s*dark/);
    expect(css).not.toMatch(/\.dark\b/);
  });
});
