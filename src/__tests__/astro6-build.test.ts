import { beforeAll, describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(__dirname, '../..');
const DIST_DIR = resolve(ROOT, 'dist');

const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('Astro 6 build', () => {
  let es = '';
  let en = '';

  beforeAll(() => {
    // Run the build - this validates Astro 6 compiles without errors
    execSync('pnpm build', { cwd: ROOT, stdio: 'pipe' });
    es = readFileSync(resolve(DIST_DIR, 'index.html'), 'utf-8');
    en = readFileSync(resolve(DIST_DIR, 'en', 'index.html'), 'utf-8');
  }, 120_000);

  it('should build successfully and produce locale routes', () => {
    expect(existsSync(resolve(DIST_DIR, 'index.html'))).toBe(true);
    expect(existsSync(resolve(DIST_DIR, 'en', 'index.html'))).toBe(true);
  });

  it('each locale declares its language and links the other', () => {
    expect(es).toMatch(/<html lang="es"/);
    expect(en).toMatch(/<html lang="en"/);
    for (const html of [es, en]) {
      expect(html).toMatch(/hreflang="es" href="https:\/\/mretamozo\.com\/"/);
      expect(html).toMatch(/hreflang="en" href="https:\/\/mretamozo\.com\/en\/"/);
    }
  });

  it('the single h1 carries the name and the role', () => {
    for (const html of [es, en]) {
      const headings = html.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
      expect(headings).toHaveLength(1);
      expect(text(headings[0] ?? '').trim()).toMatch(/^Michael\s+Retamozo$/);
      expect(headings[0]).toContain('aria-label="Michael Retamozo, Software Engineer"');
    }
  });

  it('every section the navigation points to exists', () => {
    for (const html of [es, en]) {
      const targets = new Set([...html.matchAll(/href="#([a-z-]+)"/g)].map((match) => match[1]));
      expect(targets.size).toBeGreaterThanOrEqual(6);
      for (const id of targets) {
        expect(html).toContain(`id="${id}"`);
      }
    }
  });

  it('says where he works now: Hiberus for Ibercaja, and Retama', () => {
    expect(text(es)).toMatch(/Hiberus/);
    expect(text(es)).toMatch(/cliente: Ibercaja/);
    expect(text(en)).toMatch(/client: Ibercaja/);
    for (const html of [es, en]) {
      expect(html).toContain('href="https://retama.dev"');
    }
  });

  it('presents Ospec-Workflow with every obligation in the HTML, readable without script', () => {
    for (const html of [es, en]) {
      expect(html).toContain('href="https://github.com/Snakeblack/ospec-workflow"');
      for (const id of ['checks-pass', 'repro-test', 'contract-spec-and-test', 'migration-compat-and-test', 'trust-review']) {
        expect(html).toContain(`data-obligation="${id}"`);
      }
      expect(html).not.toMatch(/class="owes__item"[^>]*hidden/);
    }
  });

  it('shows all nine projects at once', () => {
    for (const html of [es, en]) {
      expect(html.match(/class="tile"/g)).toHaveLength(9);
      expect(html).not.toContain('show_all');
    }
  });

  it('gives every image its size and a text alternative', () => {
    for (const html of [es, en]) {
      const images = html.match(/<img[^>]*>/g) ?? [];
      expect(images.length).toBeGreaterThanOrEqual(10);
      for (const image of images) {
        expect(image).toMatch(/\swidth="\d+"/);
        expect(image).toMatch(/\sheight="\d+"/);
        expect(image).toMatch(/\salt="[^"]+"/);
      }
    }
  });

  it('loads no font, script or style from a third party', () => {
    for (const html of [es, en]) {
      const external = [...html.matchAll(/<(?:link|script)[^>]+(?:href|src)="(https?:\/\/[^"]+)"/g)]
        .map((match) => match[1])
        .filter((url) => !url.startsWith('https://mretamozo.com/'));
      expect(external).toEqual([]);
    }
  });

  it('shares a 1200x630 PNG card with a text alternative in each language', () => {
    expect(existsSync(resolve(DIST_DIR, 'og-image.png'))).toBe(true);
    for (const html of [es, en]) {
      expect(html).toContain('<meta property="og:image" content="https://mretamozo.com/og-image.png"');
      expect(html).toContain('<meta property="og:image:type" content="image/png"');
      expect(html).toContain('<meta property="og:image:width" content="1200"');
      expect(html).toContain('<meta property="og:image:height" content="630"');
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
      expect(html).toContain('<meta name="twitter:image" content="https://mretamozo.com/og-image.png"');
    }
    expect(es).toContain('<meta property="og:image:alt" content="Michael Retamozo, Software Engineer en Madrid"');
    expect(en).toContain('<meta property="og:image:alt" content="Michael Retamozo, Software Engineer in Madrid"');
    expect(es).toContain('<meta property="og:locale:alternate" content="en_US"');
    expect(en).toContain('<meta property="og:locale:alternate" content="es_ES"');
  });

  it('keeps the meta description within 155 characters and offers an apple-touch-icon', () => {
    expect(existsSync(resolve(DIST_DIR, 'apple-touch-icon.png'))).toBe(true);
    for (const html of [es, en]) {
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
      expect(description.length).toBeGreaterThan(80);
      expect(description.length).toBeLessThanOrEqual(155);
      expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png"');
    }
  });

  it('uses the same hreflang codes in the sitemap as in the head', () => {
    const sitemap = readFileSync(resolve(DIST_DIR, 'sitemap-0.xml'), 'utf-8');
    expect(sitemap).toContain('hreflang="es" href="https://mretamozo.com/"');
    expect(sitemap).toContain('hreflang="en" href="https://mretamozo.com/en/"');
    expect(sitemap).not.toMatch(/hreflang="(es-ES|en-US)"/);
    expect(sitemap).not.toContain('404');
  });

  it('serves its own bilingual 404 that is not indexed and leads home', () => {
    const notFound = readFileSync(resolve(DIST_DIR, '404.html'), 'utf-8');
    expect(notFound).toContain('<meta name="robots" content="noindex, follow"');
    expect(notFound).not.toContain('rel="canonical"');
    expect(notFound).not.toContain('hreflang=');
    expect(notFound).toContain('href="/"');
    expect(notFound).toContain('href="/en/"');
    expect(notFound).toMatch(/<h1[^>]*>[\s\S]*404[\s\S]*<\/h1>/);
    expect(text(notFound)).not.toMatch(/[—–]/);
    for (const html of [es, en]) {
      expect(html).toContain('<meta name="robots" content="index, follow"');
    }
  });

  it('the text of the page has no emoji and no dashes used as punctuation', () => {
    for (const html of [es, en]) {
      const visible = text(html);
      expect(visible).not.toMatch(/\p{Emoji_Presentation}/u);
      expect(visible).not.toMatch(/[—–]/);
    }
  });
});
