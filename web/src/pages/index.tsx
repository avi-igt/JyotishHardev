import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from './_app';

const HomePage: NextPage = () => {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.push('/dashboard');
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F5F0E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid #E8E2D9',
            borderTopColor: '#1B1F4A',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style jsx global>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>JyotishHardev — The Persistent Vedic Astrologer</title>
        <meta
          name="description"
          content="Your Vedic astrologer who remembers everything. Milestone predictions, persistent memory, and a track record that builds over years."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="page">
        <div className="container">
          <div className="hero-icon" aria-hidden="true">⊕</div>

          <h1 className="hero-title">JyotishHardev</h1>

          <p className="hero-tagline">
            The Vedic astrologer who remembers.
          </p>

          <p className="hero-body">
            Milestone predictions, persistent memory, and a track record that
            builds over years. Hardev remembers every session — and tracks
            which predictions come true.
          </p>

          <div className="features">
            <div className="feature">
              <span className="feature-icon">🔮</span>
              <span>5-year life timeline generated from your birth chart</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🧠</span>
              <span>Remembers every conversation, forever</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Accuracy score built from confirmed predictions</span>
            </div>
          </div>

          <div className="cta-group">
            <Link href="/signup" className="btn btn-primary">
              Get started free
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Sign in
            </Link>
          </div>

          <p className="footnote">Free · 30-day trial · No credit card needed</p>
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px 60px;
        }

        .container {
          max-width: 480px;
          width: 100%;
          text-align: center;
        }

        .hero-icon {
          font-size: 56px;
          color: #c9a84c;
          margin-bottom: 16px;
          line-height: 1;
        }

        .hero-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 36px;
          color: #1b1f4a;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .hero-tagline {
          font-size: 20px;
          color: #1b1f4a;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .hero-body {
          font-size: 15px;
          color: #6b6b8a;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .features {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: left;
          box-shadow: 0 2px 8px rgba(27, 31, 74, 0.06);
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
          font-size: 14px;
          color: #1a1a2e;
          line-height: 1.5;
          border-bottom: 1px solid #f0ebe0;
        }

        .feature:last-child {
          border-bottom: none;
        }

        .feature-icon {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .cta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn {
          display: block;
          width: 100%;
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 24px;
          text-decoration: none;
          text-align: center;
          transition: opacity 150ms ease;
          min-height: 52px;
          line-height: 24px;
        }

        .btn:hover {
          opacity: 0.88;
        }

        .btn-primary {
          background: #1b1f4a;
          color: #ffffff;
        }

        .btn-secondary {
          background: transparent;
          color: #1b1f4a;
          border: 2px solid #1b1f4a;
        }

        .footnote {
          font-size: 13px;
          color: #6b6b8a;
        }
      `}</style>
    </>
  );
};

export default HomePage;
