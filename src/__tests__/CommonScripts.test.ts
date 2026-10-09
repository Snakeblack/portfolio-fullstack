import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/CommonScripts.astro'), 'utf-8');

describe('CommonScripts refactor (REQ-SCROLL-001, 002, 005, 006)', () => {
  it('should remove IntersectionObserver fallback', () => {
    expect(content).not.toMatch(/IntersectionObserver/);
  });

  it('should remove setInterval polling', () => {
    expect(content).not.toMatch(/setInterval\(/);
  });

  it('should remove manual viewport checks', () => {
    expect(content).not.toMatch(/getBoundingClientRect\(/);
  });

  it('should remove force-show helper functions', () => {
    expect(content).not.toMatch(/forceShowVisibleElements/);
    expect(content).not.toMatch(/forceShowBottomElements/);
    expect(content).not.toMatch(/forceShowAllRemainingElements/);
    expect(content).not.toMatch(/cleanupIncompleteAnimations/);
    expect(content).not.toMatch(/forceShowSkillsSection/);
    expect(content).not.toMatch(/checkVisibleElements/);
  });

  it('should not configure ScrollTrigger locally', () => {
    expect(content).not.toMatch(/ScrollTrigger\.config\(/);
  });

  it('should not configure history.scrollRestoration locally', () => {
    expect(content).not.toMatch(/scrollRestoration/);
  });

  it('should import and use initSmoothAnchors utility', () => {
    expect(content).toMatch(/import\s+\{\s*initSmoothAnchors\s*\}\s+from/);
    expect(content).toMatch(/initSmoothAnchors\(/);
  });

  it('should use gsap.matchMedia for reduced motion', () => {
    expect(content).toMatch(/gsap\.matchMedia\(/);
    expect(content).toMatch(/prefers-reduced-motion:\s*reduce/);
  });

  it('should listen for anchor navigation events and refresh visible targets', () => {
    expect(content).toMatch(/hashchange/);
    expect(content).toMatch(/smooth-anchor:navigate/);
    expect(content).toMatch(/ScrollTrigger\.refresh\(/);
    expect(content).toMatch(/revealAnchorTarget/);
    expect(content).toMatch(/gsap\.to\(node/);
  });
});

describe('CommonScripts reduced amplitude (T-014)', () => {
  it('scroll-animate initial y value is 5 or less', () => {
    expect(content).toMatch(/y:\s*isFast\s*\?\s*[35]\s*:\s*isTitle\s*\?\s*5\s*:\s*5/);
  });

  it('stagger-children initial y value is 5 or less', () => {
    expect(content).toMatch(/gsap\.set\(children,[\s\S]*y:\s*5/);
  });

  it('stagger delay is 0.03 or less', () => {
    expect(content).toMatch(/stagger:\s*0\.03/);
  });
});
