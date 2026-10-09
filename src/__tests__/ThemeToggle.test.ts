import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/ThemeToggle.astro'), 'utf-8');

describe('ThemeToggle minimal style (T-021)', () => {
  it('toggle button does NOT have hover:bg-light-card-bg', () => {
    expect(content).not.toMatch(/hover:bg-light-card-bg/);
  });

  it('toggle button does NOT have hover:bg-dark-card-bg', () => {
    expect(content).not.toMatch(/hover:bg-dark-card-bg/);
  });

  it('toggle button does NOT have hover:scale-110', () => {
    expect(content).not.toMatch(/hover:scale-110/);
  });

  it('toggle button has transition-colors (not transition-all)', () => {
    expect(content).toMatch(/transition-colors/);
    expect(content).not.toMatch(/transition-all/);
  });

  it('toggle button has rounded-md (not rounded-lg)', () => {
    expect(content).toMatch(/rounded-md/);
    expect(content).not.toMatch(/rounded-lg/);
  });
});
