import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/SkillsSection.astro'), 'utf-8');

describe('SkillsSection redesign (T-017)', () => {
  it('soft-skill cards use visible glass styling', () => {
    expect(content).not.toMatch(/bg-light-card-bg/);
    expect(content).toMatch(/glass-card/);
    expect(content).not.toMatch(/gradient-border/);
  });

  it('technical skills do not use techColorMap or inline styles', () => {
    expect(content).not.toMatch(/techColorMap/);
    expect(content).not.toMatch(/hexToRgba/);
    expect(content).not.toMatch(/style=\{bgColorStyle\}/);
  });

  it('technical skills use monochrome bordered chips', () => {
    expect(content).toMatch(/border-light-border\s+dark:border-dark-border/);
    expect(content).toMatch(/font-mono/);
    expect(content).toMatch(/tracking-\[0\.05em\]/);
    expect(content).not.toMatch(/rounded-full/);
    expect(content).toMatch(/text-light-text\/80/);
    expect(content).toMatch(/dark:text-dark-text\/80/);
  });

  it('section heading uses the updated h2 scale', () => {
    expect(content).toMatch(/text-\[1\.875rem\]/);
    expect(content).toMatch(/md:text-\[3\.75rem\]/);
    expect(content).toMatch(/tracking-tight/);
    expect(content).toMatch(/leading-\[1\.1\]/);
  });
});
