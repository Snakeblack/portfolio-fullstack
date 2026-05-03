import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { readdirSync } from 'fs';

const COMPONENTS_DIR = resolve(__dirname, '../components');
const SRC_DIR = resolve(__dirname, '..');

function getAllSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.astro', '__tests__', 'dist'].includes(entry.name)) {
      files.push(...getAllSourceFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|astro|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Theme + Scroll fixes (REQ-THEME-001, REQ-SCROLL-001)', () => {
  describe('ThemeToggle.astro — no init code', () => {
    const content = readFileSync(resolve(COMPONENTS_DIR, 'ThemeToggle.astro'), 'utf-8');

    it('should NOT contain localStorage.getItem outside click handler', () => {
      // The init block reads localStorage to initialize — that should be removed
      // We check the script content: localStorage.getItem should only appear inside the click handler
      // and the matchMedia listener (which checks for explicit user preference)
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      expect(scriptMatch).not.toBeNull();
      const script = scriptMatch![1];

      // Count occurrences of localStorage.getItem('color-theme')
      const matches = script.match(/localStorage\.getItem\('color-theme'\)/g);
      // Should only appear in the click handler's matchMedia listener (1 occurrence: the matchMedia change handler)
      // NOT in the initialization block
      if (matches) {
        expect(matches.length).toBeLessThanOrEqual(1);
      }
    });

    it('should NOT call classList.toggle(dark, ...) for initialization', () => {
      // The init line: htmlElement.classList.toggle('dark', savedTheme === 'dark');
      // should be removed. The click handler's classList.toggle('dark') (without 2nd arg) is fine.
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      expect(scriptMatch).not.toBeNull();
      const script = scriptMatch![1];

      // Check there's no classList.toggle('dark', someExpression) — 2-arg form is init only
      expect(script).not.toMatch(/classList\.toggle\(\s*'dark'\s*,/);
    });
  });

  describe('CommonScripts.astro — no applyTheme or theme init', () => {
    const content = readFileSync(resolve(COMPONENTS_DIR, 'CommonScripts.astro'), 'utf-8');

    it('should NOT contain applyTheme function', () => {
      expect(content).not.toMatch(/function\s+applyTheme/);
    });

    it('should NOT contain theme initialization in DOMContentLoaded', () => {
      // The theme init block reads localStorage and calls applyTheme
      // Check that DOMContentLoaded handler does not contain localStorage.getItem('color-theme')
      const domContentLoadedMatch = content.match(/DOMContentLoaded['"]\s*,\s*function\s*\(\)\s*\{([\s\S]*?)(?=window\.addEventListener\('scroll'|\n\s*\}\);?\s*$)/);
      if (domContentLoadedMatch) {
        const handlerBody = domContentLoadedMatch[1];
        expect(handlerBody).not.toMatch(/localStorage\.getItem\('color-theme'\)/);
      }
    });

    it('should NOT contain toggleThemeAndIcons function', () => {
      expect(content).not.toMatch(/toggleThemeAndIcons/);
    });
  });

  describe('No pageYOffset in src/', () => {
    it('should have zero occurrences of pageYOffset across all source files', () => {
      const sourceFiles = getAllSourceFiles(SRC_DIR);
      const matches: string[] = [];

      for (const filePath of sourceFiles) {
        const fileContent = readFileSync(filePath, 'utf-8');
        if (fileContent.includes('pageYOffset')) {
          matches.push(filePath);
        }
      }

      expect(matches).toEqual([]);
    });
  });
});
