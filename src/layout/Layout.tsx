import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Lang } from '../i18n';
import { useT } from '../i18n/useT';
import { HamburgerMenu } from './HamburgerMenu';
import { SettingsPanel } from './SettingsPanel';

export const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { state, setLang } = useApp();
  const { pathname } = useLocation();
  const tt = useT();
  const cartCount = state.cart.reduce((acc, i) => acc + i.qty, 0);
  const isEcommerce = pathname.startsWith('/ecommerce');

  const langBtn = (lang: Lang, testid: string) => (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={state.lang === lang}
      onClick={() => void setLang(lang)}
      data-testid={testid}
      style={state.lang === lang ? { fontWeight: 700 } : undefined}
    >
      {lang.toUpperCase()}
    </button>
  );

  return (
    <>
      <header className="app-header">
        <button
          className="icon-btn"
          onClick={() => setMenuOpen(true)}
          aria-label={tt('layout.closeMenu')}
          data-testid="nav-hamburger"
        >
          <span className="hamburger-lines" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span>{tt('layout.menu')}</span>
        </button>
        <Link to="/" className="brand" data-testid="header-brand">
          AutoPractice
        </Link>
        <div className="spacer" />
        {isEcommerce && (
          <Link to="/ecommerce/cart" className="icon-btn" data-testid="header-cart">
            {tt('layout.cart')} ({cartCount})
          </Link>
        )}
        {isEcommerce && state.auth !== 'anon' && (
          <Link to="/ecommerce/login" className="tag" data-testid="header-auth" title={state.userEmail ?? ''}>
            {state.userEmail ?? state.auth}
          </Link>
        )}
        <div className="flex-row" style={{ gap: 4 }} data-testid="header-lang" aria-label={tt('settings.lang')}>
          {langBtn('en', 'header-lang-en')}
          {langBtn('es', 'header-lang-es')}
        </div>
        <button
          className="icon-btn"
          onClick={() => setSettingsOpen(true)}
          aria-label={tt('layout.settings')}
          data-testid="settings-open"
        >
          {tt('layout.settings')}
        </button>
      </header>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className="app-main" data-testid="app-main">
        <Outlet />
      </main>
    </>
  );
};
