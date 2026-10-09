import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/Navigation.astro'), 'utf-8');

describe('Navigation simplification (T-012)', () => {
  it('has no letter-span class or split name spans', () => {
    expect(content).not.toMatch(/letter-span/);
    expect(content).not.toMatch(/name\.split\('/);
  });

  it('has no subtleLetterBounce keyframes', () => {
    expect(content).not.toMatch(/subtleLetterBounce/);
    expect(content).not.toMatch(/@keyframes/);
  });

  it('has no animated underline pseudo-element styles', () => {
    expect(content).not.toMatch(/\.nav-item\s+a::after/);
  });

  it('uses thinner navbar height', () => {
    expect(content).toMatch(/h-12\s+md:h-14/);
    expect(content).not.toMatch(/h-16\s+md:h-20/);
  });

  it('desktop nav links use monospace uppercase tracking classes', () => {
    expect(content).toMatch(/font-mono/);
    expect(content).toMatch(/tracking-\[0\.05em\]/);
    expect(content).toMatch(/uppercase/);
  });

  it('mobile menu items use monospace uppercase tracking classes', () => {
    expect(content).toMatch(/text-xl[\s\S]*font-mono/);
    expect(content).toMatch(/text-xl[\s\S]*tracking-\[0\.05em\]/);
    expect(content).toMatch(/text-xl[\s\S]*uppercase/);
  });

  it('mobile menu toggle has no card background hover classes', () => {
    expect(content).not.toMatch(/hover:bg-light-card-bg/);
    expect(content).not.toMatch(/dark:hover:bg-dark-card-bg/);
  });
});
