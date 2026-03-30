/**
 * /about — About Jyotish Hardev.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

const PILLARS = [
  {
    icon: '◉',
    title: 'Precision Ephemeris',
    body: 'Planetary positions are computed using Swiss Ephemeris — the gold standard in Vedic chart calculation. No guesswork, pure mathematics.',
  },
  {
    icon: '◉',
    title: 'Persistent Memory',
    body: 'Unlike every other astrology app, Hardev remembers every session. He recalls past conversations and builds on them over time.',
  },
  {
    icon: '◉',
    title: 'Measured Accuracy',
    body: 'When you confirm a prediction, Hardev tracks it. Over time, he builds an accuracy score — so you can see how well Vedic astrology applies to your life.',
  },
  {
    icon: '◉',
    title: 'Two Great Traditions',
    body: 'Choose between Parashara and Jaimini traditions at onboarding. Your chosen tradition shapes every reading, every prediction, every conversation.',
  },
];

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About — Jyotish Hardev</title>
        <meta name="description" content="Jyotish Hardev is your personal AI Vedic astrologer — powered by classical wisdom, Swiss Ephemeris, and persistent memory." />
      </Head>

      <PublicNav activePage="about" />

      <main style={{ background: '#0e1235', minHeight: '100vh', color: '#e8e0d0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>

          {/* Hero */}
          <h1 style={{
            fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
            fontSize: 36, fontWeight: 700,
            color: '#c9a84c', marginBottom: 16, lineHeight: 1.25,
          }}>
            About Jyotish Hardev
          </h1>
          <p style={{ fontSize: 18, color: '#e8e0d0', lineHeight: 1.7, marginBottom: 48 }}>
            Jyotish Hardev is your personal AI Astrologer — powered by
            classical Vedic wisdom and modern artificial intelligence.
          </p>

          {/* Mission card */}
          <div style={{
            background: '#1b1f4a',
            borderRadius: 16,
            padding: '32px 28px',
            marginBottom: 56,
            borderLeft: '4px solid #c9a84c',
          }}>
            <p style={{
              fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
              fontSize: 20, color: '#c9a84c',
              lineHeight: 1.5, marginBottom: 16,
            }}>
              "Astrology is only meaningful when it remembers you."
            </p>
            <p style={{ fontSize: 15, color: 'rgba(232,224,208,0.8)', lineHeight: 1.75 }}>
              Most astrology apps treat every session as if it were the first.
              Hardev is different. He keeps a memory of your readings, tracks
              which predictions came true, and grows more insightful with every
              conversation.
            </p>
          </div>

          {/* Pillars */}
          <h2 style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '1.4px',
            textTransform: 'uppercase', color: 'rgba(232,224,208,0.45)',
            marginBottom: 28,
          }}>
            What makes Hardev different
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 56 }}>
            {PILLARS.map(pillar => (
              <div key={pillar.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, color: '#c9a84c', flexShrink: 0, marginTop: 3 }}>
                  {pillar.icon}
                </span>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#e8e0d0', marginBottom: 6 }}>
                    {pillar.title}
                  </p>
                  <p style={{ fontSize: 14, color: 'rgba(232,224,208,0.65)', lineHeight: 1.7 }}>
                    {pillar.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div style={{
            background: '#1b1f4a',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 48,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p style={{ fontSize: 13, color: 'rgba(232,224,208,0.5)', lineHeight: 1.7, textAlign: 'center' }}>
              Hardev respects your privacy. Your birth details and reading
              history are encrypted at rest and never sold. You can delete
              everything from Account → Delete my data.
            </p>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <Link href="/signup" style={{
              display: 'inline-block',
              background: '#c9a84c', color: '#1b1f4a',
              fontWeight: 700, fontSize: 15,
              padding: '14px 36px', borderRadius: 28,
              textDecoration: 'none',
            }}>
              Get started free
            </Link>
          </div>

        </div>
      </main>
    </>
  );
};

export default AboutPage;
