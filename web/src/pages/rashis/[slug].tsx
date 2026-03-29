/**
 * /rashis/[slug] — Individual Rashi detail pages (SSG).
 */
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RashiData {
  slug: string;
  name: string;
  element: string;
  ruling_planet: string;
  symbol: string;
  number: number;
  characteristics: string[];
  strengths: string;
  challenges: string;
  general: string;
  quality: string; // Cardinal, Fixed, Mutable
}

// ─── Static data for all 12 Rashis ────────────────────────────────────────────

const RASHIS: Record<string, RashiData> = {
  mesha: {
    slug: 'mesha',
    name: 'Mesha',
    element: 'Fire',
    ruling_planet: 'Mars',
    symbol: 'Ram',
    number: 1,
    quality: 'Cardinal',
    characteristics: ['Courageous', 'Independent', 'Pioneering', 'Impulsive'],
    strengths: 'Mesha is the first rashi — pure initiating fire energy that breaks ground for everyone else. Natives are blessed with extraordinary courage and the ability to take decisive action where others hesitate. Their pioneering spirit makes them natural entrepreneurs, leaders, and innovators who thrive at the start of any new venture. Enthusiasm and confidence carry them into territories others fear to enter.',
    challenges: 'The Ram\'s charge is powerful but often lacks follow-through. Mesha natives may move on to the next excitement before the first is completed, leaving a trail of unfinished projects. Impulsiveness, impatience, and a hot temper can create unnecessary conflict. Learning to pause before reacting is the lifelong lesson that transforms raw Aries fire into true leadership.',
    general: 'Mesha marks the beginning of the Vedic zodiac and the spring equinox — it carries the pure energy of initiation, new beginnings, and the primal will to exist. Mars gives it courage; fire gives it passion.',
  },
  vrishabha: {
    slug: 'vrishabha',
    name: 'Vrishabha',
    element: 'Earth',
    ruling_planet: 'Venus',
    symbol: 'Bull',
    number: 2,
    quality: 'Fixed',
    characteristics: ['Patient', 'Sensual', 'Determined', 'Comfort-loving'],
    strengths: 'Vrishabha natives build everything that lasts. Their patient, fixed earth energy combined with Venus\'s love of beauty creates individuals who excel at accumulating both material wealth and aesthetic mastery. They are extraordinarily reliable and devoted — once committed, they do not waver. Their connection to the physical world gives them an unusual ability to comfort and nourish others.',
    challenges: 'The Bull that will not move is both Vrishabha\'s greatest strength and its chief limitation. Resistance to change can mean missing opportunities or remaining in situations that no longer serve growth long past their usefulness. Possessiveness in relationships and materialism that prioritises comfort over growth are patterns requiring conscious attention.',
    general: 'Venus-ruled Vrishabha is the builder and sustainer of the zodiac. Where Mesha ignites, Vrishabha cultivates — it is the patient gardener who brings the first spark of life to full flowering abundance.',
  },
  mithuna: {
    slug: 'mithuna',
    name: 'Mithuna',
    element: 'Air',
    ruling_planet: 'Mercury',
    symbol: 'Twins',
    number: 3,
    quality: 'Mutable',
    characteristics: ['Adaptable', 'Witty', 'Communicative', 'Restless'],
    strengths: 'Mithuna is the great communicator — Mercury\'s air sign combines quick intelligence with remarkable adaptability. These natives can understand and articulate almost any perspective, making them gifted writers, speakers, teachers, and traders. Their wit is quick, their learning rapid, and their social intelligence exceptional. They thrive in environments requiring mental agility and versatility.',
    challenges: 'The twins represent Mithuna\'s dual nature — and this duality can create inconsistency, indecision, and the appearance of unreliability. Restlessness of mind makes sustained focus difficult; many Mithuna natives are masters of the surface without the depth that sustained study provides. Anxiety from an overactive mind needs regular grounding through movement and creative practice.',
    general: 'The cosmic twins of Mithuna represent the marriage of opposites — thought and expression, masculine and feminine, one and many. Mercury\'s gifts of language and trade find their fullest expression through this airy, mutable sign.',
  },
  karka: {
    slug: 'karka',
    name: 'Karka',
    element: 'Water',
    ruling_planet: 'Moon',
    symbol: 'Crab',
    number: 4,
    quality: 'Cardinal',
    characteristics: ['Nurturing', 'Intuitive', 'Emotional', 'Protective'],
    strengths: 'Karka is the great nurturer — Moon-ruled water that initiates care, home-building, and emotional connection. These natives possess extraordinary intuition and empathic sensitivity that allows them to understand others at a felt level. They create deeply nourishing environments — in the home, in communities, and in their creative work. Their memory is exceptional, and loyalty to loved ones is fierce and enduring.',
    challenges: 'The crab\'s hard shell protects a soft interior — Karka natives may build impenetrable emotional defences that isolate them from the very connection they crave. Mood fluctuations following the lunar cycle can be pronounced, creating instability in daily functioning. Over-attachment to the past, to home, and to people they love can prevent necessary growth and transitions.',
    general: 'The Moon is at home in Karka, making this the most emotionally sensitive and intuitively powerful of all rashis. Like the tidal waters Karka rules, its natives feel the pull of the cosmic rhythms in their very bodies.',
  },
  simha: {
    slug: 'simha',
    name: 'Simha',
    element: 'Fire',
    ruling_planet: 'Sun',
    symbol: 'Lion',
    number: 5,
    quality: 'Fixed',
    characteristics: ['Confident', 'Generous', 'Dramatic', 'Proud'],
    strengths: 'Simha is the Sun\'s own rashi — fixed fire that radiates confidence and generosity in equal measure. Natives command authority naturally, and their warmth and dramatic presence attract people to them effortlessly. They are born leaders whose creativity, loyalty, and magnanimity inspire deep devotion. At their best, they burn away others\' self-doubt through the sheer force of their belief in those they love.',
    challenges: 'The lion\'s pride is both its crown and its trap. Simha natives can become overly attached to status, admiration, and the central role — making criticism difficult to receive and ego wounds slow to heal. The desire for recognition can become a dependency that shapes decisions poorly. Learning genuine humility — the capacity to learn from any source — is the doorway to Simha\'s highest expression.',
    general: 'Where the Sun shines directly — in Leo, in Simha — everything is illuminated. This sign carries the solar principle of creative self-expression, leadership, and the heart\'s generous light at its most concentrated and direct.',
  },
  kanya: {
    slug: 'kanya',
    name: 'Kanya',
    element: 'Earth',
    ruling_planet: 'Mercury',
    symbol: 'Virgin',
    number: 6,
    quality: 'Mutable',
    characteristics: ['Analytical', 'Practical', 'Perfectionist', 'Service-oriented'],
    strengths: 'Kanya combines Mercury\'s analytical precision with earth\'s practicality to create the zodiac\'s master craftsperson and healer. These natives have an extraordinary eye for detail, making them exceptional physicians, analysts, accountants, writers, and any role where precision matters. Their dedication to service and improvement is tireless — they are among the most genuinely helpful of all signs.',
    challenges: 'Kanya\'s analytical gift turns inward to become the critic\'s relentless eye. Over-analysis, self-criticism, and a tendency to focus on what could be improved rather than what is already wonderful create chronic dissatisfaction. Worry and anxiety about health, order, and perfection can steal joy from abundant circumstances. Learning to celebrate imperfect progress is transformative.',
    general: 'The virgin of Kanya is the sacred keeper of the harvest — she discerns what is pure and sustaining from what is not. Mercury\'s mind here becomes the servant of practical perfection in service to the whole.',
  },
  tula: {
    slug: 'tula',
    name: 'Tula',
    element: 'Air',
    ruling_planet: 'Venus',
    symbol: 'Scales',
    number: 7,
    quality: 'Cardinal',
    characteristics: ['Diplomatic', 'Charming', 'Fair-minded', 'Indecisive'],
    strengths: 'Tula initiates the principle of relationship — where Kanya perfects the self, Tula seeks the perfection of connection. Venus\'s cardinal air creates individuals of remarkable charm, beauty sense, and diplomatic intelligence. They see all sides of every situation and have a gift for bringing opposing parties into harmony. Their love of beauty, fairness, and culture makes them gifted in law, design, diplomacy, and the arts.',
    challenges: 'The scales of Tula that weigh every decision can become paralysing indecision. The compulsion to see all sides simultaneously means it takes Tula natives much longer to arrive at positions they can commit to — and sometimes they never quite do. People-pleasing and conflict avoidance can mean important truths go unsaid until the weight becomes unbearable.',
    general: 'Tula is the only inanimate sign of the zodiac — the scales that weigh the soul. In Vedic astrology it is the sign of Saturn\'s exaltation, where justice, karma, and cosmic balance are most purely expressed.',
  },
  vrishchika: {
    slug: 'vrishchika',
    name: 'Vrishchika',
    element: 'Water',
    ruling_planet: 'Mars / Ketu',
    symbol: 'Scorpion',
    number: 8,
    quality: 'Fixed',
    characteristics: ['Intense', 'Perceptive', 'Secretive', 'Transformative'],
    strengths: 'Vrishchika is the most transformative of all rashis — it sees through surfaces to hidden truths and has the courage to act on what it finds, no matter how difficult. Mars gives willpower; Ketu gives spiritual depth and detachment from superficiality. These natives excel in any role requiring investigation, healing at depth, research, psychology, surgery, or working with the hidden forces of life.',
    challenges: 'Fixed water creates the most intense and sometimes explosive of combinations. Vrishchika natives can hold onto grievances, secrets, and wounds long after release would serve them. The intensity that enables transformation can become destructive jealousy, manipulation, or vengefulness when pain overwhelms perspective. Building trust rather than control is the central growth edge.',
    general: 'The scorpion, the eagle, and the phoenix are Vrishchika\'s three symbols — representing the path from instinctual sting, to elevated vision, to death and glorious rebirth. This sign rules the deepest waters of the psyche.',
  },
  dhanu: {
    slug: 'dhanu',
    name: 'Dhanu',
    element: 'Fire',
    ruling_planet: 'Jupiter',
    symbol: 'Archer',
    number: 9,
    quality: 'Mutable',
    characteristics: ['Philosophical', 'Optimistic', 'Adventurous', 'Direct'],
    strengths: 'Dhanu combines fire\'s enthusiasm with Jupiter\'s expansive wisdom to create the zodiac\'s great philosopher-adventurer. These natives have an extraordinary breadth of vision and a contagious optimism that can carry whole communities forward. They excel as teachers, writers, travelers, religious leaders, and in any field where big-picture thinking is required. Their directness and hunger for truth are refreshing and galvanising.',
    challenges: 'The archer\'s arrow flies far but can miss what is nearby. Dhanu natives often struggle with the practical details of daily life, finances, and follow-through on commitments — the vision is clear but execution can be inconsistent. Their blunt truth-telling, while honest, can wound without careful calibration. Excess in all forms — food, drink, idealism, travel — must be consciously managed.',
    general: 'The centaur-archer of Dhanu has the beast\'s earthly power and the philosopher\'s heavenward aim. Jupiter\'s mutable fire sign reaches toward the infinite, making meaning out of experience through the broadest possible lens.',
  },
  makara: {
    slug: 'makara',
    name: 'Makara',
    element: 'Earth',
    ruling_planet: 'Saturn',
    symbol: 'Crocodile / Sea-goat',
    number: 10,
    quality: 'Cardinal',
    characteristics: ['Ambitious', 'Disciplined', 'Patient', 'Reserved'],
    strengths: 'Makara is the builder of mountains — Saturn\'s cardinal earth creates individuals of extraordinary discipline, ambition, and patience. These natives play the long game better than any other rashi, accumulating mastery and authority steadily over decades. Their reliability, structural intelligence, and willingness to do the work others avoid make them exceptional in governance, administration, business, and any role requiring sustained excellence.',
    challenges: 'Saturn\'s heaviness in Makara can create excessive seriousness, workaholism, and emotional reserve that isolates. These natives may sacrifice relationship and joy for achievement, only discovering the emptiness of purely external success later in life. The harsh inner critic that drives the climb must learn to also celebrate what has been built.',
    general: 'Makara\'s sea-goat rises from the ocean\'s depths to the mountain\'s peak — it embodies the complete vertical journey from the unconscious depths to worldly mastery. Saturn\'s rulership here brings karma, structure, and time as the ultimate teachers.',
  },
  kumbha: {
    slug: 'kumbha',
    name: 'Kumbha',
    element: 'Air',
    ruling_planet: 'Saturn / Rahu',
    symbol: 'Water-bearer',
    number: 11,
    quality: 'Fixed',
    characteristics: ['Humanitarian', 'Visionary', 'Independent', 'Unconventional'],
    strengths: 'Kumbha pours the water of consciousness and knowledge for the collective — these natives carry an unusually developed sense of humanity\'s shared destiny and their role in shaping it. Saturn gives discipline; Rahu gives the unconventional genius that sees beyond current paradigms. They excel in technology, social reform, astrology, science, and any field at the frontier of human knowledge and collective wellbeing.',
    challenges: 'The water-bearer\'s focus on the collective can mean neglect of the individual — loved ones may feel they come second to principles, causes, or communities. Fixed air creates strongly held opinions that can become rigid dogma despite Kumbha\'s surface embrace of originality. Emotional detachment, when taken too far, disconnects these natives from the very humanity they serve.',
    general: 'Kumbha is the zodiac\'s visionary — pouring out what it has gathered in cosmic contemplation for the nourishment of all beings. The paradox of Saturn\'s discipline and Rahu\'s rebellion creates the unique genius of this sign.',
  },
  meena: {
    slug: 'meena',
    name: 'Meena',
    element: 'Water',
    ruling_planet: 'Jupiter / Ketu',
    symbol: 'Fish',
    number: 12,
    quality: 'Mutable',
    characteristics: ['Compassionate', 'Intuitive', 'Spiritual', 'Dreamy'],
    strengths: 'Meena is the culmination of the zodiac — the fish that has swum through all eleven signs and carries the accumulated wisdom and compassion of all of them. Jupiter expands their spiritual sensitivity; Ketu gives detachment from the ego and access to the transcendent. These natives are extraordinarily empathic healers, artists, mystics, and compassionate servers whose gift is dissolving the boundaries between self and other in sacred love.',
    challenges: 'The dissolution of Meena\'s mutable water can become literal dissolution — of boundaries, of commitments, of selfhood. These natives must work consciously to maintain healthy structure, as their natural tendency is to flow with whatever current is strongest. Escapism through fantasy, substances, or spiritual bypassing are patterns to address. Grounding practices and clear boundaries are essential foundations.',
    general: 'The two fish of Meena swim in opposite directions — toward the world and toward the divine. This last rashi holds the entire zodiac in its compassionate embrace before releasing all back into the cosmic ocean from which the next cycle of Mesha will emerge.',
  },
};

const RASHI_ORDER = [
  'mesha', 'vrishabha', 'mithuna', 'karka', 'simha', 'kanya',
  'tula', 'vrishchika', 'dhanu', 'makara', 'kumbha', 'meena',
];

// ─── Static generation ────────────────────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: RASHI_ORDER.map(slug => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const rashi = RASHIS[slug];
  if (!rashi) return { notFound: true };
  const idx = RASHI_ORDER.indexOf(slug);
  const prevSlug = idx > 0 ? RASHI_ORDER[idx - 1] : null;
  const nextSlug = idx < RASHI_ORDER.length - 1 ? RASHI_ORDER[idx + 1] : null;
  return {
    props: {
      rashi,
      prevRashi: prevSlug ? { slug: prevSlug, name: RASHIS[prevSlug].name } : null,
      nextRashi: nextSlug ? { slug: nextSlug, name: RASHIS[nextSlug].name } : null,
    },
  };
};

// ─── Page component ───────────────────────────────────────────────────────────

interface PageProps {
  rashi: RashiData;
  prevRashi: { slug: string; name: string } | null;
  nextRashi: { slug: string; name: string } | null;
}

const ELEMENT_ICON: Record<string, string> = {
  Fire: '🔥', Earth: '🌍', Air: '💨', Water: '🌊',
};

const RashiPage: NextPage<PageProps> = ({ rashi, prevRashi, nextRashi }) => {
  return (
    <>
      <Head>
        <title>{rashi.name} Rashi — Meaning, Traits & Astrology · JyotishHardev</title>
        <meta
          name="description"
          content={`${rashi.name} (${rashi.symbol}) — ${rashi.element} sign ruled by ${rashi.ruling_planet}. ${rashi.general}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <PublicNav activePage="library" />

        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/library" className="bc-link">Library</Link>
            <span className="bc-sep">›</span>
            <Link href="/library" className="bc-link">Rashis</Link>
            <span className="bc-sep">›</span>
            <span className="bc-current">{rashi.name}</span>
          </nav>

          {/* Hero */}
          <div className="hero">
            <div className="hero-number">Rashi {rashi.number} of 12</div>
            <h1 className="hero-title">{rashi.name}</h1>
            <div className="hero-meta">
              <span className="meta-chip">{ELEMENT_ICON[rashi.element]} {rashi.element}</span>
              <span className="meta-chip">Ruled by {rashi.ruling_planet}</span>
              <span className="meta-chip">{rashi.symbol}</span>
              <span className="meta-chip">{rashi.quality}</span>
            </div>
            <p className="hero-sub">{rashi.general}</p>
          </div>

          {/* Key characteristics */}
          <div className="section">
            <h2 className="section-title">Key Characteristics</h2>
            <div className="traits-row">
              {rashi.characteristics.map(c => (
                <span key={c} className="trait-chip">{c}</span>
              ))}
            </div>
          </div>

          {/* Strengths & Challenges */}
          <div className="two-col">
            <div className="info-card strengths-card">
              <h2 className="info-title">Strengths</h2>
              <p className="info-text">{rashi.strengths}</p>
            </div>
            <div className="info-card challenges-card">
              <h2 className="info-title">Challenges</h2>
              <p className="info-text">{rashi.challenges}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-card">
            <h2 className="cta-heading">See your full {rashi.name} reading →</h2>
            <p className="cta-body">
              Your Sun sign is just one piece of the cosmic picture. Hardev analyses your complete Vedic chart —
              Lagna, Moon sign, Dasha, and transits — for a reading that speaks to your exact life.
            </p>
            <Link href="/signup" className="cta-btn">Get your full Rashi reading</Link>
            <p className="cta-sub">Free 30-day trial · No credit card needed</p>
          </div>

          {/* Prev / Next */}
          <div className="nav-row">
            {prevRashi ? (
              <Link href={`/rashis/${prevRashi.slug}`} className="nav-prev">
                ← {prevRashi.name}
              </Link>
            ) : <span />}
            {nextRashi ? (
              <Link href={`/rashis/${nextRashi.slug}`} className="nav-next">
                {nextRashi.name} →
              </Link>
            ) : <span />}
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
          max-width: 780px;
          margin: 0 auto;
          padding: 32px 16px 80px;
        }

        /* Breadcrumb */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          margin-bottom: 24px;
        }

        .bc-link {
          color: #c9a84c;
          text-decoration: none;
        }

        .bc-link:hover { text-decoration: underline; }

        .bc-sep { color: #9b9bb0; }

        .bc-current { color: #6b6b8a; }

        /* Hero */
        .hero {
          text-align: center;
          margin-bottom: 36px;
        }

        .hero-number {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #c9a84c;
          margin-bottom: 8px;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 42px;
          color: #1b1f4a;
          margin: 0 0 16px;
          line-height: 1.1;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 16px;
        }

        .meta-chip {
          font-size: 12px;
          font-weight: 500;
          color: #1b1f4a;
          background: #e8e0d0;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .hero-sub {
          font-size: 15px;
          color: #4a4a6a;
          line-height: 1.7;
          max-width: 580px;
          margin: 0 auto;
          font-style: italic;
        }

        /* Sections */
        .section {
          margin-bottom: 28px;
        }

        .section-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 20px;
          color: #1b1f4a;
          margin: 0 0 12px;
        }

        .traits-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .trait-chip {
          font-size: 13px;
          font-weight: 500;
          color: #1b1f4a;
          background: #ffffff;
          border: 1px solid #d8d0c0;
          padding: 6px 14px;
          border-radius: 20px;
        }

        /* Two column */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
        }

        .info-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(27,31,74,0.08);
        }

        .strengths-card { border-top: 4px solid #4caf82; }
        .challenges-card { border-top: 4px solid #c9a84c; }

        .info-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 10px;
        }

        .strengths-card .info-title { color: #2e7d55; }
        .challenges-card .info-title { color: #a07820; }

        .info-text {
          font-size: 14px;
          color: #3a3a5c;
          line-height: 1.7;
          margin: 0;
        }

        /* CTA */
        .cta-card {
          background: #1b1f4a;
          border-radius: 12px;
          padding: 32px 28px;
          text-align: center;
          margin-bottom: 28px;
        }

        .cta-heading {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 22px;
          color: #c9a84c;
          margin: 0 0 8px;
        }

        .cta-body {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          margin: 0 0 18px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-btn {
          display: inline-block;
          background: #c9a84c;
          color: #1b1f4a;
          font-weight: 700;
          font-size: 14px;
          padding: 10px 24px;
          border-radius: 22px;
          text-decoration: none;
          transition: opacity 150ms;
        }

        .cta-btn:hover { opacity: 0.88; }

        .cta-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin: 10px 0 0;
        }

        /* Prev / Next */
        .nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-prev, .nav-next {
          font-size: 14px;
          font-weight: 600;
          color: #1b1f4a;
          text-decoration: none;
          padding: 8px 16px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(27,31,74,0.08);
          transition: box-shadow 150ms;
        }

        .nav-prev:hover, .nav-next:hover {
          box-shadow: 0 2px 8px rgba(27,31,74,0.15);
        }

        @media (max-width: 580px) {
          .two-col { grid-template-columns: 1fr; }
          .hero-title { font-size: 32px; }
        }
      `}</style>
    </>
  );
};

export default RashiPage;
