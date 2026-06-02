import type { Product } from '../data/products';
import type { Comment, Post } from '../data/posts';
import type { TableRow } from '../data/tableRows';
import type { Currency } from '../i18n/currency';
import type { Lang } from '../i18n';

export type ApiRole = 'user' | 'admin';
export type ApiCartItem = { productId: number; qty: number };

export type ProductFilters = {
  search?: string;
  category?: string;
  brand?: string;
};

export type PostSummary = Omit<Post, 'body' | 'comments'> & { commentCount: number };

export type OrderRecord = {
  orderId: string;
  email: string;
  items: ApiCartItem[];
  address: string;
  cardName: string;
  createdAt: string;
};

export type ApiSettings = {
  theme: 'light' | 'dark';
  lang: Lang;
  currency: Currency;
  difficulty: 'stable' | 'flaky';
  dataMode: 'empty' | 'populated';
};

export type ApiFileRecord = {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  preview: string | null;
};

const TOKEN_KEY = 'automation-site:token';
const SESSION_KEY = 'automation-site:session';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const getSessionId = (): string => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const buildQuery = (filters?: ProductFilters) => {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.brand) params.set('brand', filters.brand);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('X-Session-Id', getSessionId());

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(path, { ...init, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError((body as { error?: string }).error ?? res.statusText, res.status);
  }
  return body as T;
};

export const apiLogin = (email: string, password: string) =>
  apiFetch<{ token: string; email: string; role: ApiRole; items: ApiCartItem[] }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  });

export const apiSignup = (name: string, email: string, password: string) =>
  apiFetch<{ token: string; email: string; role: ApiRole; items: ApiCartItem[] }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }).then((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  });

export const apiLogout = () =>
  apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }).finally(() => {
    clearToken();
  });

export const apiMe = () => apiFetch<{ email: string; role: ApiRole }>('/api/auth/me');

export const apiGetCart = () => apiFetch<{ items: ApiCartItem[] }>('/api/cart');

export const apiAddToCart = (productId: number, qty = 1) =>
  apiFetch<{ items: ApiCartItem[] }>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, qty }),
  });

export const apiRemoveFromCart = (productId: number) =>
  apiFetch<{ items: ApiCartItem[] }>(`/api/cart/items/${productId}`, { method: 'DELETE' });

export const apiClearCart = () => apiFetch<{ items: ApiCartItem[] }>('/api/cart', { method: 'DELETE' });

export const apiGetOrders = () => apiFetch<{ orders: OrderRecord[] }>('/api/orders');

export const apiPlaceOrder = (payload: { address: string; cardName: string; cardNumber: string }) =>
  apiFetch<{ orderId: string }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const apiSubmitContact = (payload: { name: string; email: string; subject: string; message: string }) =>
  apiFetch<{ ok: boolean }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const apiReset = () => apiFetch<{ ok: boolean }>('/api/dev/reset', { method: 'POST' });

export const apiGetProducts = (filters?: ProductFilters) =>
  apiFetch<{ products: Product[] }>(`/api/products${buildQuery(filters)}`);

export const apiGetProduct = (id: number) => apiFetch<{ product: Product }>(`/api/products/${id}`);

export const apiGetPosts = () => apiFetch<{ posts: PostSummary[] }>('/api/posts');

export const apiGetPost = (id: number) => apiFetch<{ post: Post }>(`/api/posts/${id}`);

export const apiAddComment = (postId: number, payload: { author: string; text: string }) =>
  apiFetch<{ comments: Comment[] }>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const apiGetSettings = () => apiFetch<{ settings: ApiSettings }>('/api/settings');

export const apiPatchSettings = (patch: Partial<ApiSettings>) =>
  apiFetch<{ settings: ApiSettings }>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

export const apiGetTableRows = (search?: string) => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<{ rows: TableRow[] }>(`/api/table-rows${qs}`);
};

export const apiClearTableRows = () => apiFetch<{ rows: TableRow[] }>('/api/table-rows', { method: 'DELETE' });

export const apiBulkTableRows = (rows: TableRow[]) =>
  apiFetch<{ rows: TableRow[] }>('/api/table-rows/bulk', {
    method: 'POST',
    body: JSON.stringify({ rows }),
  });

export const apiGetFiles = () => apiFetch<{ files: ApiFileRecord[] }>('/api/files');

export const apiUploadFile = (payload: {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  preview: string | null;
}) =>
  apiFetch<{ file: ApiFileRecord }>('/api/files', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
