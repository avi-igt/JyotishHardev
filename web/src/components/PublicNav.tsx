/**
 * PublicNav — shared navigation bar for all public pages.
 * Uses inline styles to avoid styled-jsx scoping issues.
 */
import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';

interface PublicNavProps {
  activePage?: string;
}

const NAV_LINKS = [
  { label: 'About',        href: '/about',        key: 'about' },
  { label: 'Daily Brief',  href: '/daily',        key: 'daily' },
  { label: 'Transits',     href: '/transits',     key: 'transits' },
  { label: 'Library',      href: '/library',      key: 'library' },
  { label: 'Palmistry',    href: '/palmistry',    key: 'palmistry' },
  { label: 'Til Vichar',   href: '/til-vichar',   key: 'til-vichar' },
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={30} color="#c9a84c" />
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
