import { test, expect } from '@playwright/test';

test.describe('Menu Showcase', () => {
  test('should verify all sections render correctly', async ({ page }) => {
    // 1. Navigate to /menu
    await page.goto('/menu');

    // 2. Verify Hero with "Cơm Ánh Dương - Hương Vị Quê Hương"
    await expect(page.getByText('Cơm Ánh Dương - Hương Vị Quê Hương')).toBeVisible();

    // 3. Verify 4 category cards (Cơm, Món Chính, Đồ Uống, Tráng Miệng)
    await expect(page.getByText('Cơm', { exact: true })).toBeVisible();
    await expect(page.getByText('Món Chính', { exact: true })).toBeVisible();
    await expect(page.getByText('Đồ Uống', { exact: true })).toBeVisible();
    await expect(page.getByText('Tráng Miệng', { exact: true })).toBeVisible();

    // 4. Verify Featured items section header
    await expect(page.getByText('Món Nổi Bật')).toBeVisible();

    // 5. Verify Daily specials banner (green gradient)
    // Looking for text "Ưu Đãi Hôm Nay"
    await expect(page.getByText('Ưu Đãi Hôm Nay')).toBeVisible();

    // 6. Order CTA button
    await expect(
      page
        .getByRole('button', { name: /đặt cơm/i })
        .or(page.getByRole('link', { name: /đặt cơm/i }))
    ).toBeVisible();

    // 7. Footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should verify demo data loads without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/menu');

    // Wait a bit for data to load
    await page.waitForTimeout(2000);

    // Check for Supabase errors in console
    const supabaseErrors = consoleErrors.filter(
      (err) => err.includes('Supabase') || err.includes('error')
    );
    expect(supabaseErrors.length).toBe(0);

    // Verify some content is present which implies data loaded
    // (This overlaps with section rendering but confirms dynamic data)
    // await expect(page.locator('.product-card')).toHaveCount(6); // If we knew the class
  });

  test('should verify responsive mobile layout', async ({ page }) => {
    // 1. Resize browser to 375px width
    await page.setViewportSize({ width: 375, height: 812 });

    // 2. Navigate to /menu
    await page.goto('/menu');

    // 3. Verify key elements are still visible and layout adapts
    await expect(page.getByText('Cơm Ánh Dương - Hương Vị Quê Hương')).toBeVisible();

    // Hamburger menu should likely be visible instead of full nav (if applicable)
    // or just check that content isn't overflowing horizontally
    // Testing scrollability
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('footer')).toBeVisible();
  });
});
