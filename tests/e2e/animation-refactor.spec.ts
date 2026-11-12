import { expect, test, type Page } from '@playwright/test';

// El servidor de desarrollo recarga la página la primera vez que optimiza three.js: se espera a
// que la escena esté lista (o descartada, sin WebGL) antes de tocar nada.
const open = async (page: Page, path = '/') => {
  await page.goto(path);
  await page.waitForSelector('canvas[data-ready], canvas[data-scene="off"]', { state: 'attached' });
};

const shown = (selector: string) => {
  const node = document.querySelector(selector);
  return node ? Number.parseFloat(getComputedStyle(node).opacity) : -1;
};

test.describe('portfolio', () => {
  test('anchor navigation reveals the target section instead of leaving only the background', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await open(page);

    await page.locator('.nav a[href="#work"]').click();
    await page.waitForFunction(() => {
      const heading = document.querySelector('#work h2');
      const facts = document.querySelector('#work .experience-item .job__facts');
      if (!heading || !facts) return false;
      return Number.parseFloat(getComputedStyle(heading).opacity) > 0.95 && Number.parseFloat(getComputedStyle(facts).opacity) > 0.95;
    });

    expect(await page.evaluate(shown, '#work h2')).toBeGreaterThan(0.95);
    expect(await page.evaluate(shown, '#work .experience-item .job__facts')).toBeGreaterThan(0.95);
    await expect(page.locator('#work h2')).toBeInViewport();
  });

  test('manual scroll still reveals sections correctly', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await open(page);

    await page.evaluate(() => {
      const top = (document.querySelector('#work') as HTMLElement).getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'instant' });
    });

    await page.waitForFunction(() => {
      const heading = document.querySelector('#work h2');
      const facts = document.querySelector('#work .experience-item .job__facts');
      if (!heading || !facts) return false;
      return Number.parseFloat(getComputedStyle(heading).opacity) > 0.95 && Number.parseFloat(getComputedStyle(facts).opacity) > 0.95;
    });

    expect(await page.evaluate(shown, '#work h2')).toBeGreaterThan(0.95);
  });

  test('choosing what a change touches shows the obligations ospec derives', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page);

    const visible = () => page.locator('.owes__item:not([hidden]) code').allTextContents();

    // Un bug viene marcado de entrada.
    expect(await visible()).toEqual(['checks-pass', 'repro-test']);

    const migration = page.locator('.touch[data-touch="migration"]');
    await migration.click();
    await expect(migration).toHaveAttribute('aria-pressed', 'true');
    expect(await visible()).toEqual(['checks-pass', 'repro-test', 'migration-compat-and-test']);

    await page.locator('.touch[data-touch="bug"]').click();
    expect(await visible()).toEqual(['checks-pass', 'migration-compat-and-test']);
  });

  test('all projects are on the page and the old show_all parameter changes nothing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, '/?show_all=true');
    await expect(page.locator('#projects .tile')).toHaveCount(9);
    await expect(page.locator('#show-all-projects-btn')).toHaveCount(0);
  });

  test('with reduced motion nothing is hidden and the scene holds one pose', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await open(page);
    expect(await page.evaluate(shown, '#about .about__text')).toBe(1);
    expect(await page.evaluate(shown, '#contact .contact__title')).toBe(1);
    await context.close();
  });

  test('the phone menu opens, closes with Escape and follows a link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);

    const toggle = page.locator('#mobile-menu-toggle');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nav-links a[href="#projects"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await page.locator('#nav-links a[href="#projects"]').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#projects h2')).toBeInViewport();
  });
});
