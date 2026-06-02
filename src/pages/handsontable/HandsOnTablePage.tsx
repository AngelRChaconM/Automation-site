import { useEffect, useMemo, useRef, useState } from 'react';
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import * as XLSX from 'xlsx';
import { TABLE_ROWS, type TableRow } from '../../data/tableRows';
import { useApp } from '../../context/AppContext';
import { useT } from '../../i18n/useT';

registerAllModules();

const HEADERS = ['ID', 'Name', 'Email', 'Age', 'Country', 'Active', 'Salary'];

const toMatrix = (rows: TableRow[]): (string | number | boolean)[][] =>
  rows.map((r) => [r.id, r.name, r.email, r.age, r.country, r.active, r.salary]);

const truthy = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  return ['true', '1', 'yes', 'si', 'sí'].includes(String(v ?? '').trim().toLowerCase());
};

type RawRow = Record<string, unknown>;

const normalizeKey = (key: string) => key.trim().toLowerCase();

const findKey = (obj: RawRow, candidates: string[]): unknown => {
  const keys = Object.keys(obj);
  for (const candidate of candidates) {
    const match = keys.find((k) => normalizeKey(k) === candidate);
    if (match !== undefined) return obj[match];
  }
  return undefined;
};

const parseRows = (raw: RawRow[], startId: number): TableRow[] =>
  raw.map((r, i) => ({
    id: Number(findKey(r, ['id']) ?? startId + i),
    name: String(findKey(r, ['name']) ?? ''),
    email: String(findKey(r, ['email']) ?? ''),
    age: Number(findKey(r, ['age']) ?? 0),
    country: String(findKey(r, ['country']) ?? ''),
    active: truthy(findKey(r, ['active'])),
    salary: Number(findKey(r, ['salary']) ?? 0),
  }));

export const HandsOnTablePage = () => {
  const { state } = useApp();
  const tt = useT();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<TableRow[]>(state.dataMode === 'empty' ? [] : TABLE_ROWS);
  const [filter, setFilter] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setRows(state.dataMode === 'empty' ? [] : TABLE_ROWS);
  }, [state.dataMode]);

  const data = useMemo(() => {
    const filtered = filter
      ? rows.filter(
          (r) =>
            r.name.toLowerCase().includes(filter.toLowerCase()) ||
            r.email.toLowerCase().includes(filter.toLowerCase()) ||
            r.country.toLowerCase().includes(filter.toLowerCase()),
        )
      : rows;
    return toMatrix(filtered);
  }, [rows, filter]);

  const handleClear = () => {
    setRows([]);
    setFeedback({ kind: 'ok', text: tt('hot.cleared') });
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('Empty workbook');
      const sheet = workbook.Sheets[sheetName];
      const parsed = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' });
      const nextId = (rows.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
      const newRows = parseRows(parsed, nextId);
      if (newRows.length === 0) {
        setFeedback({ kind: 'err', text: tt('hot.noRows') });
      } else {
        setRows([...rows, ...newRows]);
        setFeedback({ kind: 'ok', text: tt('hot.loaded', { count: newRows.length, name: file.name }) });
      }
    } catch (err) {
      setFeedback({ kind: 'err', text: tt('hot.parseError', { message: (err as Error).message }) });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <section data-testid="page-handsontable">
      <h1>{tt('hot.title')}</h1>
      <p className="muted">{tt('hot.subtitle')}</p>

      <div className="flex-row" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder={tt('hot.filter')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          data-testid="hot-filter"
          style={{ flex: 1, minWidth: 220, maxWidth: 380 }}
        />
        <button className="btn" onClick={handleUploadClick} data-testid="hot-upload-btn">
          {tt('hot.upload')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          data-testid="hot-file-input"
          style={{ display: 'none' }}
        />
        <button className="btn secondary" onClick={handleClear} data-testid="hot-clear-btn">
          {tt('hot.clear')}
        </button>
        <span className="tag" data-testid="hot-row-count">
          {tt('hot.rows', { count: data.length })}
        </span>
      </div>

      <p className="muted" style={{ fontSize: 12 }}>
        {tt('hot.columnsHint')}
      </p>

      {feedback && (
        <div
          className="alert-banner"
          data-testid={feedback.kind === 'ok' ? 'hot-upload-success' : 'hot-upload-error'}
          style={feedback.kind === 'err' ? { borderColor: 'crimson', background: 'rgba(220,20,60,0.08)' } : undefined}
        >
          {feedback.text}
        </div>
      )}

      <div className="hot-host" data-testid="hot-container">
        <HotTable
          themeName="ht-theme-main"
          data={data}
          colHeaders={HEADERS}
          rowHeaders={true}
          columnSorting={true}
          contextMenu={true}
          manualColumnResize={true}
          manualRowResize={true}
          stretchH="all"
          height={400}
          licenseKey="non-commercial-and-evaluation"
          columns={[
            { type: 'numeric', readOnly: true },
            { type: 'text' },
            { type: 'text' },
            { type: 'numeric', validator: (value, cb) => cb(typeof value === 'number' && value >= 0 && value <= 120) },
            { type: 'text' },
            { type: 'checkbox' },
            { type: 'numeric', numericFormat: { pattern: '$0,0' } },
          ]}
        />
      </div>
    </section>
  );
};
