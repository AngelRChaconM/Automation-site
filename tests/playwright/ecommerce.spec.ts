import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => (window as any).__app?.reset());
});

test('navigates from home to products via hamburger menu', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('nav-hamburger').click();
  await page.getByTestId('nav-products').click();
  await expect(page.getByTestId('page-products')).toBeVisible();
  await expect(page.getByTestId('products-grid')).toBeVisible();
});

test('adds a product to the cart and reaches checkout success', async ({ page }) => {
  await page.goto('/ecommerce/products');
  await page.getByTestId('product-add-1').click();
  await page.getByTestId('header-cart').click();
  await expect(page.getByTestId('cart-row-1')).toBeVisible();
  await expect(page.getByTestId('cart-qty-1')).toHaveText('1');
  await page.getByTestId('cart-checkout-btn').click();
  await expect(page.getByTestId('checkout-login-msg')).toBeVisible();
  await page.getByTestId('checkout-go-login').click();
  await page.getByTestId('login-email').fill('user@example.com');
  await page.getByTestId('login-password').fill('password');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('page-checkout')).toBeVisible();
  await page.getByTestId('checkout-address').fill('123 Test Street');
  await page.getByTestId('checkout-card-name').fill('Tester');
  await page.getByTestId('checkout-card-number').fill('4111111111111111');
  await page.getByTestId('checkout-place-order').click();
  await expect(page.getByTestId('order-success-title')).toBeVisible();
});

test('login form rejects short password', async ({ page }) => {
  await page.goto('/ecommerce/login');
  await page.getByTestId('login-email').fill('user@example.com');
  await page.getByTestId('login-password').fill('123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-error')).toBeVisible();
});

test('empty data mode shows no products', async ({ page }) => {
  await page.goto('/ecommerce/products');
  await page.evaluate(() => (window as any).__app.setDataMode('empty'));
  await expect(page.getByTestId('products-empty')).toBeVisible();
});

test('default currency is USD and switches to EUR/MXN', async ({ page }) => {
  await page.goto('/ecommerce/products');
  await expect(page.locator('body')).toHaveAttribute('data-currency', 'USD');
  await expect(page.getByTestId('product-price-1')).toContainText('$');

  await page.evaluate(() => (window as any).__app.setCurrency('EUR'));
  await expect(page.locator('body')).toHaveAttribute('data-currency', 'EUR');
  await expect(page.getByTestId('product-price-1')).toContainText('€');

  await page.evaluate(() => (window as any).__app.setCurrency('MXN'));
  await expect(page.getByTestId('product-price-1')).toContainText('$');
});
