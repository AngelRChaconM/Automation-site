import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  apiAddToCart,
  apiClearCart,
  apiGetCart,
  apiGetSettings,
  apiLogin,
  apiLogout,
  apiMe,
  apiPatchSettings,
  apiRemoveFromCart,
  apiReset,
  apiSignup,
  clearToken,
  getToken,
  type ApiSettings,
} from '../api/client';
import { invalidateProductCatalog } from '../hooks/useProducts';
import { invalidatePostsCache } from '../hooks/usePosts';
import type { Lang } from '../i18n';
import type { Currency } from '../i18n/currency';

export type Theme = ApiSettings['theme'];
export type Auth = 'anon' | 'user' | 'admin';
export type Difficulty = ApiSettings['difficulty'];
export type DataMode = ApiSettings['dataMode'];

export type CartItem = { productId: number; qty: number };

export type AppState = ApiSettings & {
  auth: Auth;
  cart: CartItem[];
  userEmail: string | null;
};

const DEFAULT_STATE: AppState = {
  theme: 'light',
  lang: 'en',
  currency: 'USD',
  auth: 'anon',
  difficulty: 'stable',
  dataMode: 'populated',
  cart: [],
  userEmail: null,
};

type Ctx = {
  state: AppState;
  setTheme: (t: Theme) => Promise<void>;
  setLang: (l: Lang) => Promise<void>;
  setCurrency: (c: Currency) => Promise<void>;
  setAuth: (a: Auth, email?: string | null) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  setDifficulty: (d: Difficulty) => Promise<void>;
  setDataMode: (m: DataMode) => Promise<void>;
  addToCart: (productId: number, qty?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('lang', state.lang);
    document.body.setAttribute('data-theme', state.theme);
    document.body.setAttribute('data-lang', state.lang);
    document.body.setAttribute('data-currency', state.currency);
    document.body.setAttribute('data-auth', state.auth);
    document.body.setAttribute('data-difficulty', state.difficulty);
    document.body.setAttribute('data-mode', state.dataMode);
  }, [state.theme, state.lang, state.currency, state.auth, state.difficulty, state.dataMode]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const settingsRes = await apiGetSettings();
        const settings = settingsRes.settings;

        const token = getToken();
        if (token) {
          const me = await apiMe();
          const cart = await apiGetCart();
          if (!cancelled) {
            setState((s) => ({
              ...s,
              ...settings,
              auth: me.role,
              userEmail: me.email,
              cart: cart.items,
            }));
          }
          return;
        }

        const cart = await apiGetCart();
        if (!cancelled) {
          setState((s) => ({
            ...s,
            ...settings,
            auth: 'anon',
            userEmail: null,
            cart: cart.items,
          }));
        }
      } catch {
        clearToken();
        if (!cancelled) {
          setState((s) => ({ ...DEFAULT_STATE, ...s, auth: 'anon', userEmail: null, cart: [] }));
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const api = useMemo<Ctx>(() => {
    const updateSettings = async (patch: Partial<ApiSettings>) => {
      const { settings } = await apiPatchSettings(patch);
      setState((s) => ({ ...s, ...settings }));
    };

    const setTheme = (theme: Theme) => updateSettings({ theme });
    const setLang = (lang: Lang) => updateSettings({ lang });
    const setCurrency = (currency: Currency) => updateSettings({ currency });
    const setDifficulty = (difficulty: Difficulty) => updateSettings({ difficulty });
    const setDataMode = (dataMode: DataMode) => updateSettings({ dataMode });

    const applySession = (data: { role: Auth; email: string; items: CartItem[] }) => {
      setState((s) => ({
        ...s,
        auth: data.role,
        userEmail: data.email,
        cart: data.items,
      }));
    };

    const setAuth = async (auth: Auth, email: string | null = null) => {
      if (auth === 'anon') {
        await apiLogout();
        const cart = await apiGetCart();
        setState((s) => ({ ...s, auth: 'anon', userEmail: null, cart: cart.items }));
        return;
      }

      const loginEmail = email ?? `${auth}@example.com`;
      const data = await apiLogin(loginEmail, 'password');
      applySession(data);
    };

    const login = async (email: string, password: string) => {
      const data = await apiLogin(email, password);
      applySession(data);
    };

    const signup = async (name: string, email: string, password: string) => {
      const data = await apiSignup(name, email, password);
      applySession(data);
    };

    const addToCart = async (productId: number, qty = 1) => {
      const { items } = await apiAddToCart(productId, qty);
      setState((s) => ({ ...s, cart: items }));
    };

    const removeFromCart = async (productId: number) => {
      const { items } = await apiRemoveFromCart(productId);
      setState((s) => ({ ...s, cart: items }));
    };

    const clearCart = async () => {
      const { items } = await apiClearCart();
      setState((s) => ({ ...s, cart: items }));
    };

    const reset = async () => {
      await apiReset();
      clearToken();
      invalidateProductCatalog();
      invalidatePostsCache();
      const { settings } = await apiGetSettings();
      setState({ ...DEFAULT_STATE, ...settings });
    };

    return {
      state,
      setTheme,
      setLang,
      setCurrency,
      setAuth,
      login,
      signup,
      setDifficulty,
      setDataMode,
      addToCart,
      removeFromCart,
      clearCart,
      reset,
    };
  }, [state]);

  useEffect(() => {
    (window as unknown as { __app: Ctx }).__app = api;
  }, [api]);

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
