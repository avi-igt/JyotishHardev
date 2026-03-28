import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface NavTab {
  href: string;
  label: string;
  icon: string;
}

const NAV_TABS: NavTab[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊕' },
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/events', label: 'Events', icon: '📅' },
  { href: '/account', label: 'Account', icon: '☽' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="layout">
      <main className="layout-main">{children}</main>

      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {NAV_TABS.map((tab) => {
          const isActive = router.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`nav-tab${isActive ? ' nav-tab--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-tab-icon" aria-hidden="true">
                {tab.icon}
              </span>
              <span className="nav-tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .layout {
          min-height: 100vh;
          background-color: #f5f0e8;
          display: flex;
          flex-direction: column;
        }

        .layout-main {
          flex: 1;
          padding-bottom: 72px;
        }

        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #ffffff;
          border-top: 1px solid #e8e2d9;
          display: flex;
          align-items: stretch;
          z-index: 100;
          box-shadow: 0 -2px 8px rgba(27, 31, 74, 0.06);
        }

        .nav-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          text-decoration: none;
          color: #6b6b8a;
          font-size: 10px;
          font-weight: 500;
          min-height: 44px;
          transition: color 150ms ease;
        }

        .nav-tab--active {
          color: #c9a84c;
        }

        .nav-tab-icon {
          font-size: 18px;
          line-height: 1;
        }

        .nav-tab-label {
          font-size: 10px;
          letter-spacing: 0.3px;
        }
      `}</style>
    </div>
  );
}
