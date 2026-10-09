import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/AboutSection.astro'), 'utf-8');

describe('AboutSection typography (T-018)', () => {
  it('heading uses dramatic scale and tighter typography', () => {
    expect(content).toMatch(/text-\[1\.875rem\]/);
    expect(content).toMatch(/md:text-\[3\.75rem\]/);
    expect(content).toMatch(/tracking-tight/);
    expect(content).toMatch(/leading-\[1\.1\]/);
  });
});
