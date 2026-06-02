import { useState } from 'react';
import { ApiError, apiSubmitContact } from '../../api/client';
import { useT } from '../../i18n/useT';

export const Contact = () => {
  const tt = useT();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiSubmitContact(form);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : tt('contact.error'));
    }
  };

  return (
    <section data-testid="page-contact">
      <h1>{tt('contact.title')}</h1>
      {sent ? (
        <div className="alert-banner" data-testid="contact-sent">
          {tt('contact.sent')}
        </div>
      ) : (
        <form className="form-grid" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder={tt('contact.name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            data-testid="contact-name"
          />
          <input
            type="email"
            placeholder={tt('contact.email')}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            data-testid="contact-email"
          />
          <input
            type="text"
            placeholder={tt('contact.subject')}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
            data-testid="contact-subject"
          />
          <textarea
            rows={4}
            placeholder={tt('contact.message')}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            data-testid="contact-message"
          />
          {error && (
            <p style={{ color: 'crimson' }} data-testid="contact-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn" data-testid="contact-submit">
            {tt('contact.submit')}
          </button>
        </form>
      )}
    </section>
  );
};
