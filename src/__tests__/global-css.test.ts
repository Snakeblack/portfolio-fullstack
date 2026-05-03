import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CSS_PATH = resolve(__dirname, '../styles/global.css');
const css = readFileSync(CSS_PATH, 'utf-8');

describe('global.css fixes (REQ-CSS-001 to 004)', () => {
  it('should NOT contain wildcard selector with transition-property', () => {
    // The old rule: *, *::before, *::after { transition-property: ... }
    const wildcardTransition = /\*\s*,[\s\S]*?\*\s*::\s*before[\s\S]*?\*\s*::\s*after[\s\S]*?transition-property/g;
    expect(css).not.toMatch(wildcardTransition);
    // Also check no bare * selector with transition-property
    const bareWildcardTransition = /\*\s*\{[^}]*transition-property/g;
    expect(css).not.toMatch(bareWildcardTransition);
  });

  it('should NOT contain .is-visible class rules', () => {
    expect(css).not.toMatch(/\.is-visible/);
  });

  it('should NOT contain .stagger-children.is-visible rules', () => {
    expect(css).not.toMatch(/\.stagger-children\.is-visible/);
  });

  it('should contain font-family with Geist Variable', () => {
    expect(css).toMatch(/font-family:\s*'Geist Variable'/);
  });

  it('should NOT contain font-family with Inter', () => {
    expect(css).not.toMatch(/font-family.*'Inter'/);
  });

  it('should contain @media (scripting: none) block', () => {
    expect(css).toMatch(/@media\s*\(scripting:\s*none\)/);
  });

  it('@media (scripting: none) should reset opacity and transform for scroll-animate classes', () => {
    // Extract the scripting:none block
    const scriptingMatch = css.match(/@media\s*\(scripting:\s*none\)\s*\{([\s\S]*?)\n\s*\}/);
    expect(scriptingMatch).not.toBeNull();
    const block = scriptingMatch![1];
    expect(block).toMatch(/opacity:\s*1/);
    expect(block).toMatch(/transform:\s*none/);
    // Should target scroll-animate, scroll-animate-fast, title-animate
    expect(block).toMatch(/scroll-animate/);
    expect(block).toMatch(/scroll-animate-fast/);
    expect(block).toMatch(/title-animate/);
  });

  it('should KEEP .stagger-children > * initial state rules', () => {
    expect(css).toMatch(/\.stagger-children\s*>\s*\*/);
    // Should have opacity: 0 in stagger-children children
    const staggerMatch = css.match(/\.stagger-children\s*>\s*\*[\s\S]*?opacity:\s*0/);
    expect(staggerMatch).not.toBeNull();
  });
});
