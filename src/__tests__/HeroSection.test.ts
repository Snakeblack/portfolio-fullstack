import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/HeroSection.astro'), 'utf-8');

describe('HeroSection redesign (T-013)', () => {
  it('has no typing name span or blinking cursor', () => {
    expect(content).not.toMatch(/id="typing-name"/);
    expect(content).not.toMatch(/\|<\/span>/);
  });

  it('has no typing animation script logic', () => {
    expect(content).not.toMatch(/DOMContentLoaded/);
    expect(content).not.toMatch(/typeWriter/);
    expect(content).not.toMatch(/nameElement/);
  });

  it('hero h1 uses dramatic typography classes', () => {
    expect(content).toMatch(/text-\[3rem\]/);
    expect(content).toMatch(/lg:text-\[6rem\]/);
    expect(content).toMatch(/tracking-\[-0\.025em\]/);
    expect(content).toMatch(/font-bold/);
    expect(content).toMatch(/leading-none/);
  });

  it('name span keeps accent color and line break', () => {
    expect(content).toMatch(/text-light-accent\s+dark:text-dark-accent/);
    expect(content).toMatch(/<br\s*\/?/);
  });

  it('cta uses ghost monospace styling', () => {
    expect(content).toMatch(/font-mono/);
    expect(content).toMatch(/tracking-\[0\.05em\]/);
    expect(content).toMatch(/uppercase/);
    expect(content).not.toMatch(/shadow-sm/);
    expect(content).not.toMatch(/hover:shadow-md/);
    expect(content).toMatch(/border-light-accent\/50/);
  });
});
