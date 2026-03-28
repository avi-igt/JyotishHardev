import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import Layout from '@/components/Layout';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  name: string;
  lagna?: string;
  moon_sign?: string;
  generation_status?: string;
  trial_expires_at?: string;
  chart?: Record<string, any>;
}

interface Prediction {
  id: string;
  domain: string;
  predicted_year_start: number;
  predicted_year_end: number;
  text: string;
  confidence_score: number;
}

const DOMAIN_ICONS: Record<string, string> = {
  career: '⚡',
  love: '❤',
  health: '🌿',
  finance: '💰',
  family: '🏠',
  other: '◎',
};

// ─── Components ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div className="skeleton skeleton--year" />
      <div className="skeleton skeleton--bar" />
      <div className="skeleton skeleton--icon" />
      <div className="skeleton skeleton--label" />
      <style jsx>{`
        .skeleton-row {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid #e8e2d9;
          gap: 12px;
          min-height: 52px;
        }
        .skeleton {
          background: linear-gradient(90deg, #e8e2d9 25%, #f0ebe0 50%, #e8e2d9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 4px;
        }
        .skeleton--year { width: 72px; height: 14px; flex-shrink: 0; }
        .skeleton--bar { flex: 1; height: 8px; }
        .skeleton--icon { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; }
        .skeleton--label { width: 56px; height: 12px; flex-shrink: 0; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

function MilestoneRow({ prediction }: { prediction: Prediction }) {
  const icon = DOMAIN_ICONS[prediction.domain] ?? '◎';
  const yearRange =
    prediction.predicted_year_start === prediction.predicted_year_end
      ? String(prediction.predicted_year_start)
      : `${prediction.predicted_year_start}–${prediction.predicted_year_end}`;
  const pct = Math.round(prediction.confidence_score * 100);

  return (
    <div className="milestone-row" tabIndex={0} role="listitem">
      <span className="milestone-year">{yearRange}</span>
      <div className="milestone-bar-track">
        <div className="milestone-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="milestone-domain-icon" aria-hidden="true">{icon}</span>
      <span className="milestone-domain-label">
        {prediction.domain.charAt(0).toUpperCase() + prediction.domain.slice(1)}
      </span>
      <style jsx>{`
        .milestone-row {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #e8e2d9;
          gap: 12px;
          min-height: 52px;
          transition: background 150ms ease;
        }
        .milestone-row:last-child { border-bottom: none; }
        .milestone-row:focus { outline: 2px solid #1b1f4a; background: #f9f7f2; }
        .milestone-year { font-size: 14px; font-weight: 600; color: #1a1a2e; min-width: 72px; flex-shrink: 0; }
        .milestone-bar-track { flex: 1; height: 8px; background: #e8e2d9; border-radius: 4px; overflow: hidden; }
        .milestone-bar-fill { height: 100%; background: #c9a84c; border-radius: 4px; min-width: 8px; }
        .milestone-domain-icon { font-size: 16px; flex-shrink: 0; }
        .milestone-domain-label { font-size: 12px; color: #6b6b8a; min-width: 56px; flex-shrink: 0; text-align: right; }
      `}</style>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

const DashboardPage: NextPage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProfile = async () => {
    try {
      const p = await api.getMe();
      setProfile(p);
      return p;
    } catch {
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const data = await api.getPredictions();
      setPredictions(Array.isArray(data) ? data : data.predictions ?? []);
    } catch {
      // silent — dashboard still usable without predictions
    } finally {
      setLoadingPredictions(false);
    }
  };

  useEffect(() => {
    fetchProfile().then((p) => {
      if (p?.generation_status === 'pending') {
        pollRef.current = setInterval(async () => {
          const updated = await fetchProfile();
          if (updated?.generation_status !== 'pending') {
            if (pollRef.current) clearInterval(pollRef.current);
            fetchPredictions();
          }
        }, 5000);
      }
    });
    fetchPredictions();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const isPending = profile?.generation_status === 'pending';

  return (
    <Layout>
      <Head>
        <title>Dashboard · JyotishHardev</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Lagna strip */}
      <div className="lagna-strip">
        {loadingProfile ? (
          <span className="lagna-loading">Loading your chart…</span>
        ) : profile?.lagna || profile?.moon_sign ? (
          <span>
            {profile.lagna && <span>{profile.lagna} Lagna</span>}
            {profile.lagna && profile.moon_sign && <span className="sep"> · </span>}
            {profile.moon_sign && <span>{profile.moon_sign} Moon</span>}
          </span>
        ) : (
          <span>Welcome, {profile?.name ?? 'friend'}</span>
        )}
      </div>

      <div className="page-body">
        {/* Pending state */}
        {isPending && (
          <div className="pending-banner" role="status">
            <div className="pending-spinner" aria-hidden="true" />
            <span>Generating your predictions… this may take a moment.</span>
          </div>
        )}

        {/* Timeline card */}
        <section className="section">
          <h2 className="section-title">Your Life Timeline</h2>

          <div className="timeline-card" role="list" aria-label="Life milestone predictions">
            {loadingPredictions || isPending ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : predictions.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">
                  Your predictions are being computed. Check back soon.
                </p>
              </div>
            ) : (
              predictions.map((p) => <MilestoneRow key={p.id} prediction={p} />)
            )}
          </div>
        </section>

        {/* Chart section */}
        {profile?.chart && (
          <section className="section">
            <button
              className="chart-toggle"
              onClick={() => setShowChart((v) => !v)}
              aria-expanded={showChart}
            >
              {showChart ? 'Hide' : 'Show'} birth chart details
            </button>

            {showChart && (
              <div className="chart-card">
                <h3 className="chart-title">Birth Chart</h3>
                {Object.entries(profile.chart).map(([key, val]) => (
                  <div key={key} className="chart-row">
                    <span className="chart-key">{key.replace(/_/g, ' ')}</span>
                    <span className="chart-val">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Chat FAB */}
        <Link href="/chat" className="chat-fab" aria-label="Ask Hardev">
          💬 Ask Hardev…
        </Link>
      </div>

      <style jsx>{`
        .lagna-strip {
          background: #1b1f4a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          padding: 10px 16px;
          letter-spacing: 0.5px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sep {
          opacity: 0.5;
        }

        .lagna-loading {
          opacity: 0.6;
        }

        .page-body {
          padding: 20px 16px 100px;
          max-width: 600px;
          margin: 0 auto;
        }

        .pending-banner {
          background: #fff8e6;
          border: 1.5px solid #f0c040;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 14px;
          color: #7a5c00;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .pending-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #f0c040;
          border-top-color: #7a5c00;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .section {
          margin-bottom: 28px;
        }

        .section-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 22px;
          color: #1b1f4a;
          margin-bottom: 14px;
        }

        .timeline-card {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(27, 31, 74, 0.08);
        }

        .empty-state {
          padding: 32px 20px;
          text-align: center;
        }

        .empty-text {
          font-size: 14px;
          color: #6b6b8a;
          line-height: 1.6;
        }

        /* Chart section */
        .chart-toggle {
          background: transparent;
          color: #1b1f4a;
          border: 1.5px solid #1b1f4a;
          border-radius: 24px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          min-height: 44px;
          transition: background 150ms ease;
          margin-bottom: 12px;
        }

        .chart-toggle:hover {
          background: #f0edf8;
        }

        .chart-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(27, 31, 74, 0.06);
        }

        .chart-title {
          font-size: 14px;
          font-weight: 700;
          color: #1b1f4a;
          margin-bottom: 14px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .chart-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 8px 0;
          border-bottom: 1px solid #f0ebe0;
          gap: 12px;
          font-size: 13px;
        }

        .chart-row:last-child { border-bottom: none; }

        .chart-key {
          color: #6b6b8a;
          text-transform: capitalize;
          flex-shrink: 0;
        }

        .chart-val {
          color: #1a1a2e;
          font-weight: 500;
          text-align: right;
          word-break: break-all;
        }

        /* Chat FAB */
        .chat-fab {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: #1b1f4a;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 24px;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(27, 31, 74, 0.25);
          white-space: nowrap;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 150ms ease;
        }

        .chat-fab:hover {
          opacity: 0.88;
        }
      `}</style>
    </Layout>
  );
};

export default DashboardPage;
