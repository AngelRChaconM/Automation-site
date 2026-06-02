import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/useT';

type Props = { open: boolean; onClose: () => void };

const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

export const HamburgerMenu = ({ open, onClose }: Props) => {
  const { state } = useApp();
  const tt = useT();
  const isLoggedIn = state.auth !== 'anon';

  if (!open) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} data-testid="nav-backdrop" />
      <aside className="drawer" data-testid="nav-drawer" aria-label="Main navigation">
        <header>
          <h2>{tt('layout.menu')}</h2>
          <button className="icon-btn" onClick={onClose} data-testid="nav-close" aria-label={tt('layout.closeMenu')}>
            x
          </button>
        </header>
        <nav onClick={onClose}>
          <div className="section">{tt('nav.general')}</div>
          <NavLink to="/" end className={linkClass} data-testid="nav-home">
            {tt('nav.home')}
          </NavLink>

          <div className="section">{tt('nav.ecommerce')}</div>
          <NavLink to="/ecommerce/products" className={linkClass} data-testid="nav-products">
            {tt('nav.products')}
          </NavLink>
          <NavLink to="/ecommerce/cart" className={linkClass} data-testid="nav-cart">
            {tt('nav.cart')}
          </NavLink>
          {isLoggedIn ? (
            <NavLink to="/ecommerce/login" className={linkClass} data-testid="nav-account">
              {tt('nav.account')}
            </NavLink>
          ) : (
            <NavLink to="/ecommerce/login" className={linkClass} data-testid="nav-login">
              {tt('nav.login')}
            </NavLink>
          )}
          <NavLink to="/ecommerce/contact" className={linkClass} data-testid="nav-contact">
            {tt('nav.contact')}
          </NavLink>

          <div className="section">{tt('nav.blog')}</div>
          <NavLink to="/blog" className={linkClass} data-testid="nav-blog">
            {tt('nav.blog')}
          </NavLink>

          <div className="section">{tt('nav.handsontable')}</div>
          <NavLink to="/handsontable" className={linkClass} data-testid="nav-handsontable">
            {tt('nav.handsontable')}
          </NavLink>

          <div className="section">{tt('nav.playground')}</div>
          <NavLink to="/playground/alerts" className={linkClass} data-testid="nav-alerts">
            {tt('nav.alerts')}
          </NavLink>
          <NavLink to="/playground/files" className={linkClass} data-testid="nav-files">
            {tt('nav.files')}
          </NavLink>
          <NavLink to="/playground/iframes" className={linkClass} data-testid="nav-iframes">
            {tt('nav.iframes')}
          </NavLink>
          <NavLink to="/playground/shadow-dom" className={linkClass} data-testid="nav-shadowdom">
            {tt('nav.shadowdom')}
          </NavLink>
          <NavLink to="/playground/flaky" className={linkClass} data-testid="nav-flaky">
            {tt('nav.flaky')}
          </NavLink>
        </nav>
      </aside>
    </>
  );
};
