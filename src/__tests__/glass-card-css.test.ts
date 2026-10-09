import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../styles/global.css'), 'utf-8');

describe('glass-card utility', () => {
  it('defines reusable glass-card utility styles', () => {
    expect(content).toMatch(/\.glass-card\s*\{/);
    expect(content).toMatch(/background-color:\s*rgb\(255 255 255 \/ 0\.45\)/);
    expect(content).toMatch(/backdrop-filter:\s*blur\(12px\)/);
  });

  it('defines dark mode glass-card override', () => {
    expect(content).toMatch(/\.dark \.glass-card\s*\{/);
    expect(content).toMatch(/rgb\(255 255 255 \/ 0\.04\)/);
  });
});
