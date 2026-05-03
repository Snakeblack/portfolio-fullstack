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
