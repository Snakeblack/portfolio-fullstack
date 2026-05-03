import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { readFileSync, readdirSync } from 'fs';

const COMPONENTS_DIR = resolve(__dirname, '../components');
const SRC_DIR = resolve(__dirname, '..');

const DEAD_FILES = [
  'CommonScripts_backup.astro',
  'CommonScripts_clean.astro',
  'MobileFallback.astro',
  'ScrollReveal.astro',
];

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

describe('Dead file cleanup', () => {
  it.each(DEAD_FILES)('should not exist: %s', (filename) => {
    const filePath = resolve(COMPONENTS_DIR, filename);
    expect(existsSync(filePath)).toBe(false);
  });

  it('should have no dangling imports of deleted files in src/', () => {
    const deadFileStems = DEAD_FILES.map((f) => f.replace('.astro', ''));
    const sourceFiles = getAllSourceFiles(SRC_DIR);
    const danglingRefs: string[] = [];

    for (const filePath of sourceFiles) {
      const content = readFileSync(filePath, 'utf-8');
      for (const stem of deadFileStems) {
        // Match import statements or component usage referencing the dead file
        const importRegex = new RegExp(`import\\s+.*from\\s+['"].*${stem}['"]`, 'i');
        const componentRegex = new RegExp(`<${stem}[\\s/>]`, 'i');
        if (importRegex.test(content) || componentRegex.test(content)) {
          danglingRefs.push(`${filePath}: references ${stem}`);
        }
      }
    }

    expect(danglingRefs).toEqual([]);
  });
});
