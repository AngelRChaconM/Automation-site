import { test, expect } from '@playwright/test';

let sessionId: string;

test.beforeEach(async ({ request }, testInfo) => {
  sessionId = `api-test-${testInfo.workerIndex}-${testInfo.parallelIndex}`;
  await request.post('/api/dev/reset', { headers: { 'X-Session-Id': sessionId } });
});

const sessionHeaders = () => ({ 'X-Session-Id': sessionId });

test('login returns token and role', async ({ request }) => {
  const res = await request.post('/api/auth/login', {
    headers: sessionHeaders(),
    data: { email: 'user@example.com', password: 'password' },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.token).toBeTruthy();
  expect(body.role).toBe('user');
  expect(body.email).toBe('user@example.com');
});

test('login rejects invalid credentials', async ({ request }) => {
  const res = await request.post('/api/auth/login', {
    headers: sessionHeaders(),
    data: { email: 'user@example.com', password: '123' },
  });
  expect(res.status()).toBe(401);
});

test('cart works with guest session header', async ({ request }) => {
  const add = await request.post('/api/cart/items', {
    headers: sessionHeaders(),
    data: { productId: 1, qty: 2 },
  });
  expect(add.ok()).toBeTruthy();

  const cart = await request.get('/api/cart', {
    headers: sessionHeaders(),
  });
  const body = await cart.json();
  expect(body.items).toEqual([{ productId: 1, qty: 2 }]);
});

test('authenticated cart merges after login', async ({ request }) => {
  await request.post('/api/cart/items', {
    headers: sessionHeaders(),
    data: { productId: 1, qty: 1 },
  });

  const login = await request.post('/api/auth/login', {
    headers: sessionHeaders(),
    data: { email: 'shopper@example.com', password: 'password' },
  });
  const { token } = await login.json();

  const cart = await request.get('/api/cart', {
    headers: { ...sessionHeaders(), Authorization: `Bearer ${token}` },
  });
  const body = await cart.json();
  expect(body.items).toEqual([{ productId: 1, qty: 1 }]);
});

test('place order requires authentication', async ({ request }) => {
  await request.post('/api/cart/items', {
    headers: sessionHeaders(),
    data: { productId: 2, qty: 1 },
  });

  const order = await request.post('/api/orders', {
    headers: sessionHeaders(),
    data: {
      address: '123 Test St',
      cardName: 'Tester',
      cardNumber: '4111111111111111',
    },
  });
  expect(order.status()).toBe(401);
});

test('authenticated user can place order', async ({ request }) => {
  const login = await request.post('/api/auth/login', {
    headers: sessionHeaders(),
    data: { email: 'buyer@example.com', password: 'password' },
  });
  const { token } = await login.json();

  await request.post('/api/cart/items', {
    headers: { ...sessionHeaders(), Authorization: `Bearer ${token}` },
    data: { productId: 3, qty: 1 },
  });

  const order = await request.post('/api/orders', {
    headers: { ...sessionHeaders(), Authorization: `Bearer ${token}` },
    data: {
      address: '456 Main Ave',
      cardName: 'Buyer',
      cardNumber: '4111111111111111',
    },
  });
  expect(order.status()).toBe(201);
  const body = await order.json();
  expect(body.orderId).toMatch(/^ORD-/);

  const cart = await request.get('/api/cart', {
    headers: { ...sessionHeaders(), Authorization: `Bearer ${token}` },
  });
  expect((await cart.json()).items).toEqual([]);
});

test('lists products from API', async ({ request }) => {
  const res = await request.get('/api/products');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.products.length).toBeGreaterThan(0);
  expect(body.products[0]).toHaveProperty('id');
  expect(body.products[0]).toHaveProperty('name');
});

test('returns a single product by id', async ({ request }) => {
  const res = await request.get('/api/products/1');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.product.id).toBe(1);
  expect(body.product.name).toBe('Blue Top');
});

test('returns 404 for unknown product', async ({ request }) => {
  const res = await request.get('/api/products/999');
  expect(res.status()).toBe(404);
});

test('filters products by category and search', async ({ request }) => {
  const women = await request.get('/api/products?category=women');
  const body = await women.json();
  expect(body.products.length).toBeGreaterThan(0);
  expect(body.products.every((p: { category: string }) => p.category === 'women')).toBeTruthy();

  const search = await request.get('/api/products?search=blue');
  expect((await search.json()).products.some((p: { name: string }) => p.name.includes('Blue'))).toBeTruthy();
});

test('lists order history after checkout', async ({ request }) => {
  const login = await request.post('/api/auth/login', {
    headers: sessionHeaders(),
    data: { email: 'history@example.com', password: 'password' },
  });
  const { token } = await login.json();

  await request.post('/api/cart/items', {
    headers: { ...sessionHeaders(), Authorization: `Bearer ${token}` },
    data: { productId: 1, qty: 1 },
  });

  await request.post('/api/orders', {
    headers: { ...sessionHeaders(), Authorization: `Bearer ${token}` },
    data: {
      address: '789 Order Ln',
      cardName: 'History',
      cardNumber: '4111111111111111',
    },
  });

  const orders = await request.get('/api/orders', {
    headers: { ...sessionHeaders(), Authorization: `Bearer ${token}` },
  });
  expect(orders.ok()).toBeTruthy();
  const body = await orders.json();
  expect(body.orders.length).toBe(1);
  expect(body.orders[0].orderId).toMatch(/^ORD-/);
});

test('submits contact form via API', async ({ request }) => {
  const res = await request.post('/api/contact', {
    headers: sessionHeaders(),
    data: {
      name: 'Tester',
      email: 'test@example.com',
      subject: 'Hello',
      message: 'Need help with automation',
    },
  });
  expect(res.status()).toBe(201);
});

test('lists blog posts and adds a comment', async ({ request }) => {
  const list = await request.get('/api/posts');
  expect(list.ok()).toBeTruthy();
  expect((await list.json()).posts.length).toBeGreaterThan(0);

  const post = await request.get('/api/posts/3');
  expect((await post.json()).post.comments).toEqual([]);

  const comment = await request.post('/api/posts/3/comments', {
    headers: sessionHeaders(),
    data: { author: 'API User', text: 'Great read' },
  });
  expect(comment.status()).toBe(201);
  expect((await comment.json()).comments.at(-1).text).toBe('Great read');
});

test('reads and updates settings', async ({ request }) => {
  const get = await request.get('/api/settings', { headers: sessionHeaders() });
  expect(get.ok()).toBeTruthy();
  expect((await get.json()).settings.theme).toBe('light');

  const patch = await request.patch('/api/settings', {
    headers: sessionHeaders(),
    data: { theme: 'dark', dataMode: 'empty' },
  });
  expect(patch.ok()).toBeTruthy();
  const body = await patch.json();
  expect(body.settings.theme).toBe('dark');
  expect(body.settings.dataMode).toBe('empty');
});

test('manages table rows via API', async ({ request }) => {
  const initial = await request.get('/api/table-rows', { headers: sessionHeaders() });
  expect((await initial.json()).rows.length).toBe(8);

  await request.delete('/api/table-rows', { headers: sessionHeaders() });
  const cleared = await request.get('/api/table-rows', { headers: sessionHeaders() });
  expect((await cleared.json()).rows).toEqual([]);

  const bulk = await request.post('/api/table-rows/bulk', {
    headers: sessionHeaders(),
    data: {
      rows: [
        { id: 1, name: 'Test User', email: 'test@example.com', age: 30, country: 'USA', active: true, salary: 50000 },
      ],
    },
  });
  expect(bulk.status()).toBe(201);
  expect((await bulk.json()).rows.length).toBe(1);
});

test('uploads playground files via API', async ({ request }) => {
  const upload = await request.post('/api/files', {
    headers: sessionHeaders(),
    data: {
      name: 'notes.txt',
      size: 120,
      type: 'text/plain',
      lastModified: Date.now(),
      preview: 'hello world',
    },
  });
  expect(upload.status()).toBe(201);

  const list = await request.get('/api/files', { headers: sessionHeaders() });
  expect((await list.json()).files.some((f: { name: string }) => f.name === 'notes.txt')).toBeTruthy();
});
