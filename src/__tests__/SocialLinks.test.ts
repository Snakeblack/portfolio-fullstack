import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/SocialLinks.astro'), 'utf-8');

describe('SocialLinks ghost style (T-020)', () => {
  it('social links do NOT have bg-light-card-bg class', () => {
    expect(content).not.toMatch(/bg-light-card-bg/);
  });

  it('social links do NOT have bg-dark-card-bg class', () => {
    expect(content).not.toMatch(/bg-dark-card-bg/);
  });

  it('social links have border border-light-border dark:border-dark-border', () => {
    expect(content).toMatch(/border\s+border-light-border\s+dark:border-dark-border/);
  });

  it('social links do NOT have hover:scale-110', () => {
    expect(content).not.toMatch(/hover:scale-110/);
  });

  it('social links have rounded-md (not rounded-lg)', () => {
    expect(content).toMatch(/rounded-md/);
    expect(content).not.toMatch(/rounded-lg/);
  });
});
