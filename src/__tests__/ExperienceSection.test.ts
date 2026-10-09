import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/ExperienceSection.astro'), 'utf-8');

describe('ExperienceSection redesign (T-016)', () => {
  it('period metadata uses monospace tracking and no italic', () => {
    expect(content).toMatch(/font-mono/);
    expect(content).toMatch(/tracking-\[0\.05em\]/);
    expect(content).not.toMatch(/italic/);
  });

  it('has no trigger-area interaction or expand collapse script', () => {
    expect(content).not.toMatch(/trigger-area/);
    expect(content).not.toMatch(/aria-expanded/);
    expect(content).not.toMatch(/addEventListener\('click'/);
    expect(content).not.toMatch(/addEventListener\('keydown'/);
    expect(content).not.toMatch(/is-active/);
  });

  it('details are always visible and do not use collapsed max-height state', () => {
    expect(content).not.toMatch(/max-height:\s*0/);
    expect(content).not.toMatch(/opacity:\s*0/);
    expect(content).not.toMatch(/details-container/);
  });

  it('timeline bar is thin', () => {
    expect(content).toMatch(/w-px/);
    expect(content).not.toMatch(/w-0\.5/);
  });

  it('timeline dot does not use dark background fill in dark mode', () => {
    expect(content).not.toMatch(/dark:bg-dark-bg/);
    expect(content).toMatch(/dark:bg-dark-card-bg|dark:bg-dark-border/);
  });

  it('section heading uses the updated h2 scale', () => {
    expect(content).toMatch(/text-\[1\.875rem\]/);
    expect(content).toMatch(/md:text-\[3\.75rem\]/);
    expect(content).toMatch(/tracking-tight/);
    expect(content).toMatch(/leading-\[1\.1\]/);
  });
});
