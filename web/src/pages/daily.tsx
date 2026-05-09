/**
 * /daily — Today's Cosmic Brief (Panchang snapshot).
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';

interface PanchangData {
  tithi: string;
  nakshatra: string;
  yoga: string;
  moon_sign: string;
  date_ist: string;
  energy_summary: string;
}

const DailyPage: NextPage = () => {
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchPanchang = () => {
      setLoading(true);
      fetch(`${apiBase}/api/v1/public/panchang/today`)
        .then(r => (r.ok ? r.json() : Promise.reject('fetch failed')))
        .then(data => { setPanchang(data); setLoading(false); })
        .catch(() => { setError('Could not load today\'s data. Please try again.'); setLoading(false); });
    };

    fetchPanchang();

    // Auto-refresh at midnight IST
    const scheduleRefresh = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const nowIST = new Date(now.getTime() + istOffset);
      const nextMidnightIST = new Date(nowIST);
      nextMidnightIST.setUTCHours(18, 30, 0, 0);
      if (nextMidnightIST <= nowIST) nextMidnightIST.setUTCDate(nextMidnightIST.getUTCDate() + 1);
      const msUntilMidnight = nextMidnightIST.getTime() - now.getTime();
      return setTimeout(() => { fetchPanchang(); scheduleRefresh(); }, msUntilMidnight);
    };

    const timer = scheduleRefresh();
    return () => clearTimeout(timer);
  }, []);

  const facts = panchang
    ? [
        { label: 'Tithi', value: panchang.tithi },
        { label: 'Nakshatra', value: panchang.nakshatra },
        { label: 'Yoga', value: panchang.yoga },
        { label: 'Moon in', value: panchang.moon_sign },
      ]
    : [];

  return (
    <>
      <Head>
        <title>Daily Cosmic Brief · JyotishHardev</title>
        <meta name="description" content="Today's Vedic panchang — Tithi, Nakshatra, Yoga, and Moon sign with energy summary. Updated daily at midnight IST." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://jyotishhardev.com/daily" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="JyotishHardev" />
        <meta property="og:url" content="https://jyotishhardev.com/daily" />
        <meta property="og:title" content="Daily Cosmic Brief · JyotishHardev" />
        <meta property="og:description" content="Today's Vedic panchang — Tithi, Nakshatra, Yoga, and Moon sign with energy summary. Updated daily at midnight IST." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Daily Cosmic Brief · JyotishHardev" />
        <meta name="twitter:description" content="Today's Vedic panchang — Tithi, Nakshatra, Yoga, and Moon sign with energy summary. Updated daily at midnight IST." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <PublicNav activePage="daily" />

        <div className="container">
          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">Today&apos;s Cosmic Brief</h1>
            {panchang && <p className="hero-date">{panchang.date_ist}</p>}
            {!panchang && !loading && <p className="hero-date">Loading date…</p>}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="skeleton-card">
              <div className="skeleton-grid">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton-fact">
                    <div className="skeleton-label" />
                    <div className="skeleton-value" />
                  </div>
                ))}
              </div>
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="error-box">{error}</div>
          )}

          {/* Main card */}
          {!loading && panchang && (
            <>
              <div className="main-card">
                <div className="fact-grid">
                  {facts.map(({ label, value }) => (
                    <div key={label} className="fact-item">
                      <div className="fact-label">{label}</div>
                      <div className="fact-value">{value}</div>
                    </div>
                  ))}
                </div>
                {panchang.energy_summary && (
                  <p className="energy-text">{panchang.energy_summary}</p>
                )}
              </div>

              {/* CTA */}
              <div className="cta-card">
                <h2 className="cta-heading">What does this mean for your chart?</h2>
                <p className="cta-body">
                  These planetary energies interact differently with each person's birth chart.
                  Generate your free Kundli to see how today's Panchang affects your Lagna and Dasha.
                </p>
                <div className="cta-links">
                  <Link href="/" className="cta-link-gold">Generate your free Kundli →</Link>
                </div>
              </div>
            </>
          )}
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
          max-width: 680px;
          margin: 0 auto;
          padding: 40px 16px 80px;
        }

        .hero {
          text-align: center;
          margin-bottom: 32px;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 34px;
          color: #1b1f4a;
          margin: 0 0 8px;
          line-height: 1.2;
        }

        .hero-date {
          font-size: 15px;
          color: #6b6b8a;
          margin: 0;
        }

        /* Skeleton */
        .skeleton-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.08);
          margin-bottom: 24px;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .skeleton-fact {
          padding: 16px;
          background: #f5f0e8;
          border-radius: 8px;
        }

        .skeleton-label {
          height: 12px;
          width: 50%;
          background: #e8e2d9;
          border-radius: 6px;
          margin-bottom: 8px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .skeleton-value {
          height: 20px;
          width: 70%;
          background: #e8e2d9;
          border-radius: 6px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .skeleton-text {
          height: 14px;
          background: #e8e2d9;
          border-radius: 6px;
          margin-bottom: 10px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .skeleton-text.short { width: 60%; }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Main card */
        .main-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.08);
          margin-bottom: 24px;
        }

        .fact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .fact-item {
          background: #f5f0e8;
          border-radius: 10px;
          padding: 16px 18px;
        }

        .fact-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b6b8a;
          margin-bottom: 6px;
        }

        .fact-value {
          font-size: 18px;
          font-weight: 700;
          color: #1b1f4a;
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
        }

        .energy-text {
          font-size: 15px;
          color: #3a3a5c;
          line-height: 1.7;
          font-style: italic;
          border-left: 3px solid #c9a84c;
          padding-left: 14px;
          margin: 0;
        }

        /* Error */
        .error-box {
          background: #fff0f0;
          border: 1px solid #ffc0c0;
          border-radius: 8px;
          padding: 14px 16px;
          color: #b00020;
          font-size: 14px;
          margin-bottom: 20px;
        }

        /* CTA card */
        .cta-card {
          background: #1b1f4a;
          border-radius: 12px;
          padding: 28px;
          color: #ffffff;
          text-align: center;
        }

        .cta-heading {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 20px;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .cta-body {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          line-height: 1.6;
          margin: 0 0 20px;
          max-width: 440px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cta-link-gold {
          color: #c9a84c;
          font-weight: 600;
          text-decoration: none;
          font-size: 15px;
        }

        .cta-link-gold:hover { text-decoration: underline; }

        @media (max-width: 480px) {
          .fact-grid { grid-template-columns: 1fr 1fr; }
          .hero-title { font-size: 26px; }
        }
      `}</style>
    </>
  );
};

export default DailyPage;
