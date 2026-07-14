import { test, expect } from '@playwright/test';

test.describe('Marketing pages', () => {
  test('home page renders the company name', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Joseph Bezzina & Co\. Ltd home/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('about page is reachable from navigation', async ({ page }) => {
    await page.goto('/about');

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/about/i);
  });

  test('login page renders accessible form fields', async ({ page }) => {
    await page.goto('/account/login?mode=password');

    const main = page.getByRole('main');
    await expect(main.locator('#login-email')).toBeVisible();
    await expect(main.locator('#login-password')).toBeVisible();
    await expect(main.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
