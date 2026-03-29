/**
 * /transits — Current planetary positions from the ephemeris.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanetTransit {
  planet: string;
  sign: string;
  degree: number;
  is_retrograde: boolean;
}

interface TransitsResponse {
  transits: PlanetTransit[];
  computed_at: string;
}

// ─── Static lookup tables ─────────────────────────────────────────────────────

const SANSKRIT_NAMES: Record<string, string> = {
  Sun: 'Surya',
  Moon: 'Chandra',
  Mars: 'Mangal',
  Mercury: 'Budha',
  Jupiter: 'Guru',
  Venus: 'Shukra',
  Saturn: 'Shani',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
};

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const SIGN_ELEMENT: Record<string, string> = {
  Mesha: 'Fire', Vrishabha: 'Earth', Mithuna: 'Air', Karka: 'Water',
  Simha: 'Fire', Kanya: 'Earth', Tula: 'Air', Vrishchika: 'Water',
  Dhanu: 'Fire', Makara: 'Earth', Kumbha: 'Air', Meena: 'Water',
};

const SIGN_QUALITY: Record<string, string> = {
  Mesha:      'cardinal initiative and bold impulses',
  Vrishabha:  'fixed determination and sensory depth',
  Mithuna:    'mutable curiosity and mental agility',
  Karka:      'cardinal emotional sensitivity and nurturing',
  Simha:      'fixed confidence and creative expression',
  Kanya:      'mutable precision and discernment',
  Tula:       'cardinal diplomacy and balance-seeking',
  Vrishchika: 'fixed intensity and transformative power',
  Dhanu:      'mutable philosophical expansion',
  Makara:     'cardinal ambition and disciplined structure',
  Kumbha:     'fixed humanitarian vision and innovation',
  Meena:      'mutable compassion and spiritual dissolution',
};

const PLANET_ARCHETYPE: Record<string, { theme: string; action: string; watch: string }> = {
  Sun: {
    theme: 'identity, authority, and vitality',
    action: 'The solar force illuminates',
    watch: 'Watch for themes of ego, leadership, and self-expression.',
  },
  Moon: {
    theme: 'mind, emotions, and intuition',
    action: 'Lunar energy flows through',
    watch: 'Notice shifts in emotional tone, memory, and instinctive responses.',
  },
  Mars: {
    theme: 'drive, courage, and conflict',
    action: 'Martian energy ignites',
    watch: 'Energy levels and willpower are highlighted — channel ambition constructively.',
  },
  Mercury: {
    theme: 'intellect, communication, and commerce',
    action: 'Mercurial thought quickens through',
    watch: 'Pay attention to how ideas are formed, shared, and negotiated.',
  },
  Jupiter: {
    theme: 'wisdom, dharma, and expansion',
    action: 'Jovian grace expands',
    watch: 'Opportunities for growth, teaching, and higher understanding emerge.',
  },
  Venus: {
    theme: 'relationships, beauty, and pleasure',
    action: 'Venusian magnetism softens',
    watch: 'Matters of love, aesthetics, and values come into focus.',
  },
  Saturn: {
    theme: 'karma, discipline, and time',
    action: 'Saturnine structure is imposed upon',
    watch: 'Delays or responsibilities ask for patience and long-term thinking.',
  },
  Rahu: {
    theme: 'ambition, obsession, and foreign influence',
    action: 'Rahu\'s shadowy hunger amplifies',
    watch: 'Intense desires or unconventional paths may arise — stay grounded.',
  },
  Ketu: {
    theme: 'detachment, past karma, and spirituality',
    action: 'Ketu\'s dissolving energy loosens attachments in',
    watch: 'Spiritual insights and a pull toward simplification are strong themes.',
  },
};

function getPlanetInSignDescription(planet: string, sign: string): string {
  const arch = PLANET_ARCHETYPE[planet];
  const quality = SIGN_QUALITY[sign] ?? 'this sign';
  const element = SIGN_ELEMENT[sign] ?? 'mixed';
  if (!arch) return '';
  return `${arch.action} ${sign} (${element}), the sign of ${quality}. The themes of ${arch.theme} find distinctive expression through this placement's unique quality. ${arch.watch}`;
}

// ─── Planet icon glyphs ────────────────────────────────────────────────────────

const PLANET_ICON: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const TransitsPage: NextPage = () => {
  const [data, setData] = useState<TransitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    setLoading(true);
    fetch(`${apiBase}/api/v1/public/transits/current`)
      .then(r => (r.ok ? r.json() : Promise.reject('fetch failed')))
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Could not load transit data. Please try again.'); setLoading(false); });
  }, []);

  // Sort transits by canonical planet order
  const sortedTransits = data?.transits
    ? [...data.transits].sort(
        (a, b) => PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet)
      )
    : [];

  const formatUpdated = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST';
    } catch {
      return iso;
    }
  };

  return (
    <>
      <Head>
        <title>Planetary Transit Feed · JyotishHardev</title>
        <meta
          name="description"
          content="Live planetary positions of all 9 Jyotish grahas — computed from Swiss Ephemeris. Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu positions updated in real-time."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <PublicNav activePage="transits" />

        <div className="container">
          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">Planetary Transit Feed</h1>
            <p className="hero-sub">Updated in real-time from ephemeris data</p>
            {data?.computed_at && (
              <p className="hero-updated">Last updated: {formatUpdated(data.computed_at)}</p>
            )}
          </div>

          {/* Error */}
          {error && !loading && <div className="error-box">{error}</div>}

          {/* Skeleton */}
          {loading && (
            <div className="planet-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="planet-card skeleton-card">
                  <div className="sk-icon" />
                  <div className="sk-name" />
                  <div className="sk-sign" />
                  <div className="sk-desc" />
                  <div className="sk-desc short" />
                </div>
              ))}
            </div>
          )}

          {/* Transit grid */}
          {!loading && data && (
            <div className="planet-grid">
              {sortedTransits.map(t => (
                <div key={t.planet} className="planet-card">
                  <div className="planet-header">
                    <span className="planet-glyph">{PLANET_ICON[t.planet] ?? '✦'}</span>
                    <div>
                      <div className="planet-name">{t.planet}</div>
                      <div className="planet-sanskrit">{SANSKRIT_NAMES[t.planet] ?? t.planet}</div>
                    </div>
                    {t.is_retrograde && <span className="retro-badge">℞ Retrograde</span>}
                  </div>

                  <div className="planet-position">
                    <span className="planet-sign">{t.sign}</span>
                    <span className="planet-degree">{t.degree.toFixed(2)}°</span>
                  </div>

                  <p className="planet-desc">
                    {getPlanetInSignDescription(t.planet, t.sign)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && data && sortedTransits.length === 0 && (
            <div className="empty-state">No transit data available at this time.</div>
          )}

          {/* CTA */}
          <div className="cta-card">
            <h2 className="cta-heading">How do these transits affect YOUR chart?</h2>
            <p className="cta-body">
              Generic transit positions are just the beginning. Hardev analyses how each planet
              interacts with your personal Lagna, natal planets, and current Dasha period.
            </p>
            <Link href="/signup" className="cta-btn">Get your personalised transit reading →</Link>
            <p className="cta-sub">Free 30-day trial · No credit card needed</p>
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
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 16px 80px;
        }

        .hero {
          text-align: center;
          margin-bottom: 36px;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 34px;
          color: #1b1f4a;
          margin: 0 0 8px;
          line-height: 1.2;
        }

        .hero-sub {
          font-size: 15px;
          color: #6b6b8a;
          margin: 0 0 4px;
        }

        .hero-updated {
          font-size: 12px;
          color: #9b9bb0;
          margin: 0;
        }

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

        .empty-state {
          text-align: center;
          color: #6b6b8a;
          font-size: 15px;
          padding: 40px 0;
        }

        /* Grid */
        .planet-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 32px;
        }

        .planet-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.08);
        }

        .planet-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .planet-glyph {
          font-size: 28px;
          color: #c9a84c;
          line-height: 1;
          flex-shrink: 0;
        }

        .planet-name {
          font-size: 18px;
          font-weight: 700;
          color: #1b1f4a;
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          line-height: 1.2;
        }

        .planet-sanskrit {
          font-size: 12px;
          color: #6b6b8a;
          font-style: italic;
        }

        .retro-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 600;
          color: #b85c00;
          background: #fff3e0;
          border: 1px solid #ffcc80;
          padding: 3px 8px;
          border-radius: 12px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .planet-position {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
        }

        .planet-sign {
          font-size: 16px;
          font-weight: 600;
          color: #1b1f4a;
        }

        .planet-degree {
          font-size: 13px;
          color: #6b6b8a;
        }

        .planet-desc {
          font-size: 13px;
          color: #4a4a6a;
          line-height: 1.6;
          margin: 0;
        }

        /* Skeleton */
        .skeleton-card { opacity: 0.7; }

        .sk-icon {
          width: 28px; height: 28px;
          background: #e8e2d9;
          border-radius: 50%;
          margin-bottom: 8px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .sk-name {
          height: 18px; width: 60%;
          background: #e8e2d9;
          border-radius: 6px;
          margin-bottom: 6px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .sk-sign {
          height: 16px; width: 45%;
          background: #e8e2d9;
          border-radius: 6px;
          margin-bottom: 10px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .sk-desc {
          height: 12px;
          background: #e8e2d9;
          border-radius: 6px;
          margin-bottom: 6px;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .sk-desc.short { width: 70%; }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        /* CTA */
        .cta-card {
          background: #1b1f4a;
          border-radius: 12px;
          padding: 36px 28px;
          color: #ffffff;
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
          color: rgba(255,255,255,0.45);
          margin: 12px 0 0;
        }

        @media (max-width: 720px) {
          .planet-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 26px; }
        }
      `}</style>
    </>
  );
};

export default TransitsPage;
