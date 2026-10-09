import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FILE_PATH = resolve(__dirname, '../components/ProjectsSection.astro');
const content = readFileSync(FILE_PATH, 'utf-8');

describe('ProjectsSection simplification (REQ-PROJ-001 to 003)', () => {
  it('should NOT keep scroll-animate-fast on project cards', () => {
    const articleClassMatch = content.match(/<article[\s\S]*?class=\{`([^`]+)`\}/);
    expect(articleClassMatch).not.toBeNull();
    expect(articleClassMatch![1]).toContain('project-item');
    expect(articleClassMatch![1]).toContain('project-card-hover');
    expect(articleClassMatch![1]).not.toContain('scroll-animate-fast');
  });

  it('should NOT contain project-animate-in class logic', () => {
    expect(content).not.toMatch(/project-animate-in/);
  });

  it('should NOT contain @keyframes projectFadeInFresh', () => {
    expect(content).not.toMatch(/@keyframes\s+projectFadeInFresh/);
  });

  it('should keep project-hidden as layout-only class', () => {
    const hiddenBlock = content.match(/\.project-hidden\s*\{([\s\S]*?)\}/);
    expect(hiddenBlock).not.toBeNull();
    expect(hiddenBlock![1]).toMatch(/display:\s*none/);
    expect(hiddenBlock![1]).toMatch(/border:\s*0/);
    expect(hiddenBlock![1]).not.toMatch(/opacity:/);
    expect(hiddenBlock![1]).not.toMatch(/transform:/);
    expect(hiddenBlock![1]).not.toMatch(/filter:/);
    expect(hiddenBlock![1]).not.toMatch(/transition:/);
  });

  it('should keep project-visible as layout-only class', () => {
    const visibleBlock = content.match(/\.project-visible\s*\{([\s\S]*?)\}/);
    expect(visibleBlock).not.toBeNull();
    expect(visibleBlock![1]).toMatch(/visibility:\s*visible/);
    expect(visibleBlock![1]).toMatch(/height:\s*auto/);
    expect(visibleBlock![1]).not.toMatch(/opacity:/);
    expect(visibleBlock![1]).not.toMatch(/transform:/);
    expect(visibleBlock![1]).not.toMatch(/filter:/);
    expect(visibleBlock![1]).not.toMatch(/transition:/);
  });

  it('should preserve show_all URL toggle behavior', () => {
    expect(content).toMatch(/searchParams\.set\('show_all',\s*'true'\)/);
    expect(content).toMatch(/searchParams\.delete\('show_all'\)/);
    expect(content).toMatch(/aria-pressed/);
  });

  it('should keep stagger-children on the grid container', () => {
    expect(content).toMatch(/class="grid[^"]*stagger-children/);
  });
});

describe('ProjectsSection redesign (T-015)', () => {
  it('project cards use visible glass styling instead of hard borders', () => {
    expect(content).not.toMatch(/bg-light-card-bg/);
    expect(content).toMatch(/glass-card/);
    expect(content).not.toMatch(/gradient-border/);
  });

  it('tech chips do not use techColorMap inline styles', () => {
    expect(content).not.toMatch(/getTechChipStyles/);
    expect(content).not.toMatch(/style=\{bgColorStyle\}/);
    expect(content).toMatch(/border-light-border\s+dark:border-dark-border/);
  });

  it('tech chips use monochrome rounded monospace styles', () => {
    expect(content).toMatch(/font-mono/);
    expect(content).toMatch(/tracking-\[0\.05em\]/);
    expect(content).toMatch(/rounded\b/);
    expect(content).not.toMatch(/rounded-full/);
    expect(content).toMatch(/text-light-text\/80/);
    expect(content).toMatch(/dark:text-dark-text\/80/);
  });

  it('project cards do not keep 3D hover transforms', () => {
    expect(content).not.toMatch(/rotateX/);
    expect(content).not.toMatch(/translateY\(-12px\)/);
  });

  it('project year uses monospace metadata treatment', () => {
    expect(content).toMatch(/project\.year/);
    expect(content).toMatch(/font-mono/);
    expect(content).toMatch(/tracking-\[0\.05em\]/);
    expect(content).not.toMatch(/italic/);
  });

  it('section heading uses the updated h2 scale', () => {
    expect(content).toMatch(/text-\[1\.875rem\]/);
    expect(content).toMatch(/md:text-\[3\.75rem\]/);
    expect(content).toMatch(/tracking-tight/);
    expect(content).toMatch(/leading-\[1\.1\]/);
  });

  it('show all button container keeps positive top margin on mobile', () => {
    expect(content).not.toMatch(/class="-mt-16 md:mt-16/);
    expect(content).toMatch(/class="mt-8 md:mt-16/);
  });
});
