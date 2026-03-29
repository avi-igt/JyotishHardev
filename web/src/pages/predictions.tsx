/**
 * /predictions — Hardev's public macro predictions, tracked for accuracy.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';

// ─── Types ────────────────────────────────────────────────────────────────────

type PredictionStatus = 'pending' | 'confirmed' | 'missed';

interface PublicPrediction {
  id: string;
  topic: string;
  text: string;
  posted_at: string;
  target_date?: string;
  status: PredictionStatus;
}

interface PredictionsResponse {
  predictions: PublicPrediction[];
  accuracy_pct?: number;
  total_confirmed?: number;
  total_evaluated?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<PredictionStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  missed:    'Missed',
};

const STATUS_COLOR: Record<PredictionStatus, { bg: string; text: string; border: string }> = {
  pending:   { bg: '#f5f5f5',  text: '#6b6b8a', border: '#d0d0e0' },
  confirmed: { bg: '#e6f7ef',  text: '#1e7d4f', border: '#a3d9b8' },
  missed:    { bg: '#fff0f0',  text: '#b00020', border: '#ffb0b0' },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PredictionsPage: NextPage = () => {
  const [data, setData] = useState<PredictionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiBase}/api/v1/public/predictions`)
      .then(r => (r.ok ? r.json() : Promise.reject('fetch failed')))
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Could not load predictions. Please try again.'); setLoading(false); });
  }, []);

  const sorted = data?.predictions
    ? [...data.predictions].sort(
        (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
      )
    : [];

  const hasAccuracy =
    data &&
    typeof data.accuracy_pct === 'number' &&
    typeof data.total_evaluated === 'number' &&
    data.total_evaluated > 0;

  return (
    <>
      <Head>
        <title>Hardev&apos;s Macro Predictions · JyotishHardev</title>
        <meta
          name="description"
          content="Jyotish-based predictions about world events, markets, geopolitics, and trends — publicly tracked for accuracy over time. See which predictions came true."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <PublicNav activePage="predictions" />

        <div className="container">
          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">Hardev&apos;s Macro Predictions</h1>
            <p className="hero-sub">
              Predictions about world events, markets, and trends —
              tracked publicly for accuracy over time.
            </p>
          </div>

          {/* Accuracy banner */}
          {!loading && hasAccuracy && (
            <div className="accuracy-banner">
              <div className="accuracy-number">{Math.round(data!.accuracy_pct!)}%</div>
              <div className="accuracy-meta">
                <div className="accuracy-label">of past predictions confirmed</div>
                <div className="accuracy-sub">
                  {data!.total_confirmed} of {data!.total_evaluated} evaluated predictions
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && <div className="error-box">{error}</div>}

          {/* Skeleton */}
          {loading && (
            <div className="predictions-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="pred-card">
                  <div className="sk-header">
                    <div className="sk-badge" />
                    <div className="sk-date" />
                  </div>
                  <div className="sk-text" />
                  <div className="sk-text short" />
                  <div className="sk-status" />
                </div>
              ))}
            </div>
          )}

          {/* Predictions list */}
          {!loading && data && sorted.length > 0 && (
            <div className="predictions-list">
              {sorted.map(pred => {
                const colors = STATUS_COLOR[pred.status];
                return (
                  <div key={pred.id} className="pred-card">
                    <div className="pred-header">
                      <span className="pred-topic">{pred.topic}</span>
                      <span className="pred-date">{formatDate(pred.posted_at)}</span>
                    </div>

                    <p className="pred-text">{pred.text}</p>

                    <div className="pred-footer">
                      {pred.target_date && (
                        <span className="pred-target">
                          Target: {formatDate(pred.target_date)}
                        </span>
                      )}
                      <span
                        className="pred-status"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {pred.status === 'confirmed' && '✓ '}
                        {pred.status === 'missed' && '✗ '}
                        {STATUS_LABEL[pred.status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && data && sorted.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <div className="empty-title">No public predictions yet</div>
              <div className="empty-sub">Check back soon — Hardev&apos;s macro predictions will appear here when published.</div>
            </div>
          )}

          {/* CTA */}
          <div className="cta-card">
            <h2 className="cta-heading">Get your personal predictions</h2>
            <p className="cta-body">
              Hardev generates a 20-year personalised prediction timeline from your Vedic birth chart —
              tracking which events actually occur, and building an accuracy score over time.
            </p>
            <Link href="/signup" className="cta-btn">Start your free trial →</Link>
            <p className="cta-sub">30-day trial · No credit card needed</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f0e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e;
        }

        .container {
          max-width: 720px;
          margin: 0 auto;
          padding: 40px 16px 80px;
        }

        /* Hero */
        .hero {
          text-align: center;
          margin-bottom: 32px;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 34px;
          color: #1b1f4a;
          margin: 0 0 10px;
          line-height: 1.2;
        }

        .hero-sub {
          font-size: 15px;
          color: #6b6b8a;
          margin: 0;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        /* Accuracy banner */
        .accuracy-banner {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #1b1f4a;
          border-radius: 12px;
          padding: 20px 28px;
          margin-bottom: 28px;
        }

        .accuracy-number {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 52px;
          font-weight: 700;
          color: #c9a84c;
          line-height: 1;
          flex-shrink: 0;
        }

        .accuracy-label {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .accuracy-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
        }

        /* Error */
        .error-box {
          background: #fff0f0;
          border: 1px solid #ffc0c0;
          border-radius: 8px;
          padding: 14px 16px;
          color: #b00020;
          font-size: 14px;
          margin-bottom: 24px;
          text-align: center;
        }

        /* Predictions list */
        .predictions-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 28px;
        }

        .pred-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.08);
        }

        .pred-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .pred-topic {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #1b1f4a;
          background: #e8e0d0;
          padding: 3px 10px;
          border-radius: 10px;
        }

        .pred-date {
          font-size: 12px;
          color: #9b9bb0;
        }

        .pred-text {
          font-size: 15px;
          color: #1a1a2e;
          line-height: 1.65;
          margin: 0 0 12px;
        }

        .pred-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pred-target {
          font-size: 12px;
          color: #6b6b8a;
        }

        .pred-status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          margin-left: auto;
        }

        /* Skeleton */
        .sk-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .sk-badge {
          width: 70px; height: 20px;
          background: #e8e2d9;
          border-radius: 10px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .sk-date {
          width: 100px; height: 14px;
          background: #e8e2d9;
          border-radius: 6px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .sk-text {
          height: 14px;
          background: #e8e2d9;
          border-radius: 6px;
          margin-bottom: 6px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .sk-text.short { width: 65%; }

        .sk-status {
          width: 80px; height: 22px;
          background: #e8e2d9;
          border-radius: 12px;
          margin-top: 8px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 48px 20px;
          margin-bottom: 28px;
        }

        .empty-icon {
          font-size: 32px;
          color: #c9a84c;
          margin-bottom: 12px;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #1b1f4a;
          margin-bottom: 6px;
        }

        .empty-sub {
          font-size: 14px;
          color: #6b6b8a;
          max-width: 360px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* CTA */
        .cta-card {
          background: #1b1f4a;
          border-radius: 12px;
          padding: 32px 28px;
          text-align: center;
        }

        .cta-heading {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 22px;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .cta-body {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          margin: 0 0 20px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-btn {
          display: inline-block;
          background: #c9a84c;
          color: #1b1f4a;
          font-weight: 700;
          font-size: 15px;
          padding: 12px 28px;
          border-radius: 24px;
          text-decoration: none;
          transition: opacity 150ms;
        }

        .cta-btn:hover { opacity: 0.88; }

        .cta-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin: 12px 0 0;
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 26px; }
          .accuracy-number { font-size: 40px; }
        }
      `}</style>
    </>
  );
};

export default PredictionsPage;
