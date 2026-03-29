/**
 * Public Kundli Generator — /kundli
 * No login required. Computes chart via backend, displays results,
 * shows CTA to sign up for full reading.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlanetPosition {
  sign: string;
  degree: number;
}

interface KundliResult {
  name: string;
  lagna: string;
  moon_sign: string;
  nakshatra: string;
  current_dasha: string;
  tob_unknown: boolean;
  positions: Record<string, PlanetPosition>;
}

// ─── South Indian chart layout ───────────────────────────────────────────────

const SIGN_GRID: Array<{ sign: string; row: number; col: number }> = [
  { sign: 'Meena',      row: 0, col: 0 },
  { sign: 'Mesha',      row: 0, col: 1 },
  { sign: 'Vrishabha',  row: 0, col: 2 },
  { sign: 'Mithuna',    row: 0, col: 3 },
  { sign: 'Kumbha',     row: 1, col: 0 },
  { sign: 'Karka',      row: 1, col: 3 },
  { sign: 'Makara',     row: 2, col: 0 },
  { sign: 'Simha',      row: 2, col: 3 },
  { sign: 'Dhanu',      row: 3, col: 0 },
  { sign: 'Vrishchika', row: 3, col: 1 },
  { sign: 'Tula',       row: 3, col: 2 },
  { sign: 'Kanya',      row: 3, col: 3 },
];

const SIGN_ABBREV: Record<string, string> = {
  Mesha: 'Ari', Vrishabha: 'Tau', Mithuna: 'Gem', Karka: 'Can',
  Simha: 'Leo', Kanya: 'Vir', Tula: 'Lib', Vrishchika: 'Sco',
  Dhanu: 'Sag', Makara: 'Cap', Kumbha: 'Aqu', Meena: 'Pis',
};

const PLANET_ABBREV: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Bu',
  Jupiter: 'Gu', Venus: 'Sk', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

function KundaliChart({ lagna, positions }: { lagna: string; positions: Record<string, PlanetPosition> }) {
  // Map sign → planets in that sign
  const signPlanets: Record<string, string[]> = {};
  Object.entries(positions).forEach(([planet, pos]) => {
    if (!signPlanets[pos.sign]) signPlanets[pos.sign] = [];
    signPlanets[pos.sign].push(PLANET_ABBREV[planet] ?? planet.slice(0, 2));
  });

  return (
    <div className="chart-grid" role="img" aria-label="South Indian Kundali chart">
      {SIGN_GRID.map(({ sign, row, col }) => {
        const isLagna = sign === lagna;
        const planets = signPlanets[sign] ?? [];
        return (
          <div
            key={sign}
            className={`chart-cell ${isLagna ? 'lagna-cell' : ''}`}
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
            title={sign}
          >
            {isLagna && <span className="lagna-marker">Lag</span>}
            <span className="cell-sign">{SIGN_ABBREV[sign]}</span>
            {planets.length > 0 && (
              <span className="cell-planets">{planets.join(' ')}</span>
            )}
          </div>
        );
      })}
      {/* Center cells — empty (title area) */}
      {[[1,1],[1,2],[2,1],[2,2]].map(([r,c]) => (
        <div key={`c${r}${c}`} className="chart-cell center-cell"
          style={{ gridRow: r + 1, gridColumn: c + 1 }} />
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    google: any;
    initPlaces: () => void;
  }
}

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const KundliPage: NextPage = () => {
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM'|'PM'>('AM');
  const [tobUnknown, setTobUnknown] = useState(false);
  const [pob, setPob] = useState('');
  const [pobLat, setPobLat] = useState<number | null>(null);
  const [pobLon, setPobLon] = useState<number | null>(null);
  const [pobTzOffset, setPobTzOffset] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KundliResult | null>(null);
  const [error, setError] = useState('');

  const pobRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Load Google Places
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;
    if (!key || document.getElementById('gmaps-script')) return;

    window.initPlaces = () => {
      if (!pobRef.current) return;
      autocompleteRef.current = new window.google.maps.places.Autocomplete(pobRef.current, {
        types: ['(cities)'],
      });
      autocompleteRef.current.addListener('place_changed', async () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setPob(place.formatted_address ?? place.name ?? '');
        setPobLat(lat);
        setPobLon(lng);
        // Resolve timezone
        const ts = Math.floor(Date.now() / 1000);
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${key}`
          );
          const tz = await res.json();
          if (tz.status === 'OK') {
            setPobTzOffset((tz.rawOffset + tz.dstOffset) / 3600);
          } else {
            // Timezone API not enabled or quota exceeded — fall back to UTC
            setPobTzOffset(0);
          }
        } catch {
          setPobTzOffset(0);
        }
      });
    };

    const script = document.createElement('script');
    script.id = 'gmaps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initPlaces`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const canSubmit =
    name.trim() &&
    day && month && year &&
    pob && pobLat !== null && pobLon !== null && pobTzOffset !== null &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    const dobYear = parseInt(year);
    const dobMonth = months.indexOf(month) + 1;
    const dobDay = parseInt(day);

    let tob = null;
    if (!tobUnknown) {
      let h = parseInt(hour);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      tob = `${String(h).padStart(2,'0')}:${minute}:00`;
    }

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/public/kundli`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          dob: `${dobYear}-${String(dobMonth).padStart(2,'0')}-${String(dobDay).padStart(2,'0')}`,
          tob,
          tob_unknown: tobUnknown,
          pob,
          pob_lat: pobLat,
          pob_lon: pobLon,
          pob_timezone_offset: pobTzOffset,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Chart computation failed');
      }

      const data: KundliResult = await res.json();
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 2010 - 1930 + 1 }, (_, i) => 2010 - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <>
      <Head>
        <title>Free Kundli Generator · JyotishHardev</title>
        <meta
          name="description"
          content="Generate your Vedic birth chart (Kundli) instantly. Get your Lagna, Rashi, Nakshatra and planetary positions — free, no account needed."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="page">
        {/* Nav */}
        <header className="nav">
          <Link href="/" className="brand">
            <span className="brand-icon">⊕</span>
            <span className="brand-name">JyotishHardev</span>
          </Link>
          <Link href="/login" className="nav-link">Sign in</Link>
        </header>

        <div className="container">
          <div className="page-header">
            <h1 className="heading">Free Kundli Generator</h1>
            <p className="subheading">
              Enter your birth details to get your Vedic birth chart — lagna, rashi, nakshatra, and planetary positions.
            </p>
          </div>

          {!result ? (
            <form className="form-card" onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div className="field">
                <label className="label" htmlFor="name">Full name</label>
                <input
                  id="name"
                  className="input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  autoFocus
                />
              </div>

              {/* Place of birth */}
              <div className="field">
                <label className="label" htmlFor="pob">Place of birth</label>
                <input
                  id="pob"
                  ref={pobRef}
                  className="input"
                  type="text"
                  value={pob}
                  onChange={e => {
                    setPob(e.target.value);
                    setPobLat(null);
                    setPobLon(null);
                    setPobTzOffset(null);
                  }}
                  placeholder="Start typing a city..."
                  required
                />
                <p className="field-hint">Where you were born determines your rising sign</p>
              </div>

              {/* Date of birth */}
              <div className="field">
                <label className="label">Date of birth</label>
                <div className="dob-row">
                  <select className="select" value={day} onChange={e => setDay(e.target.value)} required>
                    <option value="">Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="select" value={month} onChange={e => setMonth(e.target.value)} required>
                    <option value="">Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="select" value={year} onChange={e => setYear(e.target.value)} required>
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Time of birth */}
              <div className="field">
                <label className="label">Time of birth</label>
                {!tobUnknown ? (
                  <div className="tob-row">
                    <select className="select" value={hour} onChange={e => setHour(e.target.value)}>
                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="colon">:</span>
                    <select className="select" value={minute} onChange={e => setMinute(e.target.value)}>
                      {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="select ampm" value={ampm} onChange={e => setAmpm(e.target.value as 'AM'|'PM')}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="unknown-tob-btn"
                  onClick={() => setTobUnknown(v => !v)}
                >
                  {tobUnknown ? '✓ Using noon chart — tap to enter time' : "I don't know my birth time"}
                </button>
                {tobUnknown && (
                  <p className="field-hint">We'll use noon as your birth time and note the uncertainty.</p>
                )}
              </div>

              {error && <div className="error-box" role="alert">{error}</div>}

              <button
                type="submit"
                className="submit-btn"
                disabled={!canSubmit}
              >
                {loading ? 'Computing your chart…' : 'Generate Kundli →'}
              </button>
            </form>
          ) : (
            <div className="results">
              {/* Header */}
              <div className="results-header">
                <h2 className="results-name">{result.name}&apos;s Kundli</h2>
                {result.tob_unknown && (
                  <p className="tob-notice">⚠ Birth time unknown — noon chart used. Lagna may be inaccurate.</p>
                )}
              </div>

              {/* Key facts */}
              <div className="facts-grid">
                <div className="fact-card">
                  <div className="fact-label">Lagna (Ascendant)</div>
                  <div className="fact-value">{result.lagna}</div>
                </div>
                <div className="fact-card">
                  <div className="fact-label">Rashi (Moon Sign)</div>
                  <div className="fact-value">{result.moon_sign}</div>
                </div>
                <div className="fact-card">
                  <div className="fact-label">Nakshatra</div>
                  <div className="fact-value">{result.nakshatra}</div>
                </div>
                <div className="fact-card">
                  <div className="fact-label">Current Dasha</div>
                  <div className="fact-value">{result.current_dasha}</div>
                </div>
              </div>

              {/* South Indian chart */}
              <div className="chart-section">
                <h3 className="section-title">Birth Chart</h3>
                <KundaliChart lagna={result.lagna} positions={result.positions} />
                <p className="chart-hint">South Indian style · Lag = Lagna (Ascendant)</p>
              </div>

              {/* Planet positions table */}
              <div className="planets-section">
                <h3 className="section-title">Planetary Positions</h3>
                <div className="planets-table">
                  {Object.entries(result.positions).map(([planet, pos]) => (
                    <div key={planet} className="planet-row">
                      <span className="planet-name">{planet}</span>
                      <span className="planet-sign">{pos.sign}</span>
                      <span className="planet-degree">{pos.degree.toFixed(2)}°</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="cta-section">
                <div className="cta-card">
                  <div className="cta-icon">🔮</div>
                  <h3 className="cta-heading">Your full interpretation is waiting</h3>
                  <p className="cta-body">
                    Get milestone predictions for the next 20 years, a persistent astrologer who
                    remembers every session, and a track record that builds over time.
                  </p>
                  <Link href="/signup" className="cta-btn">
                    Get your full reading — free →
                  </Link>
                  <p className="cta-sub">30-day trial · No credit card needed</p>
                </div>
              </div>

              <button
                className="try-again-btn"
                onClick={() => { setResult(null); setError(''); }}
              >
                ← Generate another Kundli
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f0e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1a1a2e;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #1b1f4a;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .brand-icon {
          font-size: 22px;
          color: #c9a84c;
        }

        .brand-name {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
        }

        .nav-link {
          font-size: 14px;
          color: #c9a84c;
          text-decoration: none;
          font-weight: 500;
        }

        .nav-link:hover { text-decoration: underline; }

        .container {
          max-width: 640px;
          margin: 0 auto;
          padding: 32px 16px 64px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .heading {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 32px;
          color: #1b1f4a;
          margin-bottom: 10px;
        }

        .subheading {
          font-size: 15px;
          color: #6b6b8a;
          line-height: 1.6;
        }

        /* Form */
        .form-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 12px rgba(27,31,74,0.08);
        }

        .field {
          margin-bottom: 24px;
        }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }

        .input {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #e0dbd0;
          border-radius: 8px;
          background: #f9f7f2;
          color: #1a1a2e;
          outline: none;
          transition: border-color 150ms;
          min-height: 44px;
          box-sizing: border-box;
        }

        .input:focus {
          border-color: #1b1f4a;
          background: #fff;
        }

        .field-hint {
          margin-top: 6px;
          font-size: 12px;
          color: #6b6b8a;
        }

        .dob-row {
          display: flex;
          gap: 8px;
        }

        .tob-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .select {
          flex: 1;
          padding: 11px 8px;
          font-size: 14px;
          border: 1.5px solid #e0dbd0;
          border-radius: 8px;
          background: #f9f7f2;
          color: #1a1a2e;
          min-height: 44px;
          outline: none;
          cursor: pointer;
        }

        .select:focus { border-color: #1b1f4a; }

        .ampm { flex: 0.7; }

        .colon {
          font-size: 18px;
          font-weight: 600;
          color: #6b6b8a;
        }

        .unknown-tob-btn {
          background: none;
          border: 1.5px solid #c9a84c;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 13px;
          color: #1b1f4a;
          cursor: pointer;
          font-weight: 500;
          transition: background 150ms;
          min-height: 44px;
        }

        .unknown-tob-btn:hover { background: #f5f0e8; }

        .error-box {
          background: #fff5f5;
          border: 1.5px solid #ffb3b3;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          color: #c0392b;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px 20px;
          font-size: 16px;
          font-weight: 600;
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          transition: opacity 150ms;
          min-height: 52px;
        }

        .submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Results */
        .results {}

        .results-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .results-name {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 28px;
          color: #1b1f4a;
          margin-bottom: 6px;
        }

        .tob-notice {
          font-size: 13px;
          color: #6b6b8a;
          background: #fff8e1;
          border-radius: 8px;
          padding: 8px 12px;
          display: inline-block;
        }

        .facts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
        }

        .fact-card {
          background: #ffffff;
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.07);
          text-align: center;
        }

        .fact-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b6b8a;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .fact-value {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 20px;
          color: #1b1f4a;
          font-weight: 600;
        }

        /* Chart */
        .chart-section {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.07);
        }

        .section-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 17px;
          color: #1b1f4a;
          margin-bottom: 16px;
        }

        :global(.chart-grid) {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
          border: 2px solid #1b1f4a;
          border-radius: 4px;
          overflow: hidden;
          aspect-ratio: 1;
          width: 100%;
          max-width: 320px;
          margin: 0 auto 10px;
        }

        :global(.chart-cell) {
          border: 1px solid #c5bfb5;
          padding: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60px;
          background: #faf8f4;
          position: relative;
        }

        :global(.lagna-cell) {
          background: #f0ecff;
          border-color: #1b1f4a;
        }

        :global(.center-cell) {
          background: #f5f0e8;
        }

        :global(.lagna-marker) {
          font-size: 9px;
          font-weight: 700;
          color: #1b1f4a;
          background: #c9a84c;
          border-radius: 3px;
          padding: 1px 4px;
          margin-bottom: 2px;
        }

        :global(.cell-sign) {
          font-size: 10px;
          color: #6b6b8a;
          font-weight: 500;
        }

        :global(.cell-planets) {
          font-size: 11px;
          font-weight: 700;
          color: #1b1f4a;
          text-align: center;
          line-height: 1.3;
          margin-top: 2px;
        }

        .chart-hint {
          font-size: 11px;
          color: #6b6b8a;
          text-align: center;
          margin-top: 8px;
        }

        /* Planets table */
        .planets-section {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.07);
        }

        .planets-table {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .planet-row {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0ece4;
        }

        .planet-row:last-child { border-bottom: none; }

        .planet-name {
          flex: 1;
          font-weight: 600;
          font-size: 14px;
          color: #1a1a2e;
        }

        .planet-sign {
          flex: 1;
          font-size: 14px;
          color: #1b1f4a;
          font-weight: 500;
        }

        .planet-degree {
          font-size: 13px;
          color: #6b6b8a;
          font-family: monospace;
        }

        /* CTA */
        .cta-section {
          margin-bottom: 20px;
        }

        .cta-card {
          background: #1b1f4a;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(27,31,74,0.2);
        }

        .cta-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .cta-heading {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 22px;
          color: #ffffff;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .cta-body {
          font-size: 14px;
          color: #b0b4d0;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .cta-btn {
          display: inline-block;
          background: #c9a84c;
          color: #1b1f4a;
          text-decoration: none;
          border-radius: 24px;
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 700;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
          transition: opacity 150ms;
          min-height: 52px;
          line-height: 1.5;
        }

        .cta-btn:hover { opacity: 0.9; }

        .cta-sub {
          margin-top: 10px;
          font-size: 12px;
          color: #8888aa;
        }

        .try-again-btn {
          background: none;
          border: none;
          color: #6b6b8a;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 0;
          text-decoration: underline;
          display: block;
          margin: 0 auto;
        }

        @media (max-width: 480px) {
          .facts-grid { grid-template-columns: 1fr 1fr; }
          .form-card { padding: 24px 16px; }
        }
      `}</style>
    </>
  );
};

export default KundliPage;
