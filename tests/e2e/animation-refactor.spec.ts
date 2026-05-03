import { expect, test } from '@playwright/test';

test.describe('animation-refactor-webgl-optimize', () => {
  test('anchor navigation reveals the target section instead of leaving only the background', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await page.goto('/');

    await page.locator('a[href="#work"]').click();
    await page.waitForFunction(() => {
      const heading = document.querySelector('#work h2');
      const item = document.querySelector('#work .experience-item');

      if (!heading || !item) {
        return false;
      }

      return (
        Number.parseFloat(getComputedStyle(heading).opacity) > 0.95 &&
        Number.parseFloat(getComputedStyle(item).opacity) > 0.95
      );
    });

    const result = await page.evaluate(() => {
      const section = document.querySelector('#work');
      const heading = document.querySelector('#work h2');
      const item = document.querySelector('#work .experience-item');

      return {
        sectionOpacity: section ? Number.parseFloat(getComputedStyle(section).opacity) : -1,
        headingOpacity: heading ? Number.parseFloat(getComputedStyle(heading).opacity) : -1,
        itemOpacity: item ? Number.parseFloat(getComputedStyle(item).opacity) : -1,
      };
    });

    expect(result.headingOpacity).toBeGreaterThan(0.95);
    expect(result.itemOpacity).toBeGreaterThan(0.95);
    expect(result.sectionOpacity).toBeGreaterThanOrEqual(0);
  });

  test('manual scroll still reveals sections correctly', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await page.goto('/');

    await page.evaluate(() => {
      const body = document.body;
      const documentElement = document.documentElement;
      const scrollingElement = document.scrollingElement;
      const scrollContainer = scrollingElement && scrollingElement.scrollHeight > scrollingElement.clientHeight + 1
        ? scrollingElement
        : body.scrollHeight > body.clientHeight + 1
          ? body
          : documentElement;

      scrollContainer.scrollTo({
        top: 1600,
        behavior: 'instant',
      });

      window.dispatchEvent(new Event('scroll'));
    });

    await page.waitForTimeout(900);

    await page.waitForFunction(() => {
      const heading = document.querySelector('#work h2');
      const item = document.querySelector('#work .experience-item');

      if (!heading || !item) {
        return false;
      }

      return (
        Number.parseFloat(getComputedStyle(heading).opacity) > 0.95 &&
        Number.parseFloat(getComputedStyle(item).opacity) > 0.95
      );
    });

    const result = await page.evaluate(() => {
      const heading = document.querySelector('#work h2');
      const item = document.querySelector('#work .experience-item');

      return {
        headingOpacity: heading ? Number.parseFloat(getComputedStyle(heading).opacity) : -1,
        itemOpacity: item ? Number.parseFloat(getComputedStyle(item).opacity) : -1,
      };
    });

    expect(result.headingOpacity).toBeGreaterThan(0.95);
    expect(result.itemOpacity).toBeGreaterThan(0.95);
  });

  test('projects toggle updates visibility and aria state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const button = page.locator('#show-all-projects-btn');
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    await button.click();
    await page.waitForTimeout(1300);

    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/show_all=true/);
  });
});
