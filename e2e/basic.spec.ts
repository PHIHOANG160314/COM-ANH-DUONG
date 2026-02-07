import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Cơm Ánh Dương/);
});

test('navigates to login', async ({ page }) => {
  await page.goto('/');

  // Click the login link.
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // Expects page to have a heading with the name of Login.
  await expect(page.getByRole('button', { name: /Đăng nhập/i })).toBeVisible();
});
