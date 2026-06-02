import { useState } from 'react';
import { useT } from '../../i18n/useT';
import { PlaygroundNav } from './PlaygroundNav';

export const Alerts = () => {
  const tt = useT();
  const [last, setLast] = useState<string>('');

  const onAlert = () => {
    window.alert('This is a JS alert');
    setLast('alert-dismissed');
  };
  const onConfirm = () => {
    const ok = window.confirm('Do you confirm?');
    setLast(ok ? 'confirm-accepted' : 'confirm-cancelled');
  };
  const onPrompt = () => {
    const value = window.prompt('Enter your name', '');
    setLast(`prompt-result:${value ?? ''}`);
  };

  return (
    <section data-testid="page-alerts">
      <PlaygroundNav />
      <h1>{tt('alerts.title')}</h1>
      <p className="muted">{tt('alerts.subtitle')}</p>
      <div className="flex-row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={onAlert} data-testid="alert-btn">
          {tt('alerts.triggerAlert')}
        </button>
        <button className="btn" onClick={onConfirm} data-testid="confirm-btn">
          {tt('alerts.triggerConfirm')}
        </button>
        <button className="btn" onClick={onPrompt} data-testid="prompt-btn">
          {tt('alerts.triggerPrompt')}
        </button>
      </div>
      <p style={{ marginTop: 16 }}>
        {tt('alerts.lastResult')} <code data-testid="alert-result">{last}</code>
      </p>
    </section>
  );
};
