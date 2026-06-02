import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useT } from '../../i18n/useT';
import { PlaygroundNav } from './PlaygroundNav';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const Flaky = () => {
  const { state } = useApp();
  const tt = useT();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFlaky = state.difficulty === 'flaky';

  const fetchSlow = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    const delay = isFlaky ? 400 + Math.random() * 2600 : 600;
    await sleep(delay);
    if (isFlaky && Math.random() < 0.3) {
      setLoading(false);
      setError(tt('flaky.error'));
      return;
    }
    setResult(tt('flaky.loaded', { ms: Math.round(delay) }));
    setLoading(false);
  };

  return (
    <section data-testid="page-flaky">
      <PlaygroundNav />
      <h1>{tt('flaky.title')}</h1>
      <p className="muted" data-testid="flaky-current-diff">
        {tt('flaky.subtitle', { diff: state.difficulty })}
      </p>

      <div className="flex-row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={fetchSlow} disabled={loading} data-testid="flaky-fetch">
          {loading ? tt('flaky.loading') : tt('flaky.fetch')}
        </button>
        {loading && (
          <span data-testid="flaky-spinner" aria-label={tt('flaky.loading')}>
            ...
          </span>
        )}
      </div>

      {result && (
        <p data-testid="flaky-result" style={{ marginTop: 12 }}>
          {result}
        </p>
      )}
      {error && (
        <p data-testid="flaky-error" style={{ marginTop: 12, color: 'crimson' }}>
          {error}
        </p>
      )}

      <h3 style={{ marginTop: 24 }}>{tt('flaky.dynamicTitle')}</h3>
      <p className="muted">{tt('flaky.dynamicHint')}</p>
      <div
        className="card"
        style={{ padding: 12, marginTop: 8 }}
        data-testid={isFlaky ? `dynamic-${Math.floor(Math.random() * 1000)}` : 'dynamic-stable'}
      >
        {tt('flaky.findMe')}
      </div>
    </section>
  );
};
