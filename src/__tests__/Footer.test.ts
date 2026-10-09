import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/Footer.astro'), 'utf-8');

describe('Footer monospace treatment (T-019)', () => {
  it('footer text elements have font-mono class', () => {
    expect(content).toMatch(/font-mono/);
  });

  it('footer text elements have tracking-[0.05em] class', () => {
    expect(content).toMatch(/tracking-\[0\.05em\]/);
  });
});
