import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlaceResult {
  formatted_address: string;
  lat: number;
  lng: number;
}

interface FormData {
  name: string;
  pob: string;
  pob_lat: number | null;
  pob_lon: number | null;
  pob_timezone: string;
  pob_timezone_offset: number | null;
  dob_day: string;
  dob_month: string;
  dob_year: string;
  tob_hour: string;
  tob_minute: string;
  tob_ampm: string;
  tob_unknown: boolean;
  tradition: 'parashara' | 'jaimini' | '';
  consent: boolean;
}

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Google Maps loader ───────────────────────────────────────────────────────

let mapsLoaded = false;
let mapsLoading = false;
const mapsCallbacks: Array<() => void> = [];

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (mapsLoaded) { resolve(); return; }
    mapsCallbacks.push(resolve);
    if (mapsLoading) return;
    mapsLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach((cb) => cb());
      mapsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

async function resolveTimezone(lat: number, lng: number, _apiKey: string) {
  try {
    const res = await fetch(
      `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`
    );
    const data = await res.json();
    if (data.currentUtcOffset?.seconds !== undefined) {
      const offsetHours = data.currentUtcOffset.seconds / 3600;
      return { timeZoneId: data.timeZone as string, offsetHours };
    }
  } catch {
    // fall through to UTC
  }
  return { timeZoneId: 'UTC', offsetHours: 0 };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const OnboardingPage: NextPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [computing, setComputing] = useState(false);
  const [planetIdx, setPlanetIdx] = useState(0);
  const [error, setError] = useState('');
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<any>(null);

  const [form, setForm] = useState<FormData>({
    name: '',
    pob: '',
    pob_lat: null,
    pob_lon: null,
    pob_timezone: '',
    pob_timezone_offset: null,
    dob_day: '',
    dob_month: '',
    dob_year: '',
    tob_hour: '12',
    tob_minute: '00',
    tob_ampm: 'PM',
    tob_unknown: false,
    tradition: '',
    consent: false,
  });

  const set = (key: keyof FormData, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // Load Google Maps for step 1
  useEffect(() => {
    if (step !== 1) return;
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;
    if (!key) return;

    loadGoogleMaps(key).then(() => {
      if (!autocompleteRef.current) return;
      const ac = new (window as any).google.maps.places.Autocomplete(
        autocompleteRef.current,
        { types: ['(cities)'] }
      );
      autocompleteInstance.current = ac;
      ac.addListener('place_changed', async () => {
        const place = ac.getPlace();
        if (!place.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY!;
        const tz = await resolveTimezone(lat, lng, apiKey);
        setForm((prev) => ({
          ...prev,
          pob: place.formatted_address ?? autocompleteRef.current?.value ?? '',
          pob_lat: lat,
          pob_lon: lng,
          pob_timezone: tz.timeZoneId,
          pob_timezone_offset: tz.offsetHours,
        }));
      });
    });
  }, [step]);

  // Planet animation during computing
  useEffect(() => {
    if (!computing) return;
    const interval = setInterval(() => {
      setPlanetIdx((i) => {
        if (i >= PLANETS.length - 1) { clearInterval(interval); return i; }
        return i + 1;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [computing]);

  const canProceedStep1 = form.name.trim().length > 0 && form.pob_lat !== null;
  const canProceedStep2 = form.dob_day && form.dob_month && form.dob_year;
  const canProceedStep3 = form.tob_unknown || (form.tob_hour && form.tob_minute);
  const canProceedStep4 = form.tradition !== '';

  const handleSubmit = async () => {
    setError('');
    setComputing(true);
    setPlanetIdx(0);

    // Build DOB + TOB strings
    const month = MONTHS.indexOf(form.dob_month) + 1;
    const dobStr = `${form.dob_year}-${String(month).padStart(2, '0')}-${String(form.dob_day).padStart(2, '0')}`;

    let tobStr = '12:00:00';
    if (!form.tob_unknown) {
      let hour = parseInt(form.tob_hour, 10);
      if (form.tob_ampm === 'PM' && hour !== 12) hour += 12;
      if (form.tob_ampm === 'AM' && hour === 12) hour = 0;
      tobStr = `${String(hour).padStart(2, '0')}:${form.tob_minute}:00`;
    }

    // Wait for animation (at least 3s)
    const minDelay = new Promise((r) => setTimeout(r, 3000));

    try {
      const apiCall = api.createProfile({
        name: form.name.trim(),
        pob: form.pob,
        pob_lat: form.pob_lat,
        pob_lon: form.pob_lon,
        pob_timezone: form.pob_timezone,
        pob_timezone_offset: form.pob_timezone_offset,
        dob: dobStr,
        tob: tobStr,
        tob_unknown: form.tob_unknown,
        tradition: form.tradition,
        consent_given: true,
      });

      await Promise.all([apiCall, minDelay]);
      router.push('/dashboard');
    } catch (err: any) {
      setComputing(false);
      setError(err?.detail ?? 'Failed to create your profile. Please try again.');
    }
  };

  const TOTAL_STEPS = 5;

  // ── Render computing screen ────────────────────────────────────────────────
  if (computing) {
    return (
      <main className="page">
        <div className="computing-card">
          <div className="computing-icon" aria-hidden="true">⊕</div>
          <h2 className="computing-title">Computing your Kundali</h2>
          <p className="computing-sub">Placing planets in your birth chart…</p>
          <div className="planet-list" role="status" aria-live="polite">
            {PLANETS.map((planet, idx) => (
              <div
                key={planet}
                className={`planet-row${idx <= planetIdx ? ' planet-row--visible' : ''}`}
              >
                <span className="planet-dot" aria-hidden="true">◉</span>
                <span>{planet}</span>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #1b1f4a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
          }
          .computing-card {
            text-align: center;
            color: #ffffff;
          }
          .computing-icon {
            font-size: 48px;
            color: #c9a84c;
            margin-bottom: 20px;
          }
          .computing-title {
            font-family: 'Tiro Devanagari Hindi', Georgia, serif;
            font-size: 28px;
            margin-bottom: 8px;
          }
          .computing-sub {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 32px;
          }
          .planet-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 180px;
          }
          .planet-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
            opacity: 0;
            transform: translateY(6px);
            transition: opacity 300ms ease, transform 300ms ease;
            color: rgba(255, 255, 255, 0.4);
          }
          .planet-row--visible {
            opacity: 1;
            transform: translateY(0);
            color: #ffffff;
          }
          .planet-dot {
            color: #c9a84c;
            font-size: 12px;
          }
        `}</style>
      </main>
    );
  }

  // ── Step renderer ──────────────────────────────────────────────────────────
  const years: number[] = [];
  for (let y = new Date().getFullYear(); y >= 1930; y--) years.push(y);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <>
      <Head>
        <title>Set up your chart · JyotishHardev</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="page">
        <div className="container">
          {/* Progress */}
          <div className="progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
            <p className="progress-label">Step {step} of {TOTAL_STEPS}</p>
            <div className="progress-dots">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`progress-dot${i + 1 <= step ? ' progress-dot--active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Place of Birth */}
          {step === 1 && (
            <div className="step-card">
              <h1 className="step-title">Where were you born?</h1>
              <p className="step-micro">Where you were born determines your rising sign</p>

              <div className="field">
                <label htmlFor="name" className="label">Your name</label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>

              <div className="field">
                <label htmlFor="pob" className="label">City of birth</label>
                <input
                  id="pob"
                  ref={autocompleteRef}
                  type="text"
                  className="input"
                  placeholder="Start typing a city…"
                  defaultValue={form.pob}
                  autoComplete="off"
                />
                {form.pob_lat !== null && (
                  <p className="field-hint">
                    ✓ {form.pob} · Timezone: {form.pob_timezone}
                  </p>
                )}
              </div>

              <button
                className="next-btn"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Date of Birth */}
          {step === 2 && (
            <div className="step-card">
              <h1 className="step-title">When were you born?</h1>
              <p className="step-micro">Your birth date shapes your planetary periods</p>

              <div className="dob-row">
                <div className="field field--third">
                  <label htmlFor="dob_day" className="label">Day</label>
                  <select
                    id="dob_day"
                    className="select"
                    value={form.dob_day}
                    onChange={(e) => set('dob_day', e.target.value)}
                  >
                    <option value="">—</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="field field--third">
                  <label htmlFor="dob_month" className="label">Month</label>
                  <select
                    id="dob_month"
                    className="select"
                    value={form.dob_month}
                    onChange={(e) => set('dob_month', e.target.value)}
                  >
                    <option value="">—</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="field field--third">
                  <label htmlFor="dob_year" className="label">Year</label>
                  <select
                    id="dob_year"
                    className="select"
                    value={form.dob_year}
                    onChange={(e) => set('dob_year', e.target.value)}
                  >
                    <option value="">—</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="nav-row">
                <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="next-btn next-btn--inline" disabled={!canProceedStep2} onClick={() => setStep(3)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Time of Birth */}
          {step === 3 && (
            <div className="step-card">
              <h1 className="step-title">What time were you born?</h1>
              <p className="step-micro">
                Don&apos;t know your exact time? We&apos;ll use noon and note the uncertainty.
              </p>

              {!form.tob_unknown && (
                <div className="tob-row">
                  <div className="field field--quarter">
                    <label htmlFor="tob_hour" className="label">Hour</label>
                    <select
                      id="tob_hour"
                      className="select"
                      value={form.tob_hour}
                      onChange={(e) => set('tob_hour', e.target.value)}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field field--quarter">
                    <label htmlFor="tob_minute" className="label">Minute</label>
                    <select
                      id="tob_minute"
                      className="select"
                      value={form.tob_minute}
                      onChange={(e) => set('tob_minute', e.target.value)}
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field field--quarter">
                    <label htmlFor="tob_ampm" className="label">AM/PM</label>
                    <select
                      id="tob_ampm"
                      className="select"
                      value={form.tob_ampm}
                      onChange={(e) => set('tob_ampm', e.target.value)}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              )}

              {form.tob_unknown && (
                <div className="unknown-note">
                  We&apos;ll use 12:00 PM (noon) as a default. Your rising sign may be approximate.
                </div>
              )}

              <button
                className="secondary-btn"
                onClick={() => set('tob_unknown', !form.tob_unknown)}
              >
                {form.tob_unknown
                  ? '← I know my birth time'
                  : "I don't know my birth time"}
              </button>

              <div className="nav-row">
                <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
                <button className="next-btn next-btn--inline" disabled={!canProceedStep3} onClick={() => setStep(4)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Tradition */}
          {step === 4 && (
            <div className="step-card">
              <h1 className="step-title">Choose your tradition</h1>
              <p className="step-warning">
                ⚠ This choice is permanent. You won&apos;t be able to change it later.
              </p>

              <div className="tradition-cards">
                <button
                  className={`tradition-card${form.tradition === 'parashara' ? ' tradition-card--active' : ''}`}
                  onClick={() => set('tradition', 'parashara')}
                  type="button"
                >
                  <div className="tradition-name">Parashara</div>
                  <div className="tradition-badge">Recommended</div>
                  <div className="tradition-desc">
                    The most widely practiced system — your astrologer likely uses this
                  </div>
                </button>

                <button
                  className={`tradition-card${form.tradition === 'jaimini' ? ' tradition-card--active' : ''}`}
                  onClick={() => set('tradition', 'jaimini')}
                  type="button"
                >
                  <div className="tradition-name">Jaimini</div>
                  <div className="tradition-badge tradition-badge--advanced">Advanced</div>
                  <div className="tradition-desc">
                    An advanced system — ask your astrologer before choosing
                  </div>
                </button>
              </div>

              <div className="nav-row">
                <button className="back-btn" onClick={() => setStep(3)}>← Back</button>
                <button className="next-btn next-btn--inline" disabled={!canProceedStep4} onClick={() => setStep(5)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Consent */}
          {step === 5 && (
            <div className="step-card">
              <h1 className="step-title">Before we begin</h1>
              <p className="step-micro">We need your consent to store your data</p>

              <div className="consent-bullets">
                <div className="consent-item">
                  <span className="consent-bullet">◉</span>
                  <span>Your birth details (date, time, place) are stored securely and used only to generate your chart.</span>
                </div>
                <div className="consent-item">
                  <span className="consent-bullet">◉</span>
                  <span>Your conversation history is saved to give Hardev memory across sessions.</span>
                </div>
                <div className="consent-item">
                  <span className="consent-bullet">◉</span>
                  <span>Anonymized prediction accuracy data may be used to improve the service. Your personal data is never shared.</span>
                </div>
              </div>

              <label className="consent-label">
                <input
                  type="checkbox"
                  className="consent-checkbox"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                />
                <span>
                  I consent to JyotishHardev storing my birth details and reading
                  history as described above.{' '}
                  <Link href="/privacy" className="privacy-link">
                    Privacy policy
                  </Link>
                </span>
              </label>

              {error && (
                <div className="error-box" role="alert">
                  {error}
                </div>
              )}

              <div className="nav-row">
                <button className="back-btn" onClick={() => setStep(4)}>← Back</button>
                <button
                  className="next-btn next-btn--inline next-btn--gold"
                  disabled={!form.consent}
                  onClick={handleSubmit}
                >
                  Generate my Kundali ✦
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f0e8;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 32px 16px 60px;
        }

        .container {
          width: 100%;
          max-width: 520px;
        }

        /* Progress */
        .progress {
          text-align: center;
          margin-bottom: 28px;
        }

        .progress-label {
          font-size: 13px;
          color: #6b6b8a;
          margin-bottom: 10px;
        }

        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d9d3c7;
          transition: background 200ms ease;
        }

        .progress-dot--active {
          background: #1b1f4a;
        }

        /* Card */
        .step-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 36px 28px;
          box-shadow: 0 4px 16px rgba(27, 31, 74, 0.08);
        }

        .step-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 26px;
          color: #1b1f4a;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .step-micro {
          font-size: 14px;
          color: #6b6b8a;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        /* Fields */
        .field {
          margin-bottom: 20px;
        }

        .field--third {
          flex: 1;
        }

        .field--quarter {
          flex: 1;
        }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .input,
        .select {
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
          appearance: none;
          -webkit-appearance: none;
        }

        .input:focus,
        .select:focus {
          border-color: #1b1f4a;
          background: #ffffff;
        }

        .field-hint {
          font-size: 12px;
          color: #1b7a3a;
          margin-top: 6px;
        }

        /* DOB row */
        .dob-row {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        /* TOB row */
        .tob-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .unknown-note {
          background: #f5f0e8;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          color: #6b6b8a;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .secondary-btn {
          background: transparent;
          color: #6b6b8a;
          border: 1.5px solid #d9d3c7;
          border-radius: 24px;
          padding: 10px 18px;
          font-size: 14px;
          cursor: pointer;
          display: block;
          margin-bottom: 24px;
          min-height: 44px;
          transition: border-color 150ms ease, color 150ms ease;
        }

        .secondary-btn:hover {
          border-color: #1b1f4a;
          color: #1b1f4a;
        }

        /* Tradition cards */
        .step-warning {
          font-size: 13px;
          color: #a0522d;
          background: #fff8f0;
          border: 1px solid #f5d9b8;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .tradition-cards {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .tradition-card {
          flex: 1;
          background: #f9f7f2;
          border: 2px solid #e0dbd0;
          border-radius: 12px;
          padding: 20px 14px;
          text-align: left;
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease;
          min-height: 44px;
        }

        .tradition-card--active {
          border-color: #1b1f4a;
          background: #f0edf8;
        }

        .tradition-name {
          font-size: 16px;
          font-weight: 700;
          color: #1b1f4a;
          margin-bottom: 6px;
        }

        .tradition-badge {
          display: inline-block;
          background: #1b1f4a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .tradition-badge--advanced {
          background: #6b6b8a;
        }

        .tradition-desc {
          font-size: 13px;
          color: #6b6b8a;
          line-height: 1.5;
        }

        /* Consent */
        .consent-bullets {
          background: #f9f7f2;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .consent-item {
          display: flex;
          gap: 10px;
          font-size: 14px;
          color: #1a1a2e;
          line-height: 1.5;
        }

        .consent-bullet {
          color: #c9a84c;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .consent-label {
          display: flex;
          gap: 12px;
          font-size: 14px;
          color: #1a1a2e;
          line-height: 1.5;
          margin-bottom: 28px;
          cursor: pointer;
          align-items: flex-start;
        }

        .consent-checkbox {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 2px;
          accent-color: #1b1f4a;
        }

        .privacy-link {
          color: #1b1f4a;
          text-decoration: underline;
        }

        /* Navigation */
        .nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .back-btn {
          background: transparent;
          color: #6b6b8a;
          border: none;
          font-size: 14px;
          padding: 10px 0;
          cursor: pointer;
          min-height: 44px;
        }

        .back-btn:hover {
          color: #1b1f4a;
        }

        .next-btn {
          display: block;
          width: 100%;
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 600;
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          transition: opacity 150ms ease;
          min-height: 52px;
          margin-top: 8px;
        }

        .next-btn--inline {
          width: auto;
          flex: 0 0 auto;
          margin-top: 0;
          padding: 12px 24px;
        }

        .next-btn--gold {
          background: #1b1f4a;
        }

        .next-btn:hover:not(:disabled) {
          opacity: 0.88;
        }

        .next-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Error */
        .error-box {
          background: #fff5f5;
          border: 1.5px solid #ffb3b3;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          color: #c0392b;
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
};

export default OnboardingPage;
