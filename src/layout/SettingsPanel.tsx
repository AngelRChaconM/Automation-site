import { useApp, type Auth, type DataMode, type Difficulty, type Theme } from '../context/AppContext';
import type { Lang } from '../i18n';
import { useT } from '../i18n/useT';
import { CURRENCIES, type Currency } from '../i18n/currency';

type Props = { open: boolean; onClose: () => void };

type Option<T extends string> = { id: T; label: string; testid: string };

export const SettingsPanel = ({ open, onClose }: Props) => {
  const { state, setTheme, setLang, setCurrency, setAuth, setDifficulty, setDataMode, reset } = useApp();
  const tt = useT();

  if (!open) return null;

  const themeOptions: Option<Theme>[] = [
    { id: 'light', label: tt('settings.light'), testid: 'settings-theme-light' },
    { id: 'dark', label: tt('settings.dark'), testid: 'settings-theme-dark' },
  ];
  const langOptions: Option<Lang>[] = [
    { id: 'en', label: tt('settings.lang.en'), testid: 'settings-lang-en' },
    { id: 'es', label: tt('settings.lang.es'), testid: 'settings-lang-es' },
  ];
  const currencyOptions: Option<Currency>[] = CURRENCIES.map((c) => ({
    id: c,
    label: c,
    testid: `settings-currency-${c.toLowerCase()}`,
  }));
  const authOptions: Option<Auth>[] = [
    { id: 'anon', label: tt('settings.anon'), testid: 'settings-auth-anon' },
    { id: 'user', label: tt('settings.user'), testid: 'settings-auth-user' },
    { id: 'admin', label: tt('settings.admin'), testid: 'settings-auth-admin' },
  ];
  const dataOptions: Option<DataMode>[] = [
    { id: 'populated', label: tt('settings.populated'), testid: 'settings-data-populated' },
    { id: 'empty', label: tt('settings.empty'), testid: 'settings-data-empty' },
  ];
  const diffOptions: Option<Difficulty>[] = [
    { id: 'stable', label: tt('settings.stable'), testid: 'settings-diff-stable' },
    { id: 'flaky', label: tt('settings.flaky'), testid: 'settings-diff-flaky' },
  ];

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} data-testid="settings-backdrop" />
      <aside className="drawer right" data-testid="settings-drawer" aria-label="Environment settings">
        <header>
          <h2 data-testid="settings-title">{tt('settings.title')}</h2>
          <button className="icon-btn" onClick={onClose} data-testid="settings-close" aria-label="Close settings">
            x
          </button>
        </header>
        <div className="settings-panel">
          <Row label={tt('settings.theme')} testid="settings-theme">
            {themeOptions.map((o) => (
              <button
                key={o.id}
                aria-pressed={state.theme === o.id}
                onClick={() => setTheme(o.id)}
                data-testid={o.testid}
              >
                {o.label}
              </button>
            ))}
          </Row>

          <Row label={tt('settings.lang')} testid="settings-lang">
            {langOptions.map((o) => (
              <button
                key={o.id}
                aria-pressed={state.lang === o.id}
                onClick={() => setLang(o.id)}
                data-testid={o.testid}
              >
                {o.label}
              </button>
            ))}
          </Row>

          <Row label={tt('settings.currency')} testid="settings-currency">
            {currencyOptions.map((o) => (
              <button
                key={o.id}
                aria-pressed={state.currency === o.id}
                onClick={() => setCurrency(o.id)}
                data-testid={o.testid}
              >
                {o.label}
              </button>
            ))}
          </Row>

          <Row label={tt('settings.auth')} testid="settings-auth">
            {authOptions.map((o) => (
              <button
                key={o.id}
                aria-pressed={state.auth === o.id}
                onClick={() => setAuth(o.id, o.id === 'anon' ? null : `${o.id}@example.com`)}
                data-testid={o.testid}
              >
                {o.label}
              </button>
            ))}
          </Row>

          <Row label={tt('settings.data')} testid="settings-data">
            {dataOptions.map((o) => (
              <button
                key={o.id}
                aria-pressed={state.dataMode === o.id}
                onClick={() => setDataMode(o.id)}
                data-testid={o.testid}
              >
                {o.label}
              </button>
            ))}
          </Row>

          <Row label={tt('settings.difficulty')} testid="settings-difficulty">
            {diffOptions.map((o) => (
              <button
                key={o.id}
                aria-pressed={state.difficulty === o.id}
                onClick={() => setDifficulty(o.id)}
                data-testid={o.testid}
              >
                {o.label}
              </button>
            ))}
          </Row>

          <button className="btn secondary" onClick={reset} data-testid="settings-reset">
            {tt('settings.reset')}
          </button>
        </div>
      </aside>
    </>
  );
};

const Row = ({ label, testid, children }: { label: string; testid: string; children: React.ReactNode }) => (
  <div className="settings-row" data-testid={testid}>
    <label className="title">{label}</label>
    <div className="options">{children}</div>
  </div>
);
