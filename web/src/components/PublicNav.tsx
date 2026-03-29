/**
 * PublicNav — shared navigation bar for all public pages.
 * Uses inline styles to avoid styled-jsx scoping issues.
 */
import Link from 'next/link';
import { useState } from 'react';

interface PublicNavProps {
  activePage?: string;
}

const NAV_LINKS = [
  { label: 'Daily Brief',  href: '/daily',       key: 'daily' },
  { label: 'Transits',     href: '/transits',     key: 'transits' },
  { label: 'Library',      href: '/library',      key: 'library' },
  { label: 'Predictions',  href: '/predictions',  key: 'predictions' },
];

export default function PublicNav({ activePage }: PublicNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: '#1b1f4a',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxSizing: 'border-box',
      }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 22, color: '#c9a84c' }}>⊕</span>
          <span style={{
            fontSize: 16, fontWeight: 600, color: '#ffffff',
            fontFamily: "'Tiro Devanagari Hindi', Georgia, serif",
          }}>JyotishHardev</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="pub-desktop-nav">
          {NAV_LINKS.map(({ label, href, key }) => (
            <Link key={key} href={href} style={{
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              color: activePage === key ? '#c9a84c' : 'rgba(255,255,255,0.8)',
              borderBottom: activePage === key ? '2px solid #c9a84c' : '2px solid transparent',
              paddingBottom: 2,
            }}>{label}</Link>
          ))}
          <Link href="/login" style={{ fontSize: 14, color: '#c9a84c', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            fontSize: 13, fontWeight: 600, color: '#1b1f4a',
            background: '#c9a84c', padding: '7px 16px',
            borderRadius: 20, textDecoration: 'none',
          }}>Get started</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="pub-hamburger"
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#c9a84c', fontSize: 22, padding: 4,
          }}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: '#1b1f4a',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          position: 'sticky',
          top: 52,
          zIndex: 99,
        }} className="pub-mobile-menu">
          {NAV_LINKS.map(({ label, href, key }) => (
            <Link key={key} href={href} onClick={() => setMenuOpen(false)} style={{
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              color: activePage === key ? '#c9a84c' : 'rgba(255,255,255,0.85)',
            }}>{label}</Link>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{
            fontSize: 15, color: '#c9a84c', textDecoration: 'none', fontWeight: 500,
          }}>Sign in</Link>
          <Link href="/signup" onClick={() => setMenuOpen(false)} style={{
            fontSize: 15, fontWeight: 700, color: '#1b1f4a',
            background: '#c9a84c', padding: '10px 20px',
            borderRadius: 20, textDecoration: 'none', textAlign: 'center',
          }}>Get started free</Link>
        </div>
      )}

      <style global jsx>{`
        @media (max-width: 680px) {
          .pub-desktop-nav { display: none !important; }
          .pub-hamburger { display: block !important; }
        }
        @media (min-width: 681px) {
          .pub-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}
