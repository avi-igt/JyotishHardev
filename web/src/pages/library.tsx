/**
 * /library — Index page for Nakshatras and Rashis.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

// ─── Static data ──────────────────────────────────────────────────────────────

const NAKSHATRAS = [
  { slug: 'ashwini',           name: 'Ashwini',            planet: 'Ketu',    brief: 'Swift healing energy; the horse-headed twins who carry dawn.' },
  { slug: 'bharani',           name: 'Bharani',            planet: 'Venus',   brief: 'Creative and restraining force; births and transitions.' },
  { slug: 'krittika',          name: 'Krittika',           planet: 'Sun',     brief: 'Sharp cutting power; purification through fire.' },
  { slug: 'rohini',            name: 'Rohini',             planet: 'Moon',    brief: 'Fertile abundance; sensual growth and material prosperity.' },
  { slug: 'mrigashira',        name: 'Mrigashira',         planet: 'Mars',    brief: 'Gentle seeking mind; the deer forever searching.' },
  { slug: 'ardra',             name: 'Ardra',              planet: 'Rahu',    brief: 'Storm and renewal; intense transformation through destruction.' },
  { slug: 'punarvasu',         name: 'Punarvasu',          planet: 'Jupiter', brief: 'Return to goodness; restoration and benevolent renewal.' },
  { slug: 'pushya',            name: 'Pushya',             planet: 'Saturn',  brief: 'Nourishing abundance; the most auspicious of nakshatras.' },
  { slug: 'ashlesha',          name: 'Ashlesha',           planet: 'Mercury', brief: 'Coiled serpent wisdom; mystical insight and hidden power.' },
  { slug: 'magha',             name: 'Magha',              planet: 'Ketu',    brief: 'Royal authority; connection to ancestral power and legacy.' },
  { slug: 'purva-phalguni',    name: 'Purva Phalguni',     planet: 'Venus',   brief: 'Creative pleasure; relaxation, romance, and artistic gifts.' },
  { slug: 'uttara-phalguni',   name: 'Uttara Phalguni',    planet: 'Sun',     brief: 'Social contracts; friendship, patronage, and union.' },
  { slug: 'hasta',             name: 'Hasta',              planet: 'Moon',    brief: 'Skilled hands; dexterity, craft, and healing touch.' },
  { slug: 'chitra',            name: 'Chitra',             planet: 'Mars',    brief: 'Brilliant creation; the architect\'s jewel of design.' },
  { slug: 'swati',             name: 'Swati',              planet: 'Rahu',    brief: 'Independent wandering; freedom and diplomatic adaptability.' },
  { slug: 'vishakha',          name: 'Vishakha',           planet: 'Jupiter', brief: 'Purposeful striving; triumph through determination.' },
  { slug: 'anuradha',          name: 'Anuradha',           planet: 'Saturn',  brief: 'Devoted friendship; loyalty and success through cooperation.' },
  { slug: 'jyeshtha',          name: 'Jyeshtha',           planet: 'Mercury', brief: 'Elder authority; protective power and chief\'s dominion.' },
  { slug: 'mula',              name: 'Mula',               planet: 'Ketu',    brief: 'Root investigation; breaking down to discover truth.' },
  { slug: 'purva-ashadha',     name: 'Purva Ashadha',      planet: 'Venus',   brief: 'Invincible early victory; purification and bold declarations.' },
  { slug: 'uttara-ashadha',    name: 'Uttara Ashadha',     planet: 'Sun',     brief: 'Enduring final victory; universal laws and lasting triumph.' },
  { slug: 'shravana',          name: 'Shravana',           planet: 'Moon',    brief: 'Sacred listening; Vishnu\'s ear for cosmic rhythm.' },
  { slug: 'dhanishtha',        name: 'Dhanishtha',         planet: 'Mars',    brief: 'Abundant symphony; wealth through rhythm and community.' },
  { slug: 'shatabhisha',       name: 'Shatabhisha',        planet: 'Rahu',    brief: 'Hundred healers; mysterious solitude and cosmic medicine.' },
  { slug: 'purva-bhadrapada',  name: 'Purva Bhadrapada',   planet: 'Jupiter', brief: 'Fierce transformative fire; two-faced intensity.' },
  { slug: 'uttara-bhadrapada', name: 'Uttara Bhadrapada',  planet: 'Saturn',  brief: 'Depth wisdom; the serpent of the deep and final liberation.' },
  { slug: 'revati',            name: 'Revati',             planet: 'Mercury', brief: 'Nourishing completion; the guide who lights the final path.' },
];

const RASHIS = [
  { slug: 'mesha',      name: 'Mesha',      element: 'Fire',  planet: 'Mars',         symbol: 'Ram',          brief: 'Courageous and pioneering; pure initiative energy.' },
  { slug: 'vrishabha',  name: 'Vrishabha',  element: 'Earth', planet: 'Venus',        symbol: 'Bull',         brief: 'Patient and sensual; builds lasting material security.' },
  { slug: 'mithuna',    name: 'Mithuna',    element: 'Air',   planet: 'Mercury',      symbol: 'Twins',        brief: 'Adaptable and witty; the great communicator of the zodiac.' },
  { slug: 'karka',      name: 'Karka',      element: 'Water', planet: 'Moon',         symbol: 'Crab',         brief: 'Nurturing and intuitive; deeply protective of home and kin.' },
  { slug: 'simha',      name: 'Simha',      element: 'Fire',  planet: 'Sun',          symbol: 'Lion',         brief: 'Confident and generous; natural leader who commands respect.' },
  { slug: 'kanya',      name: 'Kanya',      element: 'Earth', planet: 'Mercury',      symbol: 'Virgin',       brief: 'Analytical and precise; the healer and servant of the zodiac.' },
  { slug: 'tula',       name: 'Tula',       element: 'Air',   planet: 'Venus',        symbol: 'Scales',       brief: 'Diplomatic and charming; eternally seeking beauty and justice.' },
  { slug: 'vrishchika', name: 'Vrishchika', element: 'Water', planet: 'Mars / Ketu',  symbol: 'Scorpion',     brief: 'Intense and perceptive; transforms everything it touches.' },
  { slug: 'dhanu',      name: 'Dhanu',      element: 'Fire',  planet: 'Jupiter',      symbol: 'Archer',       brief: 'Philosophical and adventurous; aims for the highest truths.' },
  { slug: 'makara',     name: 'Makara',     element: 'Earth', planet: 'Saturn',       symbol: 'Crocodile',    brief: 'Ambitious and disciplined; climbs steadily toward mastery.' },
  { slug: 'kumbha',     name: 'Kumbha',     element: 'Air',   planet: 'Saturn / Rahu',symbol: 'Water-bearer', brief: 'Humanitarian and visionary; pours knowledge for the collective.' },
  { slug: 'meena',      name: 'Meena',      element: 'Water', planet: 'Jupiter / Ketu',symbol: 'Fish',        brief: 'Compassionate and spiritual; dissolves boundaries in service.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const LibraryPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Jyotish Library — Nakshatras & Rashis · JyotishHardev</title>
        <meta name="description" content="Complete Vedic astrology library — all 27 Nakshatras and 12 Rashis with detailed descriptions, ruling planets, deities, traits, and compatibility." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://jyotishhardev.com/library" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="JyotishHardev" />
        <meta property="og:url" content="https://jyotishhardev.com/library" />
        <meta property="og:title" content="Jyotish Library — Nakshatras & Rashis · JyotishHardev" />
        <meta property="og:description" content="Complete Vedic astrology library — all 27 Nakshatras and 12 Rashis with detailed descriptions, ruling planets, deities, traits, and compatibility." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Jyotish Library — Nakshatras & Rashis · JyotishHardev" />
        <meta name="twitter:description" content="Complete Vedic astrology library — all 27 Nakshatras and 12 Rashis with detailed descriptions, ruling planets, deities, traits, and compatibility." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <PublicNav activePage="library" />

        <div className="container">
          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">Jyotish Library</h1>
            <p className="hero-sub">Explore the 27 Nakshatras and 12 Rashis — the celestial building blocks of Vedic astrology.</p>
          </div>

          {/* Nakshatras section */}
          <section className="section">
            <h2 className="section-title">27 Nakshatras</h2>
            <p className="section-sub">The lunar mansions — each carrying a distinct cosmic personality.</p>
            <div className="card-grid">
              {NAKSHATRAS.map(n => (
                <Link key={n.slug} href={`/nakshatras/${n.slug}`} className="lib-card">
                  <div className="lib-card-header">
                    <span className="lib-card-name">{n.name}</span>
                    <span className="lib-card-planet">{n.planet}</span>
                  </div>
                  <p className="lib-card-brief">{n.brief}</p>
                  <span className="lib-card-link">Learn more →</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Rashis section */}
          <section className="section">
            <h2 className="section-title">12 Rashis</h2>
            <p className="section-sub">The signs of the zodiac and their Vedic interpretations.</p>
            <div className="card-grid rashi-grid">
              {RASHIS.map(r => (
                <Link key={r.slug} href={`/rashis/${r.slug}`} className="lib-card">
                  <div className="lib-card-header">
                    <span className="lib-card-name">{r.name}</span>
                    <span className="lib-card-planet">{r.element} · {r.planet}</span>
                  </div>
                  <p className="lib-card-brief">{r.brief}</p>
                  <span className="lib-card-link">Learn more →</span>
                </Link>
              ))}
            </div>
          </section>
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
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 16px 80px;
        }

        .hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 36px;
          color: #1b1f4a;
          margin: 0 0 10px;
          line-height: 1.2;
        }

        .hero-sub {
          font-size: 16px;
          color: #6b6b8a;
          margin: 0;
          max-width: 540px;
          margin-left: auto;
          margin-right: auto;
        }

        .section {
          margin-bottom: 56px;
        }

        .section-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 26px;
          color: #1b1f4a;
          margin: 0 0 6px;
        }

        .section-sub {
          font-size: 14px;
          color: #6b6b8a;
          margin: 0 0 24px;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .rashi-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .lib-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px 18px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.08);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: box-shadow 150ms, transform 150ms;
        }

        .lib-card:hover {
          box-shadow: 0 4px 16px rgba(27,31,74,0.14);
          transform: translateY(-1px);
        }

        .lib-card-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }

        .lib-card-name {
          font-size: 15px;
          font-weight: 700;
          color: #1b1f4a;
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
        }

        .lib-card-planet {
          font-size: 11px;
          color: #6b6b8a;
          font-weight: 500;
          white-space: nowrap;
        }

        .lib-card-brief {
          font-size: 12px;
          color: #4a4a6a;
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }

        .lib-card-link {
          font-size: 12px;
          color: #c9a84c;
          font-weight: 600;
          margin-top: 4px;
        }

        @media (max-width: 800px) {
          .card-grid, .rashi-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 480px) {
          .card-grid, .rashi-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 28px; }
        }
      `}</style>
    </>
  );
};

export default LibraryPage;
