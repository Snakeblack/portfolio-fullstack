import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const COMPONENTS_DIR = resolve(__dirname, '../components');
const UTILS_DIR = resolve(__dirname, '../utils');

describe('Accessibility fixes (REQ-A11Y-001, REQ-A11Y-002)', () => {
  describe('WebGLBackground.astro canvas attributes', () => {
    const content = readFileSync(resolve(COMPONENTS_DIR, 'WebGLBackground.astro'), 'utf-8');

    it('canvas element should have aria-hidden="true"', () => {
      expect(content).toMatch(/<canvas[^>]*aria-hidden\s*=\s*"true"/);
    });

    it('canvas element should have role="presentation"', () => {
      expect(content).toMatch(/<canvas[^>]*role\s*=\s*"presentation"/);
    });
  });

  describe('translations.ts nav.menuOpen and nav.menuClose', () => {
    const content = readFileSync(resolve(UTILS_DIR, 'translations.ts'), 'utf-8');

    it('should have nav.menuOpen key in es locale', () => {
      // Find es.nav block and check for menuOpen
      const esNavMatch = content.match(/es:\s*\{[\s\S]*?nav:\s*\{([\s\S]*?)\}/);
      expect(esNavMatch).not.toBeNull();
      expect(esNavMatch![1]).toMatch(/menuOpen/);
    });

    it('should have nav.menuClose key in es locale', () => {
      const esNavMatch = content.match(/es:\s*\{[\s\S]*?nav:\s*\{([\s\S]*?)\}/);
      expect(esNavMatch).not.toBeNull();
      expect(esNavMatch![1]).toMatch(/menuClose/);
    });

    it('should have nav.menuOpen key in en locale', () => {
      const enNavMatch = content.match(/en:\s*\{[\s\S]*?nav:\s*\{([\s\S]*?)\}/);
      expect(enNavMatch).not.toBeNull();
      expect(enNavMatch![1]).toMatch(/menuOpen/);
    });

    it('should have nav.menuClose key in en locale', () => {
      const enNavMatch = content.match(/en:\s*\{[\s\S]*?nav:\s*\{([\s\S]*?)\}/);
      expect(enNavMatch).not.toBeNull();
      expect(enNavMatch![1]).toMatch(/menuClose/);
    });
  });

  describe('Navigation.astro localized menu button', () => {
    const content = readFileSync(resolve(COMPONENTS_DIR, 'Navigation.astro'), 'utf-8');

    it('should NOT contain hardcoded "Abrir el menú" sr-only text', () => {
      expect(content).not.toMatch(/<span class="sr-only">Abrir el menú<\/span>/);
    });

    it('should use t.nav.menuOpen for sr-only text', () => {
      expect(content).toMatch(/t\.nav\.menuOpen/);
    });

    it('should use t.nav.menuClose somewhere for expanded state', () => {
      expect(content).toMatch(/t\.nav\.menuClose/);
    });
  });
});
