import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CSS_PATH = resolve(__dirname, '../styles/global.css');
const css = readFileSync(CSS_PATH, 'utf-8');

/**
 * Helper: extract oklch(L C H) values from a CSS string.
 * Returns an array of { l, c, h, raw } tuples.
 */
function extractOklch(text: string) {
  const re = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  const matches: { l: number; c: number; h: number; raw: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({
      l: parseFloat(m[1]),
      c: parseFloat(m[2]),
      h: parseFloat(m[3]),
      raw: m[0],
    });
  }
  return matches;
}

/**
 * Helper: extract the @theme block content.
 */
function extractThemeBlock(text: string): string {
  const match = text.match(/@theme\s*\{([\s\S]*?)\n\s*\}/);
  return match ? match[1] : '';
}

/**
 * Helper: parse CSS custom property declarations from a block.
 */
function parseVars(block: string) {
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  const vars: Record<string, string> = {};
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

const themeBlock = extractThemeBlock(css);
const themeVars = parseVars(themeBlock);

describe('T-002: @theme color tokens — hue 260, near-achromatic', () => {
  const baseTokens = [
    'color-light-bg', 'color-light-text', 'color-light-subtext',
    'color-light-card-bg', 'color-light-border',
    'color-dark-bg', 'color-dark-text', 'color-dark-subtext',
    'color-dark-card-bg', 'color-dark-border',
  ];

  const accentTokens = [
    'color-light-accent', 'color-light-accent-hover',
    'color-dark-accent', 'color-dark-accent-hover',
  ];

  it('all base tokens use chroma ≤ 0.02', () => {
    for (const token of baseTokens) {
      const val = themeVars[token];
      expect(val, `token --${token} should exist`).toBeDefined();
      const parsed = extractOklch(val);
      expect(parsed.length, `--${token} should contain oklch()`).toBeGreaterThanOrEqual(1);
      expect(parsed[0].c, `--${token} chroma should be ≤ 0.02`).toBeLessThanOrEqual(0.02);
    }
  });

  it('all accent tokens use chroma 0.18–0.22', () => {
    for (const token of accentTokens) {
      const val = themeVars[token];
      expect(val, `token --${token} should exist`).toBeDefined();
      const parsed = extractOklch(val);
      expect(parsed.length, `--${token} should contain oklch()`).toBeGreaterThanOrEqual(1);
      expect(parsed[0].c, `--${token} chroma should be ≥ 0.18`).toBeGreaterThanOrEqual(0.18);
      expect(parsed[0].c, `--${token} chroma should be ≤ 0.22`).toBeLessThanOrEqual(0.22);
    }
  });

  it('all tokens use hue 260', () => {
    const allTokens = [...baseTokens, ...accentTokens];
    for (const token of allTokens) {
      const val = themeVars[token];
      const parsed = extractOklch(val!);
      expect(parsed[0].h, `--${token} hue should be 260`).toBe(260);
    }
  });

  it('light text-bg L separation ≥ 0.25', () => {
    const bgL = extractOklch(themeVars['color-light-bg']!)[0].l;
    const textL = extractOklch(themeVars['color-light-text']!)[0].l;
    expect(bgL - textL, 'light bg-text L separation').toBeGreaterThanOrEqual(0.25);
  });

  it('dark text-bg L separation ≥ 0.25', () => {
    const bgL = extractOklch(themeVars['color-dark-bg']!)[0].l;
    const textL = extractOklch(themeVars['color-dark-text']!)[0].l;
    expect(textL - bgL, 'dark text-bg L separation').toBeGreaterThanOrEqual(0.25);
  });

  it('no oklch values use hue 240 in @theme block', () => {
    const allValues = Object.values(themeVars).join(' ');
    const oklchValues = extractOklch(allValues);
    for (const v of oklchValues) {
      expect(v.h, `found hue 240 in @theme: ${v.raw}`).not.toBe(240);
    }
  });
});

describe('T-003: gradient tokens in @theme', () => {
  it('defines --color-gradient-start in @theme', () => {
    expect(themeVars['color-gradient-start']).toBeDefined();
  });

  it('defines --color-gradient-end in @theme', () => {
    expect(themeVars['color-gradient-end']).toBeDefined();
  });

  it('gradient-start chroma is 0.20', () => {
    const parsed = extractOklch(themeVars['color-gradient-start']!);
    expect(parsed.length).toBeGreaterThanOrEqual(1);
    expect(parsed[0].c).toBe(0.20);
  });

  it('gradient-end chroma is 0.18', () => {
    const parsed = extractOklch(themeVars['color-gradient-end']!);
    expect(parsed.length).toBeGreaterThanOrEqual(1);
    expect(parsed[0].c).toBe(0.18);
  });
});

describe('T-004: body::after grain overlay', () => {
  const bodyAfterMatch = css.match(/body\s*::\s*after\s*\{([\s\S]*?)\}/);
  const bodyAfter = bodyAfterMatch ? bodyAfterMatch[1] : '';

  it('body::after has position fixed, inset 0', () => {
    expect(bodyAfter).toMatch(/position:\s*fixed/);
    expect(bodyAfter).toMatch(/inset:\s*0/);
  });

  it('body::after has pointer-events none', () => {
    expect(bodyAfter).toMatch(/pointer-events:\s*none/);
  });

  it('body::after does not sit above all content with extreme z-index', () => {
    expect(bodyAfter).not.toMatch(/z-index:\s*9999/);
    expect(bodyAfter).toMatch(/z-index:\s*0/);
  });

  it('body::after has opacity between 0.02 and 0.04', () => {
    const opacityMatch = bodyAfter.match(/opacity:\s*([\d.]+)/);
    expect(opacityMatch).not.toBeNull();
    const opacity = parseFloat(opacityMatch![1]);
    expect(opacity).toBeGreaterThanOrEqual(0.02);
    expect(opacity).toBeLessThanOrEqual(0.04);
  });

  it('dark mode body::after has higher opacity', () => {
    const darkMatch = css.match(/\.dark\s+body\s*::\s*after\s*\{([\s\S]*?)\}/);
    expect(darkMatch).not.toBeNull();
    const darkOpacity = parseFloat(darkMatch![1].match(/opacity:\s*([\d.]+)/)![1]);
    const lightOpacity = parseFloat(bodyAfter.match(/opacity:\s*([\d.]+)/)![1]);
    expect(darkOpacity).toBeGreaterThan(lightOpacity);
  });

  it('body::after has background-image with data URI SVG', () => {
    expect(bodyAfter).toMatch(/background-image:\s*url\(["']?data:image\/svg\+xml/);
  });
});

describe('T-005: .gradient-border utility', () => {
  it('.gradient-border class exists in global.css', () => {
    expect(css).toMatch(/\.gradient-border\s*\{/);
  });

  it('.gradient-border::before uses mask or -webkit-mask', () => {
    const gradientBeforeMatch = css.match(/\.gradient-border\s*::\s*before\s*\{([\s\S]*?)\}/);
    expect(gradientBeforeMatch).not.toBeNull();
    const block = gradientBeforeMatch![1];
    expect(block).toMatch(/-webkit-mask|mask/);
  });

  it('.gradient-border::before references gradient tokens', () => {
    expect(css).toMatch(/--color-gradient-start/);
    expect(css).toMatch(/--color-gradient-end/);
  });

  it('@supports not (mask-composite: exclude) fallback exists', () => {
    expect(css).toMatch(/@supports\s+not\s*\(\s*mask-composite:\s*exclude\s*\)/);
  });
});

describe('T-006: animation amplitude — translateY 5px fallback', () => {
  it('global.css .scroll-animate translateY is 5px not 20px', () => {
    const scrollAnimateBlock = css.match(/\.scroll-animate,?[\s\S]*?\.title-animate\s*\{([\s\S]*?)\}/);
    expect(scrollAnimateBlock).not.toBeNull();
    const block = scrollAnimateBlock![1];
    expect(block).toMatch(/translateY\(5px\)/);
    expect(block).not.toMatch(/translateY\(20px\)/);
  });

  it('global.css .stagger-children > * translateY is 5px not 10px', () => {
    const staggerBlock = css.match(/\.stagger-children\s*>\s*\*\s*\{([\s\S]*?)\}/);
    expect(staggerBlock).not.toBeNull();
    const block = staggerBlock![1];
    expect(block).toMatch(/translateY\(5px\)/);
    expect(block).not.toMatch(/translateY\(10px\)/);
  });
});

describe('T-007: font-geist-mono utility class', () => {
  it('global.css defines font-family containing Geist Mono', () => {
    expect(css).toMatch(/--font-mono:\s*['"]Geist Mono['"]/);
  });
});

describe('T-022: scrollbar color tokens — verify hue 260', () => {
  it('no oklch values use hue 240 in scrollbar rules', () => {
    // Extract scrollbar-related rules (webkit-scrollbar blocks)
    const scrollbarBlocks = css.match(/::-webkit-scrollbar[\s\S]*?(?=\n[^}\s]|\n@|$)/g) || [];
    const allScrollbar = scrollbarBlocks.join(' ');
    const oklchValues = extractOklch(allScrollbar);
    for (const v of oklchValues) {
      expect(v.h, `found hue 240 in scrollbar: ${v.raw}`).not.toBe(240);
    }
  });
});

describe('T-023: prefers-reduced-motion disables grain overlay', () => {
  it('prefers-reduced-motion sets body::after opacity to 0', () => {
    // Find the prefers-reduced-motion block that contains body::after
    const prMatches = css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\s*\}/g);
    let found = false;
    for (const m of prMatches) {
      const block = m[1];
      if (block.includes('body::after') || block.includes('body ::after')) {
        expect(block).toMatch(/opacity:\s*0/);
        found = true;
        break;
      }
    }
    expect(found, 'expected a prefers-reduced-motion block containing body::after with opacity: 0').toBe(true);
  });
});
