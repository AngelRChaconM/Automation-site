import { useEffect, useRef } from 'react';
import { useT } from '../../i18n/useT';
import { PlaygroundNav } from './PlaygroundNav';

export const ShadowDom = () => {
  const tt = useT();
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || host.shadowRoot) return;
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display: block; }
        .panel {
          padding: 16px;
          border: 1px solid #888;
          border-radius: 6px;
          font-family: system-ui, sans-serif;
          background: #fff;
          color: #111;
        }
        button { padding: 8px 12px; cursor: pointer; }
        .out { margin-top: 8px; }
      </style>
      <div class="panel">
        <h3 data-testid="shadow-title">Shadow DOM content</h3>
        <p>This component is inside a shadow root.</p>
        <input type="text" placeholder="Inside shadow" data-testid="shadow-input" />
        <button data-testid="shadow-button">Click inside shadow</button>
        <div class="out" data-testid="shadow-output"></div>
      </div>
    `;
    const btn = root.querySelector('button')!;
    const out = root.querySelector('[data-testid="shadow-output"]')!;
    btn.addEventListener('click', () => {
      out.textContent = `Clicked at ${new Date().toLocaleTimeString()}`;
    });
  }, []);

  return (
    <section data-testid="page-shadow-dom">
      <PlaygroundNav />
      <h1>{tt('shadow.title')}</h1>
      <p className="muted">{tt('shadow.subtitle')}</p>
      <div ref={hostRef} data-testid="shadow-host" />
    </section>
  );
};
