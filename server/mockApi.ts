import type { Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { PRODUCTS, type Product } from '../src/data/products';
import { POSTS, type Comment, type Post } from '../src/data/posts';
import { TABLE_ROWS, type TableRow } from '../src/data/tableRows';

export type CartItem = { productId: number; qty: number };
type Role = 'user' | 'admin';

type TokenRecord = { email: string; role: Role; sessionId: string };
type UserRecord = { email: string; role: Role; name?: string; password: string };

type OrderRecord = {
  orderId: string;
  email: string;
  items: CartItem[];
  address: string;
  cardName: string;
  createdAt: string;
};

type ContactRecord = {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

type SettingsRecord = {
  theme: 'light' | 'dark';
  lang: 'en' | 'es';
  currency: 'USD' | 'EUR' | 'MXN';
  difficulty: 'stable' | 'flaky';
  dataMode: 'empty' | 'populated';
};

type FileRecord = {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  preview: string | null;
};

const DEFAULT_SETTINGS: SettingsRecord = {
  theme: 'light',
  lang: 'en',
  currency: 'USD',
  difficulty: 'stable',
  dataMode: 'populated',
};

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_FILE_EXT = ['.txt', '.json', '.pdf'];

type TenantStore = {
  carts: Map<string, CartItem[]>;
  tokens: Map<string, TokenRecord>;
  users: Map<string, UserRecord>;
  orders: OrderRecord[];
  contactMessages: ContactRecord[];
  settings: SettingsRecord;
  tableRows: TableRow[] | null;
  files: FileRecord[];
};

const tenants = new Map<string, TenantStore>();
const tokenIndex = new Map<string, string>();

const initBlogComments = (): Map<number, Comment[]> => {
  const map = new Map<number, Comment[]>();
  for (const post of POSTS) {
    map.set(post.id, post.comments.map((c) => ({ ...c })));
  }
  return map;
};

let blogComments = initBlogComments();

const getTenant = (tenantId: string): TenantStore => {
  let store = tenants.get(tenantId);
  if (!store) {
    store = {
      carts: new Map(),
      tokens: new Map(),
      users: new Map(),
      orders: [],
      contactMessages: [],
      settings: { ...DEFAULT_SETTINGS },
      tableRows: null,
      files: [],
    };
    tenants.set(tenantId, store);
  }
  return store;
};

const getTableRows = (store: TenantStore): TableRow[] => {
  if (store.tableRows === null) {
    store.tableRows = TABLE_ROWS.map((r) => ({ ...r }));
  }
  return store.tableRows;
};

const filterTableRows = (rows: TableRow[], search?: string) => {
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q)
  );
};

const patchSettings = (store: TenantStore, body: Partial<SettingsRecord>): SettingsRecord => {
  const next = { ...store.settings };
  if (body.theme === 'light' || body.theme === 'dark') next.theme = body.theme;
  if (body.lang === 'en' || body.lang === 'es') next.lang = body.lang;
  if (body.currency === 'USD' || body.currency === 'EUR' || body.currency === 'MXN') next.currency = body.currency;
  if (body.difficulty === 'stable' || body.difficulty === 'flaky') next.difficulty = body.difficulty;
  if (body.dataMode === 'empty' || body.dataMode === 'populated') next.dataMode = body.dataMode;
  store.settings = next;
  return next;
};

const fileExtension = (name: string) => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
};

const cartKey = (sessionId: string, email?: string) => (email ? `user:${email}` : `guest:${sessionId}`);

const getCart = (store: TenantStore, key: string): CartItem[] => store.carts.get(key) ?? [];

const setCart = (store: TenantStore, key: string, items: CartItem[]) => {
  store.carts.set(key, items);
  return items;
};

const mergeCarts = (store: TenantStore, fromKey: string, toKey: string): CartItem[] => {
  const from = getCart(store, fromKey);
  const to = getCart(store, toKey);
  const merged = [...to];
  for (const item of from) {
    const existing = merged.find((i) => i.productId === item.productId);
    if (existing) existing.qty += item.qty;
    else merged.push({ ...item });
  }
  store.carts.delete(fromKey);
  return setCart(store, toKey, merged);
};

const addItem = (store: TenantStore, key: string, productId: number, qty: number): CartItem[] => {
  if (!PRODUCTS.some((p) => p.id === productId)) {
    throw new Error('Product not found');
  }
  const items = getCart(store, key);
  const existing = items.find((i) => i.productId === productId);
  if (existing) existing.qty += qty;
  else items.push({ productId, qty });
  return setCart(store, key, items);
};

const removeItem = (store: TenantStore, key: string, productId: number): CartItem[] =>
  setCart(
    store,
    key,
    getCart(store, key).filter((i) => i.productId !== productId)
  );

const clearCartKey = (store: TenantStore, key: string): CartItem[] => setCart(store, key, []);

const filterProducts = (products: Product[], search?: string, category?: string, brand?: string) =>
  products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    if (brand && p.brand !== brand) return false;
    return true;
  });

const postSummary = (post: Post) => ({
  id: post.id,
  title: post.title,
  author: post.author,
  date: post.date,
  excerpt: post.excerpt,
  image: post.image,
  commentCount: blogComments.get(post.id)?.length ?? 0,
});

const postWithComments = (post: Post) => ({
  ...post,
  comments: blogComments.get(post.id) ?? [],
});

const validateLogin = (store: TenantStore, email: string, password: string) => {
  if (!email.includes('@') || password.length < 4) {
    return { ok: false as const, error: 'Invalid email or password (min 4 chars)' };
  }
  const stored = store.users.get(email);
  if (stored && stored.password !== password) {
    return { ok: false as const, error: 'Invalid email or password (min 4 chars)' };
  }
  const role: Role = email.includes('admin') ? 'admin' : 'user';
  return { ok: true as const, role, email };
};

const readBody = (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });

const sendJson = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const registerToken = (tenantId: string, token: string, record: TokenRecord) => {
  const store = getTenant(tenantId);
  store.tokens.set(token, record);
  tokenIndex.set(token, tenantId);
};

const removeToken = (token: string) => {
  const tenantId = tokenIndex.get(token);
  if (tenantId) {
    getTenant(tenantId).tokens.delete(token);
    tokenIndex.delete(token);
  }
};

const parseAuth = (req: IncomingMessage, tenantId: string | null) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const resolvedTenant = tokenIndex.get(token);
    if (resolvedTenant) {
      const store = getTenant(resolvedTenant);
      const record = store.tokens.get(token);
      if (record) {
        return {
          token,
          tenantId: resolvedTenant,
          store,
          email: record.email,
          role: record.role,
          sessionId: record.sessionId,
          key: cartKey(record.sessionId, record.email),
        };
      }
    }
  }
  if (tenantId) {
    return {
      token: null,
      tenantId,
      store: getTenant(tenantId),
      email: undefined,
      role: undefined,
      sessionId: tenantId,
      key: cartKey(tenantId),
    };
  }
  return null;
};

export const resetMockApiState = (tenantId?: string) => {
  blogComments = initBlogComments();
  if (tenantId) {
    const store = tenants.get(tenantId);
    if (store) {
      for (const token of store.tokens.keys()) {
        tokenIndex.delete(token);
      }
    }
    tenants.delete(tenantId);
    return;
  }
  tenants.clear();
  tokenIndex.clear();
};

export const createMockApiMiddleware = (): Connect.NextHandleFunction => {
  return async (req, res, next) => {
    const url = req.url ?? '';
    if (!url.startsWith('/api/')) return next();

    const method = req.method ?? 'GET';
    const { pathname: path, searchParams } = new URL(url, 'http://localhost');
    const tenantId = (req.headers['x-session-id'] as string | undefined) ?? null;

    try {
      if (method === 'POST' && path === '/api/dev/reset') {
        resetMockApiState(tenantId ?? undefined);
        return sendJson(res, 200, { ok: true });
      }

      if (method === 'GET' && path === '/api/products') {
        const products = filterProducts(
          PRODUCTS,
          searchParams.get('search') ?? undefined,
          searchParams.get('category') ?? undefined,
          searchParams.get('brand') ?? undefined
        );
        return sendJson(res, 200, { products });
      }

      const productMatch = path.match(/^\/api\/products\/(\d+)$/);
      if (method === 'GET' && productMatch) {
        const product = PRODUCTS.find((p) => p.id === Number(productMatch[1]));
        if (!product) return sendJson(res, 404, { error: 'Product not found' });
        return sendJson(res, 200, { product });
      }

      if (method === 'GET' && path === '/api/posts') {
        const posts = POSTS.map(postSummary);
        return sendJson(res, 200, { posts });
      }

      const postMatch = path.match(/^\/api\/posts\/(\d+)$/);
      if (method === 'GET' && postMatch) {
        const post = POSTS.find((p) => p.id === Number(postMatch[1]));
        if (!post) return sendJson(res, 404, { error: 'Post not found' });
        return sendJson(res, 200, { post: postWithComments(post) });
      }

      const commentMatch = path.match(/^\/api\/posts\/(\d+)\/comments$/);
      if (method === 'POST' && commentMatch) {
        const postId = Number(commentMatch[1]);
        const post = POSTS.find((p) => p.id === postId);
        if (!post) return sendJson(res, 404, { error: 'Post not found' });

        const body = (await readBody(req)) as { author?: string; text?: string };
        const author = body.author?.trim() ?? '';
        const text = body.text?.trim() ?? '';
        if (!author || !text) {
          return sendJson(res, 400, { error: 'Author and comment text required' });
        }

        const comment: Comment = { author, text, date: new Date().toISOString().slice(0, 10) };
        const comments = [...(blogComments.get(postId) ?? []), comment];
        blogComments.set(postId, comments);
        return sendJson(res, 201, { comments });
      }

      if (method === 'POST' && path === '/api/contact') {
        if (!tenantId) return sendJson(res, 400, { error: 'Missing X-Session-Id header' });

        const body = (await readBody(req)) as {
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
        };
        const name = body.name?.trim() ?? '';
        const email = body.email?.trim() ?? '';
        const subject = body.subject?.trim() ?? '';
        const message = body.message?.trim() ?? '';
        if (!name || !email.includes('@') || !subject || !message) {
          return sendJson(res, 400, { error: 'All contact fields are required' });
        }

        const store = getTenant(tenantId);
        store.contactMessages.push({
          name,
          email,
          subject,
          message,
          createdAt: new Date().toISOString(),
        });
        return sendJson(res, 201, { ok: true });
      }

      if (!tenantId) {
        return sendJson(res, 400, { error: 'Missing X-Session-Id header' });
      }

      const store = getTenant(tenantId);

      if (method === 'GET' && path === '/api/settings') {
        return sendJson(res, 200, { settings: store.settings });
      }

      if (method === 'PATCH' && path === '/api/settings') {
        const body = (await readBody(req)) as Partial<SettingsRecord>;
        const settings = patchSettings(store, body);
        return sendJson(res, 200, { settings });
      }

      if (method === 'GET' && path === '/api/table-rows') {
        const rows = filterTableRows(getTableRows(store), searchParams.get('search') ?? undefined);
        return sendJson(res, 200, { rows });
      }

      if (method === 'PUT' && path === '/api/table-rows') {
        const body = (await readBody(req)) as { rows?: TableRow[] };
        store.tableRows = Array.isArray(body.rows) ? body.rows.map((r) => ({ ...r })) : [];
        return sendJson(res, 200, { rows: store.tableRows });
      }

      if (method === 'DELETE' && path === '/api/table-rows') {
        store.tableRows = [];
        return sendJson(res, 200, { rows: [] });
      }

      if (method === 'POST' && path === '/api/table-rows/bulk') {
        const body = (await readBody(req)) as { rows?: TableRow[] };
        const incoming = Array.isArray(body.rows) ? body.rows : [];
        if (incoming.length === 0) return sendJson(res, 400, { error: 'No rows to append' });
        const current = getTableRows(store);
        store.tableRows = [...current, ...incoming.map((r) => ({ ...r }))];
        return sendJson(res, 201, { rows: store.tableRows });
      }

      if (method === 'GET' && path === '/api/files') {
        return sendJson(res, 200, { files: store.files });
      }

      if (method === 'POST' && path === '/api/files') {
        const body = (await readBody(req)) as {
          name?: string;
          size?: number;
          type?: string;
          lastModified?: number;
          preview?: string | null;
        };
        const name = body.name?.trim() ?? '';
        const size = Number(body.size ?? 0);
        const ext = fileExtension(name);
        if (!name) return sendJson(res, 400, { error: 'File name required' });
        if (size <= 0) return sendJson(res, 400, { error: 'File is empty' });
        if (size > MAX_FILE_BYTES) return sendJson(res, 400, { error: 'File exceeds 2 MB limit' });
        if (!ALLOWED_FILE_EXT.includes(ext)) return sendJson(res, 400, { error: 'File type not allowed' });

        const file: FileRecord = {
          id: randomUUID(),
          name,
          size,
          type: body.type ?? 'application/octet-stream',
          lastModified: Number(body.lastModified ?? Date.now()),
          preview: body.preview ?? null,
        };
        store.files.push(file);
        return sendJson(res, 201, { file });
      }

      if (method === 'POST' && path === '/api/auth/login') {
        const body = (await readBody(req)) as { email?: string; password?: string };
        const email = body.email ?? '';
        const password = body.password ?? '';
        const result = validateLogin(store, email, password);
        if (!result.ok) return sendJson(res, 401, { error: result.error });

        if (!store.users.has(email)) {
          store.users.set(email, { email, role: result.role, password });
        }

        const token = randomUUID();
        registerToken(tenantId, token, { email: result.email, role: result.role, sessionId: tenantId });
        mergeCarts(store, cartKey(tenantId), cartKey(tenantId, result.email));

        const items = getCart(store, cartKey(tenantId, result.email));
        return sendJson(res, 200, { token, email: result.email, role: result.role, items });
      }

      if (method === 'POST' && path === '/api/auth/signup') {
        const body = (await readBody(req)) as { name?: string; email?: string; password?: string };
        const name = body.name ?? '';
        const email = body.email ?? '';
        const password = body.password ?? 'password';
        if (!name || !email.includes('@') || password.length < 4) {
          return sendJson(res, 400, { error: 'Name, valid email and password (min 4 chars) required' });
        }

        const role: Role = email.includes('admin') ? 'admin' : 'user';
        store.users.set(email, { email, role, name, password });

        const token = randomUUID();
        registerToken(tenantId, token, { email, role, sessionId: tenantId });
        mergeCarts(store, cartKey(tenantId), cartKey(tenantId, email));

        const items = getCart(store, cartKey(tenantId, email));
        return sendJson(res, 200, { token, email, role, items });
      }

      if (method === 'POST' && path === '/api/auth/logout') {
        const auth = req.headers.authorization;
        if (auth?.startsWith('Bearer ')) {
          removeToken(auth.slice(7));
        }
        return sendJson(res, 200, { ok: true });
      }

      if (method === 'GET' && path === '/api/auth/me') {
        const auth = parseAuth(req, tenantId);
        if (!auth?.token) return sendJson(res, 401, { error: 'Unauthorized' });
        return sendJson(res, 200, { email: auth.email, role: auth.role });
      }

      const auth = parseAuth(req, tenantId);
      if (!auth) return sendJson(res, 401, { error: 'Missing session or token' });

      if (method === 'GET' && path === '/api/cart') {
        return sendJson(res, 200, { items: getCart(auth.store, auth.key) });
      }

      if (method === 'POST' && path === '/api/cart/items') {
        const body = (await readBody(req)) as { productId?: number; qty?: number };
        const productId = Number(body.productId);
        const qty = Number(body.qty ?? 1);
        if (!productId || qty < 1) return sendJson(res, 400, { error: 'Invalid productId or qty' });
        try {
          const items = addItem(auth.store, auth.key, productId, qty);
          return sendJson(res, 200, { items });
        } catch {
          return sendJson(res, 404, { error: 'Product not found' });
        }
      }

      const removeMatch = path.match(/^\/api\/cart\/items\/(\d+)$/);
      if (method === 'DELETE' && removeMatch) {
        const items = removeItem(auth.store, auth.key, Number(removeMatch[1]));
        return sendJson(res, 200, { items });
      }

      if (method === 'DELETE' && path === '/api/cart') {
        const items = clearCartKey(auth.store, auth.key);
        return sendJson(res, 200, { items });
      }

      if (method === 'GET' && path === '/api/orders') {
        if (!auth.token || !auth.email) return sendJson(res, 401, { error: 'Login required' });
        const orders = auth.store.orders.filter((o) => o.email === auth.email);
        return sendJson(res, 200, { orders });
      }

      if (method === 'POST' && path === '/api/orders') {
        if (!auth.token || !auth.email) return sendJson(res, 401, { error: 'Login required to place order' });
        const body = (await readBody(req)) as { address?: string; cardName?: string; cardNumber?: string };
        if (!body.address || !body.cardName || !body.cardNumber) {
          return sendJson(res, 400, { error: 'Missing checkout fields' });
        }
        const items = getCart(auth.store, auth.key);
        if (items.length === 0) return sendJson(res, 400, { error: 'Cart is empty' });
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const order: OrderRecord = {
          orderId,
          email: auth.email,
          items: [...items],
          address: body.address,
          cardName: body.cardName,
          createdAt: new Date().toISOString(),
        };
        auth.store.orders.push(order);
        clearCartKey(auth.store, auth.key);
        return sendJson(res, 201, { orderId, items });
      }

      return sendJson(res, 404, { error: 'Not found' });
    } catch {
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  };
};

export const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server: { middlewares: Connect.Server }) {
    server.middlewares.use(createMockApiMiddleware());
  },
  configurePreviewServer(server: { middlewares: Connect.Server }) {
    server.middlewares.use(createMockApiMiddleware());
  },
});
