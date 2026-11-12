import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../components/CommonScripts.astro'), 'utf-8');

describe('CommonScripts (REQ-SCROLL-001, 002, 005, 006)', () => {
  it('uses one reveal system and no animation library', () => {
    expect(content).toMatch(/import\s+\{\s*initReveal\s*\}\s+from/);
    expect(content.match(/initReveal\(/g)).toHaveLength(1);
    expect(content).not.toMatch(/gsap|ScrollTrigger/i);
  });

  it('should not poll with setInterval', () => {
    expect(content).not.toMatch(/setInterval\(/);
  });

  it('should not check the viewport by hand', () => {
    expect(content).not.toMatch(/getBoundingClientRect\(/);
  });

  it('should have no force-show helper functions', () => {
    expect(content).not.toMatch(/forceShowVisibleElements/);
    expect(content).not.toMatch(/forceShowBottomElements/);
    expect(content).not.toMatch(/forceShowAllRemainingElements/);
    expect(content).not.toMatch(/cleanupIncompleteAnimations/);
    expect(content).not.toMatch(/forceShowSkillsSection/);
    expect(content).not.toMatch(/checkVisibleElements/);
  });

  it('should not configure history.scrollRestoration locally', () => {
    expect(content).not.toMatch(/scrollRestoration/);
  });

  it('should import and use initSmoothAnchors utility', () => {
    expect(content).toMatch(/import\s+\{\s*initSmoothAnchors\s*\}\s+from/);
    expect(content).toMatch(/initSmoothAnchors\(/);
  });

  it('hides nothing with reduced motion, also when it is asked for with the page open', () => {
    expect(content).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(content).toMatch(/initReveal\(document, motion\.matches\)/);
    expect(content).toMatch(/motion\.addEventListener\('change'/);
    expect(content).toMatch(/reveal\.destroy\(\)/);
  });

  it('should listen for anchor navigation events and show what the target holds', () => {
    expect(content).toMatch(/hashchange/);
    expect(content).toMatch(/smooth-anchor:navigate/);
    expect(content).toMatch(/revealAnchorTarget/);
    expect(content).toMatch(/reveal\.showWithin\(/);
  });
});
