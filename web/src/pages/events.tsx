import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LifeEvent {
  id: string;
  type: string;
  description: string;
  date: string;
  prediction_id?: string;
  prediction_text?: string;
  created_at?: string;
}

interface Prediction {
  id: string;
  domain: string;
  predicted_year_start: number;
  predicted_year_end: number;
  text: string;
}

const EVENT_TYPES = ['career', 'marriage', 'health', 'finance', 'family', 'other'];

const DOMAIN_ICONS: Record<string, string> = {
  career: '⚡',
  marriage: '❤',
  health: '🌿',
  finance: '💰',
  family: '🏠',
  other: '◎',
};

// ─── Page ───────────────────────────────────────────────────────────────────────

const EventsPage: NextPage = () => {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [linkedPrediction, setLinkedPrediction] = useState('');

  useEffect(() => {
    Promise.all([
      api.getEvents().then((data: any) => setEvents(Array.isArray(data) ? data : data.events ?? [])),
      api.getPredictions().then((data: any) => setPredictions(Array.isArray(data) ? data : data.predictions ?? [])),
    ])
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, []);

  const resetForm = () => {
    setType('');
    setDate('');
    setDescription('');
    setLinkedPrediction('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !date || !description.trim()) {
      setError('Please fill in type, date, and description.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const body: any = { type, date, description };
      if (linkedPrediction) body.prediction_id = linkedPrediction;

      const newEvent = await api.logEvent(body);
      setEvents((prev) => [newEvent, ...prev]);
      resetForm();
      setShowForm(false);
      setSuccess('Event logged!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.detail ?? 'Failed to log event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Events · JyotishHardev</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page-body">
        <div className="header-row">
          <h1 className="page-title">Life Events</h1>
          <button
            className="log-btn"
            onClick={() => { setShowForm((v) => !v); resetForm(); }}
            aria-expanded={showForm}
          >
            {showForm ? '✕ Cancel' : '+ Log event'}
          </button>
        </div>

        {success && (
          <div className="success-banner" role="status">
            {success}
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <div className="form-card">
            <h2 className="form-title">Log a life event</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="type" className="label">Type</label>
                <select
                  id="type"
                  className="select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="">Select type…</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {DOMAIN_ICONS[t] ?? '◎'} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="date" className="label">Date</label>
                <input
                  id="date"
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="field">
                <label htmlFor="description" className="label">Description</label>
                <textarea
                  id="description"
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened?"
                  rows={3}
                  required
                />
              </div>

              {predictions.length > 0 && (
                <div className="field">
                  <label htmlFor="linked" className="label">
                    This confirms a prediction <span className="optional">(optional)</span>
                  </label>
                  <select
                    id="linked"
                    className="select"
                    value={linkedPrediction}
                    onChange={(e) => setLinkedPrediction(e.target.value)}
                  >
                    <option value="">None</option>
                    {predictions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.predicted_year_start}–{p.predicted_year_end}: {p.text.slice(0, 60)}…
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="error-box" role="alert">{error}</div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Save event'}
              </button>
            </form>
          </div>
        )}

        {/* Events list */}
        {loadingEvents ? (
          <div className="loading">
            <div className="spinner" aria-label="Loading events" />
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">📅</div>
            <p className="empty-title">No events logged yet</p>
            <p className="empty-body">
              Log life events to track which predictions come true. Every confirmation
              improves Hardev&apos;s accuracy score.
            </p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((evt) => (
              <div key={evt.id} className="event-card">
                <div className="event-header">
                  <span className="event-icon" aria-hidden="true">
                    {DOMAIN_ICONS[evt.type] ?? '◎'}
                  </span>
                  <span className="event-type">
                    {evt.type.charAt(0).toUpperCase() + evt.type.slice(1)}
                  </span>
                  <span className="event-date">
                    {new Date(evt.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="event-description">{evt.description}</p>
                {evt.prediction_text && (
                  <div className="event-prediction-link">
                    ✓ Confirms: <em>{evt.prediction_text.slice(0, 80)}…</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-body {
          padding: 24px 16px 100px;
          max-width: 600px;
          margin: 0 auto;
        }

        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }

        .page-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 26px;
          color: #1b1f4a;
        }

        .log-btn {
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 24px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          transition: opacity 150ms ease;
          flex-shrink: 0;
        }

        .log-btn:hover {
          opacity: 0.88;
        }

        .success-banner {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          color: #166534;
          margin-bottom: 16px;
        }

        /* Form */
        .form-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(27, 31, 74, 0.08);
          margin-bottom: 20px;
        }

        .form-title {
          font-size: 16px;
          font-weight: 700;
          color: #1b1f4a;
          margin-bottom: 20px;
        }

        .field {
          margin-bottom: 18px;
        }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .optional {
          font-weight: 400;
          color: #6b6b8a;
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #e0dbd0;
          border-radius: 8px;
          background: #f9f7f2;
          color: #1a1a2e;
          outline: none;
          transition: border-color 150ms ease;
          min-height: 44px;
          font-family: inherit;
        }

        .select {
          appearance: none;
          -webkit-appearance: none;
        }

        .textarea {
          resize: vertical;
          min-height: 80px;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          border-color: #1b1f4a;
          background: #ffffff;
        }

        .error-box {
          background: #fff5f5;
          border: 1.5px solid #ffb3b3;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          color: #c0392b;
          margin-bottom: 16px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          min-height: 52px;
          transition: opacity 150ms ease;
        }

        .submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Loading */
        .loading {
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e8e2d9;
          border-top-color: #1b1f4a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Empty */
        .empty-state {
          text-align: center;
          padding: 48px 24px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 14px;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #1b1f4a;
          margin-bottom: 8px;
        }

        .empty-body {
          font-size: 14px;
          color: #6b6b8a;
          line-height: 1.6;
        }

        /* Events list */
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .event-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 18px;
          box-shadow: 0 1px 4px rgba(27, 31, 74, 0.06);
        }

        .event-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .event-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .event-type {
          font-weight: 600;
          font-size: 14px;
          color: #1b1f4a;
          flex: 1;
        }

        .event-date {
          font-size: 12px;
          color: #6b6b8a;
          flex-shrink: 0;
        }

        .event-description {
          font-size: 14px;
          color: #1a1a2e;
          line-height: 1.6;
          margin-bottom: 0;
        }

        .event-prediction-link {
          margin-top: 10px;
          font-size: 12px;
          color: #166534;
          background: #f0fdf4;
          border-radius: 6px;
          padding: 6px 10px;
          line-height: 1.5;
        }
      `}</style>
    </Layout>
  );
};

export default EventsPage;
