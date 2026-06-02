import { useRef, useState } from 'react';
import { useT } from '../../i18n/useT';
import { PlaygroundNav } from './PlaygroundNav';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXT = ['.txt', '.json', '.pdf'];

type Feedback = { kind: 'ok' | 'err'; text: string } | null;

type UploadedItem = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  preview: string | null;
};

const getExtension = (name: string) => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
};

const readPreview = async (file: File): Promise<string | null> => {
  const ext = getExtension(file.name);
  if (ext !== '.txt' && ext !== '.json') return null;
  const text = await file.text();
  return text.slice(0, 200);
};

const fileAccept = '.txt,.json,.pdf,text/plain,application/json,application/pdf';

export const Files = () => {
  const tt = useT();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<UploadedItem[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (file: File): void => {
    if (file.size === 0) throw new Error(tt('files.error.empty'));
    if (file.size > MAX_BYTES) throw new Error(tt('files.error.tooLarge'));
    const ext = getExtension(file.name);
    if (!ALLOWED_EXT.includes(ext)) throw new Error(tt('files.error.type'));
  };

  const selectFile = (file: File) => {
    setPendingFile(file);
    setFeedback(null);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    e.target.value = '';
  };

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleUploadSubmit = async () => {
    if (!pendingFile) return;
    try {
      validateFile(pendingFile);
      const preview = await readPreview(pendingFile);
      setUploaded((prev) => [
        ...prev,
        {
          name: pendingFile.name,
          size: pendingFile.size,
          type: pendingFile.type || 'application/octet-stream',
          lastModified: pendingFile.lastModified,
          preview,
        },
      ]);
      setFeedback({ kind: 'ok', text: tt('files.uploadSuccess') });
      setPendingFile(null);
      resetFileInput();
    } catch (err) {
      setFeedback({ kind: 'err', text: (err as Error).message });
    }
  };

  const handleClearPending = () => {
    setPendingFile(null);
    resetFileInput();
    setFeedback(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const handleGeneratedDownload = () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const content = `Generated at ${new Date().toISOString()}\nAssert line: EXPECTED_GENERATED_LINE\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-${stamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => `${bytes.toLocaleString()} B`;
  const formatDate = (ms: number) => new Date(ms).toLocaleString();

  return (
    <section data-testid="page-files">
      <PlaygroundNav />
      <h1>{tt('files.title')}</h1>
      <p className="muted">{tt('files.subtitle')}</p>

      <h2 style={{ marginTop: 24 }}>{tt('files.uploadTitle')}</h2>
      <p className="muted" style={{ fontSize: 14 }}>
        {tt('files.allowed')}
      </p>

      <div className="flex-row" style={{ marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="btn secondary" onClick={handleChooseFile} data-testid="files-choose-btn">
          {tt('files.choose')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept}
          onChange={handleFileChange}
          data-testid="files-file-input"
          style={{ display: 'none' }}
          tabIndex={-1}
          aria-hidden
        />
      </div>

      <div className="card" style={{ marginTop: 16, padding: 16 }} data-testid="files-pending-panel">
        {pendingFile ? (
          <>
            <p style={{ margin: '0 0 12px' }}>
              {tt('files.selected')}{' '}
              <strong data-testid="files-pending-name">{pendingFile.name}</strong>{' '}
              <span className="muted" data-testid="files-pending-size">
                ({formatSize(pendingFile.size)})
              </span>
            </p>
            <div className="flex-row" style={{ flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn" onClick={handleUploadSubmit} data-testid="files-submit-btn">
                {tt('files.uploadBtn')}
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={handleClearPending}
                data-testid="files-clear-pending-btn"
              >
                {tt('files.clearSelection')}
              </button>
            </div>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }} data-testid="files-pending-empty">
            {tt('files.pendingEmpty')}
          </p>
        )}
      </div>

      <div
        className="card"
        style={{
          marginTop: 16,
          padding: 16,
          borderStyle: 'dashed',
          borderColor: dragOver ? 'var(--accent, #3b82f6)' : undefined,
        }}
        data-testid="files-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <p className="muted" style={{ margin: 0, textAlign: 'center' }}>
          {tt('files.dropHint')}
        </p>
      </div>

      {feedback && (
        <div
          className="alert-banner"
          data-testid={feedback.kind === 'ok' ? 'files-upload-success' : 'files-upload-error'}
          style={
            feedback.kind === 'err'
              ? { marginTop: 12, borderColor: 'crimson', background: 'rgba(220,20,60,0.08)' }
              : { marginTop: 12 }
          }
        >
          {feedback.text}
        </div>
      )}

      {uploaded.length > 0 && (
        <ul data-testid="files-upload-list" style={{ marginTop: 16, paddingLeft: 20, listStyle: 'disc' }}>
          {uploaded.map((item, i) => (
            <li key={`${item.name}-${item.lastModified}-${i}`} data-testid={`files-upload-item-${i}`}>
              <strong>{item.name}</strong> — {formatSize(item.size)} — {item.type} — {formatDate(item.lastModified)}
              {item.preview !== null && (
                <pre
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%',
                    overflow: 'auto',
                  }}
                >
                  {item.preview}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 32 }}>{tt('files.downloadTitle')}</h2>
      <p className="muted" style={{ fontSize: 14 }}>
        {tt('files.downloadSubtitle')}
      </p>

      <div className="flex-row" style={{ marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
        <a
          className="btn secondary"
          href="/samples/sample.txt"
          download="sample.txt"
          data-testid="files-download-txt"
        >
          {tt('files.downloadTxt')}
        </a>
        <a
          className="btn secondary"
          href="/samples/sample.json"
          download="sample.json"
          data-testid="files-download-json"
        >
          {tt('files.downloadJson')}
        </a>
        <a
          className="btn secondary"
          href="/samples/sample.pdf"
          download="sample.pdf"
          data-testid="files-download-pdf"
        >
          {tt('files.downloadPdf')}
        </a>
        <button
          type="button"
          className="btn"
          onClick={handleGeneratedDownload}
          data-testid="files-download-generated-btn"
        >
          {tt('files.downloadGenerated')}
        </button>
      </div>
    </section>
  );
};
