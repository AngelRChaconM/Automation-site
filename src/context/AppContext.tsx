import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../i18n';
import type { Currency } from '../i18n/currency';

export type Theme = 'light' | 'dark';
export type Auth = 'anon' | 'user' | 'admin';
export type Difficulty = 'stable' | 'flaky';
export type DataMode = 'empty' | 'populated';

export type CartItem = { productId: number; qty: number };

export type AppState = {
  theme: Theme;
  lang: Lang;
  currency: Currency;
  auth: Auth;
  difficulty: Difficulty;
  dataMode: DataMode;
  cart: CartItem[];
  userEmail: string | null;
};

const STORAGE_KEY = 'automation-site:state';

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

const load = (): AppState => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
};

const save = (state: AppState) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

type Ctx = {
  state: AppState;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  setAuth: (a: Auth, email?: string | null) => void;
  setDifficulty: (d: Difficulty) => void;
  setDataMode: (m: DataMode) => void;
  addToCart: (productId: number, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  reset: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => load());

  useEffect(() => {
    save(state);
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('lang', state.lang);
    document.body.setAttribute('data-theme', state.theme);
    document.body.setAttribute('data-lang', state.lang);
    document.body.setAttribute('data-currency', state.currency);
    document.body.setAttribute('data-auth', state.auth);
    document.body.setAttribute('data-difficulty', state.difficulty);
    document.body.setAttribute('data-mode', state.dataMode);
  }, [state]);

  const api = useMemo<Ctx>(() => {
    const setTheme = (theme: Theme) => setState((s) => ({ ...s, theme }));
    const setLang = (lang: Lang) => setState((s) => ({ ...s, lang }));
    const setCurrency = (currency: Currency) => setState((s) => ({ ...s, currency }));
    const setAuth = (auth: Auth, email: string | null = null) =>
      setState((s) => ({ ...s, auth, userEmail: auth === 'anon' ? null : email ?? s.userEmail }));
    const setDifficulty = (difficulty: Difficulty) => setState((s) => ({ ...s, difficulty }));
    const setDataMode = (dataMode: DataMode) => setState((s) => ({ ...s, dataMode }));
    const addToCart = (productId: number, qty = 1) =>
      setState((s) => {
        const existing = s.cart.find((i) => i.productId === productId);
        const cart = existing
          ? s.cart.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i))
          : [...s.cart, { productId, qty }];
        return { ...s, cart };
      });
    const removeFromCart = (productId: number) =>
      setState((s) => ({ ...s, cart: s.cart.filter((i) => i.productId !== productId) }));
    const clearCart = () => setState((s) => ({ ...s, cart: [] }));
    const reset = () => setState(DEFAULT_STATE);

    return { state, setTheme, setLang, setCurrency, setAuth, setDifficulty, setDataMode, addToCart, removeFromCart, clearCart, reset };
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
