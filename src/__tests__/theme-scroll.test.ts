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
  describe('Tema solo oscuro', () => {
    it('no queda selector de tema ni preferencia guardada', () => {
      const sourceFiles = getAllSourceFiles(SRC_DIR);
      const matches = sourceFiles.filter((filePath) => /ThemeToggle|color-theme|themeChanged/.test(readFileSync(filePath, 'utf-8')));
      expect(matches).toEqual([]);
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
