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
    expect(hiddenBlock![1]).toMatch(/visibility:\s*hidden/);
    expect(hiddenBlock![1]).toMatch(/height:\s*0/);
    expect(hiddenBlock![1]).toMatch(/overflow:\s*hidden/);
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
