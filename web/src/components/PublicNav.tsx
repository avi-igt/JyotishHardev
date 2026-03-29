/**
 * PublicNav — shared navigation bar for all public pages.
 */
import Link from 'next/link';

interface PublicNavProps {
  activePage?: string;
}

export default function PublicNav({ activePage }: PublicNavProps) {
  const links = [
    { label: 'Daily Brief', href: '/daily', key: 'daily' },
    { label: 'Transits',    href: '/transits', key: 'transits' },
    { label: 'Library',     href: '/library', key: 'library' },
    { label: 'Predictions', href: '/predictions', key: 'predictions' },
  ];

  return (
    <header className="pub-nav">
      <Link href="/" className="pub-brand">
        <span className="pub-brand-icon">⊕</span>
        <span className="pub-brand-name">JyotishHardev</span>
      </Link>

      <nav className="pub-nav-links">
        {links.map(({ label, href, key }) => (
          <Link
            key={key}
            href={href}
            className={`pub-nav-link${activePage === key ? ' pub-nav-link--active' : ''}`}
          >
            {label}
          </Link>
        ))}
        <Link href="/login" className="pub-nav-signin">Sign in</Link>
        <Link href="/signup" className="pub-nav-cta">Get started</Link>
      </nav>

      <style jsx>{`
        .pub-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: #1b1f4a;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .pub-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .pub-brand-icon {
          font-size: 22px;
          color: #c9a84c;
        }

        .pub-brand-name {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
        }

        .pub-nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .pub-nav-link {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          font-weight: 500;
          padding-bottom: 2px;
          border-bottom: 2px solid transparent;
          transition: color 150ms, border-color 150ms;
        }

        .pub-nav-link:hover {
          color: #ffffff;
        }

        .pub-nav-link--active {
          color: #c9a84c;
          border-bottom-color: #c9a84c;
        }

        .pub-nav-signin {
          font-size: 14px;
          color: #c9a84c;
          text-decoration: none;
          font-weight: 500;
        }

        .pub-nav-signin:hover {
          text-decoration: underline;
        }

        .pub-nav-cta {
          font-size: 13px;
          font-weight: 600;
          color: #1b1f4a;
          background: #c9a84c;
          padding: 7px 16px;
          border-radius: 20px;
          text-decoration: none;
          transition: opacity 150ms;
        }

        .pub-nav-cta:hover {
          opacity: 0.88;
        }

        @media (max-width: 640px) {
          .pub-nav-link {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
