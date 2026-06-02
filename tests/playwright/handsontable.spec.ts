import path from 'node:path';
import { test, expect } from '@playwright/test';

const SAMPLE_CSV = path.resolve('tests/fixtures/rows-sample.csv');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => (window as any).__app?.reset());
});

test('renders the grid and filters rows', async ({ page }) => {
  await page.goto('/handsontable');
  await expect(page.getByTestId('hot-container')).toBeVisible();
  await expect(page.getByTestId('hot-row-count')).toContainText('8 rows');
  await page.getByTestId('hot-filter').fill('alice');
  await expect(page.getByTestId('hot-row-count')).toContainText('1 rows');
});

test('clears the table', async ({ page }) => {
  await page.goto('/handsontable');
  await page.getByTestId('hot-clear-btn').click();
  await expect(page.getByTestId('hot-row-count')).toContainText('0 rows');
});

test('uploads a CSV and appends rows', async ({ page }) => {
  await page.goto('/handsontable');
  await expect(page.getByTestId('hot-row-count')).toContainText('8 rows');
  await page.getByTestId('hot-file-input').setInputFiles(SAMPLE_CSV);
  await expect(page.getByTestId('hot-upload-success')).toBeVisible();
  await expect(page.getByTestId('hot-row-count')).toContainText('10 rows');
});

test('clears then uploads to start fresh', async ({ page }) => {
  await page.goto('/handsontable');
  await page.getByTestId('hot-clear-btn').click();
  await page.getByTestId('hot-file-input').setInputFiles(SAMPLE_CSV);
  await expect(page.getByTestId('hot-row-count')).toContainText('2 rows');
});
