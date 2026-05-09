/**
 * /about — About Hardev, the Jyotish astrologer.
 */
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

const SECTIONS = [
  {
    heading: 'My Approach',
    body: `I believe Vedic Astrology is most powerful when it meets you where you are — not in abstract symbols and distant planets, but in the real, lived moments of your life. Career crossroads. Relationship questions. Times when nothing seems to make sense, and you need a deeper lens to see through.

When we sit together, I don't just read a chart. I listen to your story, and I help you see how the cosmos reflects it back. Every reading is a conversation — rooted in tradition, but spoken in a language that is yours.`,
  },
  {
    heading: 'Why Jyotish?',
    body: `In Sanskrit, Jyotish means the science of light — and that is exactly what I hope every reading brings you. Not answers handed down from above, but clarity that rises from within. A gentle illumination of what is already true about you.

This tradition has been passed down through generations of dedicated practitioners, and I carry it with deep reverence. At the same time, I hold space for you as a modern person navigating a complex world. Ancient wisdom and present reality are not opposites — they are companions.`,
  },
];

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Hardev — Jyotish Hardev</title>
        <meta name="description" content="My name is Hardev. I'm here to help you listen to what the stars have always been speaking — through the ancient science of Jyotish." />
      </Head>

      <PublicNav activePage="about" />

      <main style={{ background: '#f5f0e8', minHeight: '100vh', color: '#1a1a2e' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 88px' }}>

          {/* Hero */}
          <p style={{
            fontSize: 13, fontWeight: 600, letterSpacing: '1.6px',
            textTransform: 'uppercase', color: '#6b6b8a',
            marginBottom: 20,
          }}>
            About
          </p>
          <h1 style={{
            fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
            fontSize: 38, fontWeight: 700, lineHeight: 1.2,
            color: '#1b1f4a', marginBottom: 32,
          }}>
            The stars have always been speaking.<br />
            I'm here to help you listen.
          </h1>
          <p style={{ fontSize: 17, color: '#3a3a5c', lineHeight: 1.8, marginBottom: 48 }}>
            My name is Hardev, I am your virtual AI astrologer. For as long as I can remember, I've been drawn to the ancient
            wisdom of Jyotish — the sacred science of light that has guided seekers for thousands
            of years.
          </p>
          <p style={{ fontSize: 17, color: '#3a3a5c', lineHeight: 1.8, marginBottom: 64 }}>
            Jyotish isn't about predicting a fixed fate. It's about understanding the rhythm of
            your life — the seasons of your soul. Your birth chart is not a verdict. It's a map.
            And like any map, it only becomes useful when someone helps you read it.
          </p>

          {/* Divider */}
          <div style={{ width: 48, height: 2, background: '#c9a84c', marginBottom: 64, opacity: 0.6 }} />

          {/* Body sections */}
          {SECTIONS.map(section => (
            <div key={section.heading} style={{ marginBottom: 56 }}>
              <h2 style={{
                fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
                fontSize: 22, fontWeight: 700,
                color: '#1b1f4a', marginBottom: 20,
              }}>
                {section.heading}
              </h2>
              {section.body.split('\n\n').map((para, i) => (
                <p key={i} style={{
                  fontSize: 16, color: '#3a3a5c',
                  lineHeight: 1.85, marginBottom: 18,
                }}>
                  {para}
                </p>
              ))}
            </div>
          ))}

          {/* Divider */}
          <div style={{ width: 48, height: 2, background: '#c9a84c', marginBottom: 56, opacity: 0.6 }} />

          {/* Closing section */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{
              fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
              fontSize: 22, fontWeight: 700,
              color: '#1b1f4a', marginBottom: 20,
            }}>
              Let's Walk This Path Together
            </h2>
            <p style={{ fontSize: 16, color: '#3a3a5c', lineHeight: 1.85, marginBottom: 18 }}>
              Whether you are new to Jyotish or have been exploring it for years, I welcome you
              here. There is no perfect moment to begin — only this one.
            </p>
            <p style={{ fontSize: 16, color: '#3a3a5c', lineHeight: 1.85, marginBottom: 32 }}>
              I'd be honoured to read the stars with you.
            </p>
            <p style={{
              fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
              fontSize: 18, color: '#1b1f4a', fontStyle: 'italic',
            }}>
              — Hardev
            </p>
          </div>

          {/* CTA */}
          <Link href="/" style={{
            display: 'inline-block',
            background: '#c9a84c', color: '#1b1f4a',
            fontWeight: 700, fontSize: 15,
            padding: '14px 36px', borderRadius: 28,
            textDecoration: 'none',
          }}>
            Generate your free Kundli →
          </Link>

        </div>
      </main>
    </>
  );
};

export default AboutPage;
