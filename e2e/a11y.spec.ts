import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoSeriousAxeViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );

  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test.describe('Accessibility (axe)', () => {
  test('home page has no serious WCAG violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test('products page has no serious WCAG violations', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: /product catalogue/i })).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test('login page has no serious WCAG violations', async ({ page }) => {
    await page.goto('/account/login?mode=password');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test('quote page has no serious WCAG violations', async ({ page }) => {
    await page.goto('/quote');
    await expect(page.getByRole('main')).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test('skip link moves focus to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /skip to main content/i });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });
});
