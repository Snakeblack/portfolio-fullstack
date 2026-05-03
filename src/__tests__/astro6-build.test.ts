import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(__dirname, '../..');
const DIST_DIR = resolve(ROOT, 'dist');

describe('Astro 6 build', () => {
  it('should build successfully and produce locale routes', () => {
    // Run the build - this validates Astro 6 compiles without errors
    execSync('pnpm build', { cwd: ROOT, stdio: 'pipe' });

    // Verify both locale routes are generated
    expect(existsSync(resolve(DIST_DIR, 'index.html'))).toBe(true);
    expect(existsSync(resolve(DIST_DIR, 'en', 'index.html'))).toBe(true);
  });
});
