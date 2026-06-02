import { NavLink } from 'react-router-dom';
import { useT } from '../../i18n/useT';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `playground-nav-link${isActive ? ' active' : ''}`;

const ITEMS = [
  { to: '/playground/alerts', labelKey: 'nav.alerts', testid: 'playground-nav-alerts' },
  { to: '/playground/files', labelKey: 'nav.files', testid: 'playground-nav-files' },
  { to: '/playground/iframes', labelKey: 'nav.iframes', testid: 'playground-nav-iframes' },
  { to: '/playground/shadow-dom', labelKey: 'nav.shadowdom', testid: 'playground-nav-shadowdom' },
  { to: '/playground/flaky', labelKey: 'nav.flaky', testid: 'playground-nav-flaky' },
] as const;

export const PlaygroundNav = () => {
  const tt = useT();

  return (
    <nav className="playground-nav" data-testid="playground-nav" aria-label={tt('nav.playground')}>
      {ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} className={linkClass} data-testid={item.testid}>
          {tt(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
};
