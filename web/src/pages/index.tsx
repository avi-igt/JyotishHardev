/**
 * Homepage — free Kundli generator, no login required.
 * Computes chart instantly, shows static reading, and offers an AI reading via Claude.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import PublicNav from '@/components/PublicNav';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Static Vedic interpretation tables ──────────────────────────────────────

const LAGNA_DATA: Record<string, {
  traits: string[];
  career: string;
  health: string;
  finances: string;
  family: string;
}> = {
  Mesha:      { traits: ['Courageous', 'Energetic', 'Pioneering', 'Impulsive'], career: 'Suited for leadership, military, sports, engineering, and surgery. You thrive in roles requiring initiative and quick decisions.', health: 'Prone to headaches, fevers, and inflammation. Guard against accidents and injuries to the head and face.', finances: 'Earn well but spend impulsively. Financial stability comes through discipline. Avoid speculative risks.', family: 'Protective and fiercely loyal. You lead the family but must temper impatience. Spouse brings stability.' },
  Vrishabha:  { traits: ['Patient', 'Sensual', 'Determined', 'Comfort-loving'], career: 'Drawn to finance, arts, music, hospitality, and beauty industries. You build lasting value patiently.', health: 'Sensitive throat and neck. Watch for thyroid issues, weight gain, and sluggish metabolism.', finances: 'Strong financial instincts. You accumulate wealth steadily but enjoy luxuries. Investments in land and assets favour you.', family: 'Devoted partner and parent. You create a warm, stable home. Can be possessive — trust is important.' },
  Mithuna:    { traits: ['Intellectual', 'Adaptable', 'Witty', 'Restless'], career: 'Excel in communication, writing, teaching, trading, IT, and media. Your versatility opens many doors.', health: 'Lungs, shoulders, and nervous system need care. Avoid anxiety and over-stimulation.', finances: 'Income from multiple sources. Variable earnings — discipline helps stabilise. Good at financial negotiations.', family: 'Fun and communicative partner. You need mental stimulation in relationships. Two sides to your nature can confuse loved ones.' },
  Karka:      { traits: ['Intuitive', 'Nurturing', 'Emotional', 'Protective'], career: 'Natural fit for healthcare, hospitality, real estate, psychology, and social work.', health: 'Digestive system and chest are sensitive. Emotional stress manifests physically — manage anxiety.', finances: 'Finances fluctuate like the Moon. Strong savings instinct. Real estate investments are particularly favourable.', family: 'Family is everything to you. Deeply attached to home and mother. Excellent parent — sometimes overprotective.' },
  Simha:      { traits: ['Confident', 'Generous', 'Dramatic', 'Proud'], career: 'Born for leadership, politics, entertainment, management, and gold or luxury trade.', health: 'Heart and spine need attention. Avoid overexertion. Regular exercise and stress management are essential.', finances: 'Generous spender with a taste for the good life. Wealth comes through status and authority. Avoid ego-driven risks.', family: 'Loyal and loving, you need admiration from family. You are the pillar of the household and take great pride in your children.' },
  Kanya:      { traits: ['Analytical', 'Practical', 'Perfectionist', 'Service-oriented'], career: 'Thrives in medicine, accounting, writing, analysis, and service professions. Detail is your strength.', health: 'Digestive system and intestines are the weak point. Worry and over-analysis affect gut health.', finances: 'Careful and methodical with money. Excellent at saving. Avoid over-analysis paralysing investment decisions.', family: 'Devoted but critical. You show love through service. Learning to express affection openly strengthens relationships.' },
  Tula:       { traits: ['Diplomatic', 'Charming', 'Fair-minded', 'Indecisive'], career: 'Law, diplomacy, design, fashion, consultancy, and partnership businesses suit you perfectly.', health: 'Kidneys and lower back need care. Balance work and rest to avoid adrenal fatigue.', finances: 'Good fortune through partnerships. You weigh decisions carefully — avoid prolonged indecision on investments.', family: 'Harmony-seeking partner. You make a gracious host and fair parent. Conflict avoidance can become an issue — speak up.' },
  Vrishchika: { traits: ['Intense', 'Determined', 'Perceptive', 'Secretive'], career: 'Research, intelligence, medicine, finance, psychology, and transformative work call to you.', health: 'Reproductive organs and elimination system are sensitive. Emotional intensity can create chronic tension.', finances: 'Strong ability to recover from financial setbacks. Gains through inheritance, insurance, or joint resources possible.', family: 'Fiercely loyal but deeply private. You love intensely and expect the same. Transformation defines your family journey.' },
  Dhanu:      { traits: ['Philosophical', 'Optimistic', 'Adventurous', 'Direct'], career: 'Academia, law, religion, travel, publishing, and higher education are natural domains.', health: 'Hips, thighs, and liver need attention. Guard against excess — food, drink, and overindulgence.', finances: 'Fortune improves after 30. Overseas connections and higher learning bring financial rewards. Generous to a fault.', family: 'Freedom-loving partner who needs space. You are the optimistic, adventurous parent. Relationships flourish with shared ideals.' },
  Makara:     { traits: ['Ambitious', 'Disciplined', 'Patient', 'Reserved'], career: 'Government, administration, engineering, mining, and long-term institutional careers reward your discipline.', health: 'Bones, joints, and knees are vulnerable. Skin conditions possible. Adequate rest prevents burnout.', finances: 'Slow and steady accumulation. Strong financial discipline brings lasting wealth after middle age. Land and property favour you.', family: 'Responsible and dutiful. Career demands can create distance — consciously invest time in family. Loyal long-term partner.' },
  Kumbha:     { traits: ['Humanitarian', 'Independent', 'Unconventional', 'Visionary'], career: 'Technology, social reform, astrology, science, and unconventional careers suit your forward-thinking nature.', health: 'Circulation, ankles, and calves need care. Avoid sedentary habits and isolation.', finances: 'Irregular income in youth, stability later. Gains from groups, networks, and innovative ventures.', family: 'Committed but need independence. You are the free-thinking, modern parent. Friends and family blend naturally in your world.' },
  Meena:      { traits: ['Compassionate', 'Intuitive', 'Spiritual', 'Dreamy'], career: 'Medicine, arts, spirituality, charity, filmmaking, and healing professions align with your empathetic nature.', health: 'Feet and lymphatic system need care. Susceptible to infections and psychosomatic ailments. Sleep is healing.', finances: 'Variable finances — spiritual detachment to money can be a double-edged sword. Charitable giving is natural and brings blessings.', family: 'Selfless and giving partner and parent. Boundaries are important — you absorb family stress deeply. Choose partner with practical strengths.' },
};

const NAKSHATRA_LUCKY: Record<string, { numbers: number[]; colour: string; day: string }> = {
  Ashwini:            { numbers: [1, 7], colour: 'Red',         day: 'Tuesday' },
  Bharani:            { numbers: [6, 9], colour: 'White',       day: 'Friday' },
  Krittika:           { numbers: [1, 3], colour: 'Golden',      day: 'Sunday' },
  Rohini:             { numbers: [2, 6], colour: 'White',       day: 'Monday' },
  Mrigashira:         { numbers: [9, 5], colour: 'Silver',      day: 'Tuesday' },
  Ardra:              { numbers: [4, 7], colour: 'Blue',        day: 'Wednesday' },
  Punarvasu:          { numbers: [3, 5], colour: 'Yellow',      day: 'Thursday' },
  Pushya:             { numbers: [8, 3], colour: 'Dark Blue',   day: 'Saturday' },
  Ashlesha:           { numbers: [5, 7], colour: 'Grey',        day: 'Wednesday' },
  Magha:              { numbers: [7, 1], colour: 'Cream',       day: 'Sunday' },
  'Purva Phalguni':   { numbers: [6, 8], colour: 'Pink',        day: 'Friday' },
  'Uttara Phalguni':  { numbers: [1, 2], colour: 'Golden',      day: 'Sunday' },
  Hasta:              { numbers: [2, 5], colour: 'Green',       day: 'Monday' },
  Chitra:             { numbers: [9, 4], colour: 'Red',         day: 'Tuesday' },
  Swati:              { numbers: [4, 6], colour: 'Black',       day: 'Saturday' },
  Vishakha:           { numbers: [3, 9], colour: 'Yellow',      day: 'Thursday' },
  Anuradha:           { numbers: [8, 2], colour: 'Dark Blue',   day: 'Saturday' },
  Jyeshtha:           { numbers: [5, 3], colour: 'Cream',       day: 'Wednesday' },
  Mula:               { numbers: [7, 8], colour: 'Brown',       day: 'Saturday' },
  'Purva Ashadha':    { numbers: [6, 3], colour: 'White',       day: 'Friday' },
  'Uttara Ashadha':   { numbers: [1, 8], colour: 'Golden',      day: 'Sunday' },
  Shravana:           { numbers: [2, 4], colour: 'Light Blue',  day: 'Monday' },
  Dhanishtha:         { numbers: [9, 7], colour: 'Silver',      day: 'Tuesday' },
  Shatabhisha:        { numbers: [4, 1], colour: 'Blue',        day: 'Saturday' },
  'Purva Bhadrapada': { numbers: [3, 6], colour: 'Yellow',      day: 'Thursday' },
  'Uttara Bhadrapada':{ numbers: [8, 9], colour: 'Dark Blue',   day: 'Saturday' },
  Revati:             { numbers: [5, 2], colour: 'Yellow',      day: 'Wednesday' },
};

// ─── South Indian chart ───────────────────────────────────────────────────────

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
  const signPlanets: Record<string, string[]> = {};
  Object.entries(positions).forEach(([planet, pos]) => {
    if (!signPlanets[pos.sign]) signPlanets[pos.sign] = [];
    signPlanets[pos.sign].push(PLANET_ABBREV[planet] ?? planet.slice(0, 2));
  });

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: 2,
    background: '#1b1f4a',
    border: '2px solid #1b1f4a',
    borderRadius: 4,
    aspectRatio: '1',
    maxWidth: 320,
    margin: '0 auto',
  };

  const cellBase: React.CSSProperties = {
    background: '#faf8f4',
    padding: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minHeight: 60,
    position: 'relative',
  };

  return (
    <div style={gridStyle} role="img" aria-label="South Indian Kundali chart">
      {SIGN_GRID.map(({ sign, row, col }) => {
        const isLagna = sign === lagna;
        const planets = signPlanets[sign] ?? [];
        return (
          <div
            key={sign}
            style={{
              ...cellBase,
              gridRow: row + 1,
              gridColumn: col + 1,
              background: isLagna ? '#fff8e7' : '#faf8f4',
              border: isLagna ? '1px solid #c9a84c' : undefined,
            }}
            title={sign}
          >
            {isLagna && (
              <span style={{ fontSize: 9, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lag
              </span>
            )}
            <span style={{ fontSize: 10, color: '#6b6b8a', fontWeight: 500 }}>{SIGN_ABBREV[sign]}</span>
            {planets.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#1b1f4a', lineHeight: 1.4, marginTop: 2 }}>
                {planets.join(' ')}
              </span>
            )}
          </div>
        );
      })}
      {[[1,1],[1,2],[2,1],[2,2]].map(([r,c]) => (
        <div key={`c${r}${c}`} style={{ ...cellBase, gridRow: r + 1, gridColumn: c + 1, background: '#f0ebe0' }} />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

declare global {
  interface Window { google: any; initPlaces: () => void; }
}

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const HomePage: NextPage = () => {
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

  const [copied, setCopied] = useState(false);

  const pobRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Attach Google Places autocomplete to the POB input.
  // Handles both first load (script not yet present) and client-side
  // navigation back to this page (script already in DOM, API already loaded).
  useEffect(() => {
    if (!pobRef.current) return;

    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;
    if (!key) return;

    const attachAutocomplete = () => {
      if (!pobRef.current || autocompleteRef.current) return;
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        pobRef.current, { types: ['(cities)'] }
      );
      autocompleteRef.current.addListener('place_changed', async () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setPob(place.formatted_address ?? place.name ?? '');
        setPobLat(lat);
        setPobLon(lng);
        try {
          const res = await fetch(`https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`);
          const tz = await res.json();
          setPobTzOffset(tz.currentUtcOffset?.seconds !== undefined ? tz.currentUtcOffset.seconds / 3600 : 0);
        } catch {
          setPobTzOffset(0);
        }
      });
    };

    if (window.google?.maps?.places) {
      // API already loaded (e.g. navigated back to this page)
      attachAutocomplete();
    } else {
      // Set callback for when script loads
      window.initPlaces = attachAutocomplete;
      if (!document.getElementById('gmaps-script')) {
        const script = document.createElement('script');
        script.id = 'gmaps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initPlaces`;
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  const canSubmit = name.trim() && day && month && year && pob && pobLat !== null && pobLon !== null && pobTzOffset !== null && !loading;

  // Core submission — accepts explicit values so it can be called both from
  // the form (via handleSubmit) and from the URL-params auto-load effect.
  const submitKundliWith = async (opts: {
    name: string; dob: string; tob: string | null; tobUnknown: boolean;
    pob: string; lat: number; lon: number; tz: number;
  }) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/public/kundli`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: opts.name,
          dob: opts.dob,
          tob: opts.tob,
          tob_unknown: opts.tobUnknown,
          pob: opts.pob,
          pob_lat: opts.lat,
          pob_lon: opts.lon,
          pob_timezone_offset: opts.tz,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? 'Chart computation failed');
      }
      setResult(await res.json());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dobYear = parseInt(year);
    const dobMonth = months.indexOf(month) + 1;
    const dobDay = parseInt(day);
    let tob: string | null = null;
    if (!tobUnknown) {
      let h = parseInt(hour);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      tob = `${String(h).padStart(2,'0')}:${minute}:00`;
    }
    await submitKundliWith({
      name: name.trim(),
      dob: `${dobYear}-${String(dobMonth).padStart(2,'0')}-${String(dobDay).padStart(2,'0')}`,
      tob, tobUnknown, pob, lat: pobLat!, lon: pobLon!, tz: pobTzOffset!,
    });
  };

  // Auto-load a shared Kundli from URL params (e.g. /?share=1&name=...&lat=...&tz=...).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('share') !== '1') return;
    const n   = params.get('name')   ?? '';
    const d   = params.get('day')    ?? '';
    const mo  = params.get('month')  ?? '';
    const y   = params.get('year')   ?? '';
    const h   = params.get('hour')   ?? '12';
    const mi  = params.get('minute') ?? '00';
    const ap  = (params.get('ampm')  ?? 'AM') as 'AM' | 'PM';
    const tbu = params.get('tobUnknown') === '1';
    const pb  = params.get('pob')    ?? '';
    const lat = parseFloat(params.get('lat') ?? '');
    const lon = parseFloat(params.get('lon') ?? '');
    const tz  = parseFloat(params.get('tz')  ?? '');
    if (!n || !d || !mo || !y || !pb || isNaN(lat) || isNaN(lon) || isNaN(tz)) return;
    // Pre-fill form state so "← New Kundli" returns to a populated form
    setName(n); setDay(d); setMonth(mo); setYear(y);
    setHour(h); setMinute(mi); setAmpm(ap); setTobUnknown(tbu);
    setPob(pb); setPobLat(lat); setPobLon(lon); setPobTzOffset(tz);
    // Build dob/tob and submit directly with the parsed values
    const dobYear = parseInt(y);
    const dobMonth = months.indexOf(mo) + 1;
    const dobDay = parseInt(d);
    let tob: string | null = null;
    if (!tbu) {
      let hNum = parseInt(h);
      if (ap === 'PM' && hNum !== 12) hNum += 12;
      if (ap === 'AM' && hNum === 12) hNum = 0;
      tob = `${String(hNum).padStart(2,'0')}:${mi}:00`;
    }
    submitKundliWith({ name: n, dob: `${dobYear}-${String(dobMonth).padStart(2,'0')}-${String(dobDay).padStart(2,'0')}`, tob, tobUnknown: tbu, pob: pb, lat, lon, tz });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const buildShareUrl = () => {
    const params = new URLSearchParams({
      share: '1', name, day, month, year, hour, minute, ampm,
      tobUnknown: tobUnknown ? '1' : '0',
      pob, lat: String(pobLat), lon: String(pobLon), tz: String(pobTzOffset),
    });
    return `${window.location.origin}/?${params.toString()}`;
  };

  const handleShareTo = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'telegram' | 'email' | 'copy') => {
    if (!result) return;
    const url = buildShareUrl();
    const lucky = NAKSHATRA_LUCKY[result.nakshatra];
    const shortText = `My Vedic Kundli: ${result.name} — Lagna ${result.lagna}, Nakshatra ${result.nakshatra}. Get yours free:`;
    const longText =
      `Vedic Birth Chart — ${result.name}\n` +
      `Lagna: ${result.lagna} | Rashi: ${result.moon_sign} | Nakshatra: ${result.nakshatra}\n` +
      (lucky ? `Lucky Numbers: ${lucky.numbers.join(', ')} | Lucky Day: ${lucky.day}\n` : '') +
      `\nView full chart: ${url}\n` +
      `Generated by JyotishHardev — free Vedic astrology, no account needed.`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(longText)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shortText)}`, '_blank');
    } else if (platform === 'email') {
      const subject = encodeURIComponent(`Kundli for ${result.name}`);
      const body = encodeURIComponent(longText);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url).catch(() => {
        const el = document.createElement('textarea');
        el.value = url; document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
      }).finally(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <>
      <Head>
        <title>Free Kundli Generator · JyotishHardev — Vedic Astrology</title>
        <meta name="description" content="Generate your Vedic birth chart instantly — free, no account needed. Get your Lagna, Rashi, Nakshatra, Dasha, and full Jyotish reading." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://jyotishhardev.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="JyotishHardev" />
        <meta property="og:url" content="https://jyotishhardev.com/" />
        <meta property="og:title" content="Free Kundli Generator · JyotishHardev" />
        <meta property="og:description" content="Generate your Vedic birth chart instantly — free, no account needed. Get your Lagna, Rashi, Nakshatra, Dasha, and full Jyotish reading." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Free Kundli Generator · JyotishHardev" />
        <meta name="twitter:description" content="Generate your Vedic birth chart instantly — free, no account needed. Get your Lagna, Rashi, Nakshatra, Dasha, and full Jyotish reading." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "JyotishHardev",
          "url": "https://jyotishhardev.com",
          "description": "Free Vedic astrology — instant Kundli, daily panchang, nakshatra library, and Jyotish predictions.",
          "potentialAction": { "@type": "SearchAction", "target": "https://jyotishhardev.com/" }
        })}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap" rel="stylesheet" />
      </Head>

      <main className="page">
        <PublicNav onLogoClick={() => { setResult(null); }} />

        <div className="container">
          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">Free Kundli Generator</h1>
            <p className="hero-sub">
              Enter your birth details — get your Vedic chart, lagna, nakshatra, and personalised reading instantly.
              No account needed.
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
                  placeholder="e.g. Lalita Devi"
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
                  onChange={e => { setPob(e.target.value); setPobLat(null); setPobLon(null); setPobTzOffset(null); }}
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
                {!tobUnknown && (
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
                )}
                <button type="button" className="unknown-tob-btn" onClick={() => setTobUnknown(v => !v)}>
                  {tobUnknown ? '✓ Using noon chart — tap to enter time' : "I don't know my birth time"}
                </button>
                {tobUnknown && <p className="field-hint">We&apos;ll use noon as your birth time and note the uncertainty.</p>}
              </div>

              {error && <div className="error-box" role="alert">{error}</div>}

              <button type="submit" className="submit-btn" disabled={!canSubmit}>
                {loading ? 'Computing your chart…' : 'Generate Kundli →'}
              </button>
            </form>
          ) : (
            <div className="results">
              <div className="results-header">
                <div className="results-actions">
                  <button className="new-kundli-btn" onClick={() => { setResult(null); }}>
                    ← New Kundli
                  </button>
                </div>
                <div className="social-row">
                  <span className="social-label">Share</span>
                  {/* WhatsApp */}
                  <button className="social-btn" style={{ '--brand': '#25D366' } as any} onClick={() => handleShareTo('whatsapp')} title="WhatsApp" aria-label="Share on WhatsApp">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </button>
                  {/* X / Twitter */}
                  <button className="social-btn" style={{ '--brand': '#000000' } as any} onClick={() => handleShareTo('twitter')} title="X (Twitter)" aria-label="Share on X">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                  </button>
                  {/* Facebook */}
                  <button className="social-btn" style={{ '--brand': '#1877F2' } as any} onClick={() => handleShareTo('facebook')} title="Facebook" aria-label="Share on Facebook">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </button>
                  {/* Telegram */}
                  <button className="social-btn" style={{ '--brand': '#2AABEE' } as any} onClick={() => handleShareTo('telegram')} title="Telegram" aria-label="Share on Telegram">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </button>
                  {/* Email */}
                  <button className="social-btn" style={{ '--brand': '#6b6b8a' } as any} onClick={() => handleShareTo('email')} title="Email" aria-label="Share via Email">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </button>
                  {/* Copy link */}
                  <button className="social-btn" style={{ '--brand': '#c9a84c' } as any} onClick={() => handleShareTo('copy')} title="Copy link" aria-label="Copy link">
                    {copied
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    }
                  </button>
                </div>
                <h2 className="results-name">{result.name}&apos;s Kundli</h2>
                {result.tob_unknown && (
                  <p className="tob-notice">Birth time unknown — noon chart used. Lagna may be inaccurate.</p>
                )}
              </div>

              <div className="facts-grid">
                <div className="fact-card"><div className="fact-label">Lagna (Ascendant)</div><div className="fact-value">{result.lagna}</div></div>
                <div className="fact-card"><div className="fact-label">Rashi (Moon Sign)</div><div className="fact-value">{result.moon_sign}</div></div>
                <div className="fact-card"><div className="fact-label">Nakshatra</div><div className="fact-value">{result.nakshatra}</div></div>
                <div className="fact-card"><div className="fact-label">Current Dasha</div><div className="fact-value">{result.current_dasha}</div></div>
              </div>

              <div className="chart-section">
                <h3 className="section-title">Birth Chart</h3>
                <KundaliChart lagna={result.lagna} positions={result.positions} />
                <p className="chart-hint">South Indian style · Lag = Lagna (Ascendant)</p>
              </div>

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

              {(() => {
                const interp = LAGNA_DATA[result.lagna];
                const lucky = NAKSHATRA_LUCKY[result.nakshatra];

                const luckyBlock = lucky && (
                  <div className="interp-block lucky-row">
                    <div className="lucky-item"><div className="lucky-label">Lucky Numbers</div><div className="lucky-value">{lucky.numbers.join(' · ')}</div></div>
                    <div className="lucky-item"><div className="lucky-label">Lucky Colour</div><div className="lucky-value">{lucky.colour}</div></div>
                    <div className="lucky-item"><div className="lucky-label">Lucky Day</div><div className="lucky-value">{lucky.day}</div></div>
                  </div>
                );

                return (
                  <>
                    {interp && (
                      <div className="interp-section">
                        <h3 className="section-title">Your Vedic Profile</h3>
                        <div className="interp-block">
                          <div className="interp-label">Personality Traits</div>
                          <div className="traits-row">
                            {interp.traits.map(t => <span key={t} className="trait-chip">{t}</span>)}
                          </div>
                        </div>
                        {luckyBlock}
                        {[
                          { icon: '💼', label: 'Career', text: interp.career },
                          { icon: '💰', label: 'Finances', text: interp.finances },
                          { icon: '🏠', label: 'Family Life', text: interp.family },
                          { icon: '🌿', label: 'Health', text: interp.health },
                        ].map(({ icon, label, text }) => (
                          <div key={label} className="interp-block">
                            <div className="interp-label">{icon} {label}</div>
                            <p className="interp-text">{text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                  </>
                );
              })()}


              <button className="try-again-btn" onClick={() => { setResult(null); setError(''); }}>
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

.container {
          max-width: 640px;
          margin: 0 auto;
          padding: 32px 16px 64px;
        }

        .hero {
          text-align: center;
          margin-bottom: 28px;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 30px;
          color: #1b1f4a;
          margin-bottom: 10px;
          line-height: 1.2;
        }

        .hero-sub {
          font-size: 15px;
          color: #6b6b8a;
          line-height: 1.6;
          max-width: 480px;
          margin: 0 auto;
        }

        /* ── Form ── */
        .form-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 28px 24px;
          box-shadow: 0 2px 12px rgba(27,31,74,0.08);
        }

        .field { margin-bottom: 20px; }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1b1f4a;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }

        .input, .select {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e0d9cc;
          border-radius: 8px;
          font-size: 15px;
          color: #1a1a2e;
          background: #faf8f4;
          outline: none;
          transition: border-color 150ms;
          box-sizing: border-box;
        }
        .input:focus, .select:focus { border-color: #1b1f4a; }

        .select { appearance: none; cursor: pointer; }

        .field-hint { font-size: 12px; color: #9b96a8; margin: 6px 0 0; }

        .dob-row { display: grid; grid-template-columns: 1fr 2fr 1.5fr; gap: 8px; }

        .tob-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .tob-row .select { width: auto; flex: 1; }
        .tob-row .ampm { flex: 0.7; }
        .colon { font-size: 18px; font-weight: 600; color: #1b1f4a; }

        .unknown-tob-btn {
          background: none;
          border: none;
          font-size: 13px;
          color: #1b1f4a;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          opacity: 0.7;
        }
        .unknown-tob-btn:hover { opacity: 1; }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          color: #991b1b;
          margin-bottom: 16px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 150ms;
          min-height: 52px;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Results ── */
        .results { }

        .results-header { text-align: center; margin-bottom: 24px; }
        .results-actions {
          display: flex; gap: 8px; justify-content: center; margin-bottom: 16px;
        }
        .new-kundli-btn {
          display: inline-flex; align-items: center; gap: 4px;
          background: none; border: 1px solid rgba(27,31,74,0.2);
          border-radius: 20px; padding: 6px 14px; font-size: 13px;
          color: #6b6b8a; cursor: pointer;
          transition: border-color 150ms, color 150ms;
        }
        .new-kundli-btn:hover { border-color: #1b1f4a; color: #1b1f4a; }

        .social-row {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-bottom: 16px;
        }
        .social-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9b96a8; margin-right: 4px;
        }
        .social-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          background: none; border: 1px solid rgba(27,31,74,0.15);
          color: #6b6b8a; cursor: pointer;
          transition: background 150ms, color 150ms, border-color 150ms;
        }
        .social-btn:hover {
          background: var(--brand);
          border-color: var(--brand);
          color: #ffffff;
        }

        .results-name {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 26px;
          color: #1b1f4a;
          margin-bottom: 6px;
        }

        .tob-notice {
          font-size: 13px;
          color: #92400e;
          background: #fef3c7;
          border-radius: 6px;
          padding: 6px 12px;
          display: inline-block;
        }

        .facts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .fact-card {
          background: #ffffff;
          border-radius: 10px;
          padding: 14px;
          box-shadow: 0 1px 4px rgba(27,31,74,0.07);
        }

        .fact-label { font-size: 11px; color: #9b96a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .fact-value { font-size: 17px; font-weight: 700; color: #1b1f4a; }

        /* ── Chart ── */
        .chart-section { margin-bottom: 24px; }

        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #1b1f4a;
          margin-bottom: 12px;
          letter-spacing: 0.01em;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 2px;
          background: #1b1f4a;
          border: 2px solid #1b1f4a;
          border-radius: 4px;
          aspect-ratio: 1;
          max-width: 320px;
          margin: 0 auto;
        }

        .chart-cell {
          background: #faf8f4;
          padding: 4px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          min-height: 60px;
          position: relative;
        }

        .center-cell { background: #f0ebe0; }

        .lagna-cell { background: #fff8e7; border: 1px solid #c9a84c; }

        .lagna-marker {
          font-size: 9px;
          font-weight: 700;
          color: #c9a84c;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cell-sign {
          font-size: 10px;
          color: #6b6b8a;
          font-weight: 500;
        }

        .cell-planets {
          font-size: 10px;
          font-weight: 600;
          color: #1b1f4a;
          line-height: 1.4;
          margin-top: 2px;
        }

        .chart-hint { font-size: 11px; color: #9b96a8; text-align: center; margin-top: 6px; }

        /* ── Planets table ── */
        .planets-section { margin-bottom: 24px; }

        .planets-table {
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(27,31,74,0.07);
        }

        .planet-row {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 1px solid #f0ebe0;
          font-size: 14px;
        }
        .planet-row:last-child { border-bottom: none; }

        .planet-name { flex: 1; font-weight: 600; color: #1b1f4a; }
        .planet-sign { flex: 1; color: #6b6b8a; }
        .planet-degree { color: #9b96a8; font-size: 12px; }

        /* ── Interpretations ── */
        .interp-section { margin-bottom: 24px; }

        .interp-block {
          background: #ffffff;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 10px;
          box-shadow: 0 1px 4px rgba(27,31,74,0.07);
        }

        .interp-label {
          font-size: 12px;
          font-weight: 700;
          color: #1b1f4a;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }

        .interp-text { font-size: 14px; color: #4a4a6a; line-height: 1.65; margin: 0; }

        .traits-row { display: flex; flex-wrap: wrap; gap: 6px; }

        .trait-chip {
          background: #f0ebe0;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #1b1f4a;
        }

        .lucky-row { display: flex; gap: 0; }

        .lucky-item {
          flex: 1;
          text-align: center;
          padding: 4px 0;
          border-right: 1px solid #f0ebe0;
        }
        .lucky-item:last-child { border-right: none; }

        .lucky-label { font-size: 10px; color: #9b96a8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .lucky-value { font-size: 14px; font-weight: 700; color: #1b1f4a; }

        /* ── CTA card ── */
        .cta-section { margin-bottom: 24px; }

        .cta-card {
          background: linear-gradient(135deg, #1b1f4a 0%, #2d3270 100%);
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
        }

        .cta-icon { font-size: 32px; margin-bottom: 12px; }

        .cta-heading {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
        }

        .cta-body { font-size: 14px; color: #a0a4c8; line-height: 1.6; margin-bottom: 20px; }

        .cta-btn {
          display: inline-block;
          background: #c9a84c;
          color: #1b1f4a;
          font-size: 15px;
          font-weight: 700;
          padding: 13px 28px;
          border-radius: 24px;
          text-decoration: none;
          transition: opacity 150ms;
        }
        .cta-btn:hover { opacity: 0.88; }

        .cta-sub { font-size: 12px; color: #6b6f9a; margin-top: 10px; }

        /* ── Try again ── */
        .try-again-btn {
          background: none;
          border: none;
          font-size: 14px;
          color: #6b6b8a;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          margin-bottom: 24px;
        }
        .try-again-btn:hover { color: #1b1f4a; }
      `}</style>
    </>
  );
};

export default HomePage;
