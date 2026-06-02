import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => (window as any).__app?.reset());
});

test('lists posts and opens detail', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByTestId('post-card-1')).toBeVisible();
  await page.getByTestId('post-link-1').click();
  await expect(page.getByTestId('blog-post-title')).toBeVisible();
});

test('adds a comment to a post', async ({ page }) => {
  await page.goto('/blog/3');
  await page.getByTestId('comment-author').fill('Tester');
  await page.getByTestId('comment-text').fill('Nice post!');
  await page.getByTestId('comment-submit').click();
  await expect(page.getByTestId('comment-0')).toContainText('Nice post!');
});
