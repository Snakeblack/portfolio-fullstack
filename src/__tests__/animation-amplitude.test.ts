import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CSS_PATH = resolve(__dirname, '../styles/global.css');
const css = readFileSync(CSS_PATH, 'utf-8');

describe('T-006: animation amplitude — CSS fallback values', () => {
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
