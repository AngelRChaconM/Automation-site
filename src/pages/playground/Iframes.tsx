import { useT } from '../../i18n/useT';
import { PlaygroundNav } from './PlaygroundNav';

const inner = `
  <!doctype html>
  <html>
    <head><title>Inner Frame</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 16px; }
        button { padding: 8px 12px; }
      </style>
    </head>
    <body>
      <h2 data-testid="iframe-title">Inner frame content</h2>
      <p>This element lives inside an iframe.</p>
      <input type="text" placeholder="Type here" data-testid="iframe-input" />
      <button data-testid="iframe-button" onclick="document.getElementById('out').innerText='Clicked at '+new Date().toLocaleTimeString()">
        Click me
      </button>
      <p id="out" data-testid="iframe-output"></p>
    </body>
  </html>
`;

export const Iframes = () => {
  const tt = useT();
  const blob = new Blob([inner], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  return (
    <section data-testid="page-iframes">
      <PlaygroundNav />
      <h1>{tt('iframes.title')}</h1>
      <p className="muted">{tt('iframes.subtitle')}</p>
      <iframe
        src={url}
        title="Practice iframe"
        data-testid="practice-iframe"
        name="practice-iframe"
        style={{ width: '100%', height: 320, border: '1px solid var(--color-border)', borderRadius: 4 }}
      />
    </section>
  );
};
