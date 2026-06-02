import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => (window as any).__app?.reset());
});

test('handles a JS confirm dialog', async ({ page }) => {
  await page.goto('/playground/alerts');
  page.once('dialog', (d) => d.accept());
  await page.getByTestId('confirm-btn').click();
  await expect(page.getByTestId('alert-result')).toHaveText('confirm-accepted');
});

test('interacts with content inside an iframe', async ({ page }) => {
  await page.goto('/playground/iframes');
  const frame = page.frameLocator('[data-testid="practice-iframe"]');
  await frame.getByTestId('iframe-input').fill('hello');
  await frame.getByTestId('iframe-button').click();
  await expect(frame.getByTestId('iframe-output')).toContainText('Clicked at');
});

test('clicks a button inside shadow DOM', async ({ page }) => {
  await page.goto('/playground/shadow-dom');
  const root = page.getByTestId('shadow-host').locator(':scope');
  await root.locator('[data-testid="shadow-button"]').click();
  await expect(root.locator('[data-testid="shadow-output"]')).toContainText('Clicked at');
});

test('flaky page shows a result in stable mode', async ({ page }) => {
  await page.goto('/playground/flaky');
  await page.getByTestId('flaky-fetch').click();
  await expect(page.getByTestId('flaky-result')).toBeVisible({ timeout: 5000 });
});
