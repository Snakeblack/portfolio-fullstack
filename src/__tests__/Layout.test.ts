import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const content = readFileSync(resolve(__dirname, '../layouts/Layout.astro'), 'utf-8');

describe('Layout (REQ-SCROLL-003, REQ-SCROLL-004)', () => {
  it('should configure history.scrollRestoration in head script', () => {
    expect(content).toMatch(/scrollRestoration/);
    expect(content).toMatch(/<head>[\s\S]*<script is:inline>[\s\S]*scrollRestoration[\s\S]*<\/script>/);
  });

  it('loads no animation library: the head carries no script beyond the inline ones', () => {
    expect(content).not.toMatch(/gsap|ScrollTrigger/i);
    expect(content).not.toMatch(/<script>/);
  });

  it('preloads the three font files through the build, so their names carry a hash', () => {
    const imports = content.match(/from "\.\.\/assets\/fonts\/[a-z0-9-]+\.woff2\?url"/g) ?? [];
    expect(imports).toHaveLength(3);
    expect(content).toMatch(/rel="preload" href=\{font\} as="font" type="font\/woff2" crossorigin/);
    expect(content).not.toMatch(/href="\/fonts\//);
  });
});
