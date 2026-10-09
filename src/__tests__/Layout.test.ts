import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../layouts/Layout.astro'), 'utf-8');

describe('Layout animation ownership (REQ-SCROLL-003, REQ-SCROLL-004)', () => {
  it('should configure history.scrollRestoration in head script', () => {
    expect(content).toMatch(/scrollRestoration/);
    expect(content).toMatch(/<head>[\s\S]*<script is:inline>[\s\S]*scrollRestoration[\s\S]*<\/script>/);
  });

  it('should configure ScrollTrigger in layout inline script', () => {
    expect(content).toMatch(/ScrollTrigger\.config\(/);
  });
});

describe('T-008: Geist Mono import in Layout.astro', () => {
  it('imports geist-mono/wght.css', () => {
    expect(content).toMatch(/@fontsource-variable\/geist-mono\/wght\.css/);
  });

  it('Geist Mono import is separate from Geist Variable import', () => {
    // Both imports should be present as separate import statements
    const imports = content.match(/import\s+["'][^"']+["']/g) || [];
    const hasGeistVariable = imports.some(i => i.includes('@fontsource-variable/geist/wght.css'));
    const hasGeistMono = imports.some(i => i.includes('@fontsource-variable/geist-mono/wght.css'));
    expect(hasGeistVariable, 'should import Geist Variable').toBe(true);
    expect(hasGeistMono, 'should import Geist Mono').toBe(true);
  });
});
