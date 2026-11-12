import { beforeAll, describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
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
    expect(notFound).toContain('href="/#projects"');
    expect(notFound).toContain('href="/en/#projects"');
    expect(notFound).toMatch(/<h1[^>]*>[\s\S]*404[\s\S]*<\/h1>/);
    expect(text(notFound)).not.toMatch(/[—–]/);
    for (const html of [es, en]) {
      expect(html).toContain('<meta name="robots" content="index, follow"');
    }
  });

  describe('project pages', () => {
    const slugs = ['ospec-workflow', 'noema', 'retama', 'finanzas-snake', 'opencode-pr-status', 'stream-overlay-chat', 'background-generator', 'landings', 'blog'];
    const page = (locale: 'es' | 'en', slug: string) =>
      readFileSync(resolve(DIST_DIR, locale === 'es' ? `proyectos/${slug}` : `en/projects/${slug}`, 'index.html'), 'utf-8');

    it('every tile opens the project page in the same tab', () => {
      for (const [html, prefix] of [[es, '/proyectos/'], [en, '/en/projects/']] as const) {
        const tiles = html.match(/<a[^>]*class="tile"[^>]*>/g) ?? [];
        expect(tiles.map((tile) => tile.match(/href="([^"]+)"/)?.[1])).toEqual(slugs.map((slug) => `${prefix}${slug}/`));
        for (const tile of tiles) expect(tile).not.toContain('target=');
      }
    });

    it('each page exists in both languages, links its translation and has one h1', () => {
      for (const slug of slugs) {
        const [pageEs, pageEn] = [page('es', slug), page('en', slug)];
        expect(pageEs).toMatch(/<html lang="es"/);
        expect(pageEn).toMatch(/<html lang="en"/);
        for (const html of [pageEs, pageEn]) {
          expect(html.match(/<h1[\s\S]*?<\/h1>/g)).toHaveLength(1);
          expect(html).toContain(`hreflang="es" href="https://mretamozo.com/proyectos/${slug}/"`);
          expect(html).toContain(`hreflang="en" href="https://mretamozo.com/en/projects/${slug}/"`);
          expect(html).toContain('<meta name="robots" content="index, follow"');
          expect(html).toContain('href="/#projects"'.replace('/#', html === pageEn ? '/en/#' : '/#'));
        }
        expect(pageEs).toContain(`<link rel="canonical" href="https://mretamozo.com/proyectos/${slug}/"`);
        expect(pageEn).toContain(`<link rel="canonical" href="https://mretamozo.com/en/projects/${slug}/"`);
      }
    });

    it('the complex projects explain how they work and Retama tells the whole loop', () => {
      for (const slug of ['noema', 'retama', 'finanzas-snake', 'opencode-pr-status', 'stream-overlay-chat']) {
        expect(text(page('es', slug))).toMatch(/Cómo funciona/);
        expect(text(page('en', slug))).toMatch(/How it works/);
      }
      const retama = text(page('es', 'retama'));
      for (const heading of ['El área de clientes', 'El avance sale del repositorio', 'El playbook de Retama', 'Gestión desde Claude']) {
        expect(retama).toContain(heading);
      }
      expect(page('es', 'retama')).toContain('<h1');
      expect(text(page('es', 'retama'))).toContain('Área de clientes de Retama');
      expect(text(page('en', 'retama'))).toContain('Retama client area');
    });

    it('the landings page shows each client site with a link out', () => {
      for (const locale of ['es', 'en'] as const) {
        const html = page(locale, 'landings');
        expect(html).toContain('href="https://www.bateriascoches24horas.es/"');
        expect(html).toContain('href="https://recambioslasmargaritas.es/"');
        expect(html.match(/<img[^>]*>/g)?.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('pages describe themselves for search engines and keep the copy clean', () => {
      for (const slug of slugs) {
        for (const html of [page('es', slug), page('en', slug)]) {
          const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
          expect(description.length).toBeGreaterThan(30);
          expect(description.length).toBeLessThanOrEqual(155);
          const visible = text(html);
          expect(visible).not.toMatch(/\p{Emoji_Presentation}/u);
          expect(visible).not.toMatch(/[—–]/);
          for (const image of html.match(/<img[^>]*>/g) ?? []) {
            expect(image).toMatch(/\swidth="\d+"/);
            expect(image).toMatch(/\salt="[^"]+"/);
          }
        }
      }
    });

    it('the sitemap lists every project page and never invents a translated path', () => {
      const sitemap = readFileSync(resolve(DIST_DIR, 'sitemap-0.xml'), 'utf-8');
      for (const slug of slugs) {
        expect(sitemap).toContain(`<loc>https://mretamozo.com/proyectos/${slug}/</loc>`);
        expect(sitemap).toContain(`<loc>https://mretamozo.com/en/projects/${slug}/</loc>`);
      }
      const entry = sitemap.match(/<url><loc>https:\/\/mretamozo\.com\/proyectos\/noema\/<\/loc>[\s\S]*?<\/url>/)?.[0] ?? '';
      expect(entry).toContain('hreflang="es" href="https://mretamozo.com/proyectos/noema/"');
      expect(entry).toContain('hreflang="en" href="https://mretamozo.com/en/projects/noema/"');
      expect(sitemap).not.toContain('/en/proyectos/');
      expect(sitemap).not.toMatch(/mretamozo\.com\/projects\//);
    });
  });

  describe('rendimiento', () => {
    const assets = () => readdirSync(resolve(DIST_DIR, '_astro'));

    it('no envía ninguna librería de animación y Three.js solo se carga aparte', () => {
      const scripts = assets().filter((file) => file.endsWith('.js'));
      const eager = [...es.matchAll(/<script[^>]+src="\/_astro\/([^"]+)"/g)].map((match) => match[1]);
      for (const file of scripts) {
        const source = readFileSync(resolve(DIST_DIR, '_astro', file), 'utf-8');
        expect(source).not.toMatch(/ScrollTrigger|gsap/i);
        if (eager.includes(file)) expect(source.length).toBeLessThan(8_000);
      }
      expect(scripts.some((file) => file.startsWith('snake.'))).toBe(true);
      expect(eager.some((file) => file.startsWith('snake.'))).toBe(false);
    });
  });

  it('the text of the page has no emoji and no dashes used as punctuation', () => {
    for (const html of [es, en]) {
      const visible = text(html);
      expect(visible).not.toMatch(/\p{Emoji_Presentation}/u);
      expect(visible).not.toMatch(/[—–]/);
    }
  });
});
