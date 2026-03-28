import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  name?: string;
  email?: string;
  dob?: string;
  pob?: string;
  tradition?: string;
  lagna?: string;
  moon_sign?: string;
  trial_expires_at?: string;
  subscription_status?: 'trial' | 'active' | 'expired';
  share_token?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trialDaysRemaining(expiresAt: string): number {
  const exp = new Date(expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((exp - now) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────────

const AccountPage: NextPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    api.getMe()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shareUrl = profile?.share_token
    ? `https://jyotishhardev.com/share/${profile.share_token}`
    : null;

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  const isTrial = !profile?.subscription_status || profile.subscription_status === 'trial';
  const isExpired = profile?.subscription_status === 'expired';
  const daysLeft = profile?.trial_expires_at ? trialDaysRemaining(profile.trial_expires_at) : null;
  const nearExpiry = daysLeft !== null && daysLeft <= 5;

  return (
    <Layout>
      <Head>
        <title>Account · JyotishHardev</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page-body">
        <h1 className="page-title">Account</h1>

        {loading ? (
          <div className="loading">
            <div className="spinner" aria-label="Loading account" />
          </div>
        ) : (
          <>
            {/* Profile info */}
            <section className="card" aria-label="Profile information">
              <h2 className="card-title">Your details</h2>

              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-val">{profile?.name ?? '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date of birth</span>
                <span className="info-val">{formatDate(profile?.dob)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Place of birth</span>
                <span className="info-val">{profile?.pob ?? '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tradition</span>
                <span className="info-val info-val--capitalize">{profile?.tradition ?? '—'}</span>
              </div>
              {profile?.lagna && (
                <div className="info-row">
                  <span className="info-label">Lagna</span>
                  <span className="info-val">{profile.lagna}</span>
                </div>
              )}
              {profile?.moon_sign && (
                <div className="info-row">
                  <span className="info-label">Moon sign</span>
                  <span className="info-val">{profile.moon_sign}</span>
                </div>
              )}
            </section>

            {/* Subscription status */}
            <section className="card" aria-label="Subscription status">
              <h2 className="card-title">Subscription</h2>

              {isExpired || (isTrial && nearExpiry) ? (
                <>
                  <div className="status-badge status-badge--warn">
                    {isExpired ? 'Trial ended' : `Trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                  </div>
                  <p className="upgrade-copy">
                    Your chart and timeline are yours forever. To continue your
                    conversation with Hardev, upgrade for ₹199/month.
                  </p>
                  <button className="upgrade-btn">
                    Continue with Hardev →
                  </button>
                </>
              ) : isTrial ? (
                <div className="status-badge status-badge--ok">
                  Trial active{daysLeft !== null ? ` — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining` : ''}
                </div>
              ) : (
                <div className="status-badge status-badge--ok">
                  Subscription active
                </div>
              )}
            </section>

            {/* Share timeline */}
            {shareUrl && (
              <section className="card" aria-label="Share your timeline">
                <h2 className="card-title">Share your timeline</h2>
                <p className="share-label">Your public timeline link:</p>
                <div className="share-row">
                  <span className="share-url">{shareUrl}</span>
                  <button
                    className="copy-btn"
                    onClick={handleCopy}
                    aria-label="Copy share link"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </section>
            )}

            {/* Danger zone */}
            <div className="danger-zone">
              <button
                className="signout-btn"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
              <button className="delete-btn" disabled>
                Delete account
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .page-body {
          padding: 24px 16px 100px;
          max-width: 600px;
          margin: 0 auto;
        }

        .page-title {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 26px;
          color: #1b1f4a;
          margin-bottom: 24px;
        }

        .loading {
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e8e2d9;
          border-top-color: #1b1f4a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Card */
        .card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(27, 31, 74, 0.06);
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 13px;
          font-weight: 700;
          color: #6b6b8a;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 16px;
        }

        /* Info rows */
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #f0ebe0;
          gap: 16px;
          font-size: 14px;
        }

        .info-row:last-child { border-bottom: none; }

        .info-label {
          color: #6b6b8a;
          flex-shrink: 0;
        }

        .info-val {
          color: #1a1a2e;
          font-weight: 500;
          text-align: right;
        }

        .info-val--capitalize {
          text-transform: capitalize;
        }

        /* Status badge */
        .status-badge {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .status-badge--ok {
          background: #f0fdf4;
          color: #166534;
        }

        .status-badge--warn {
          background: #fff8e6;
          color: #7a5c00;
        }

        .upgrade-copy {
          font-size: 14px;
          color: #6b6b8a;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .upgrade-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          min-height: 52px;
          transition: opacity 150ms ease;
        }

        .upgrade-btn:hover { opacity: 0.88; }

        /* Share */
        .share-label {
          font-size: 13px;
          color: #6b6b8a;
          margin-bottom: 10px;
        }

        .share-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f9f7f2;
          border: 1.5px solid #e0dbd0;
          border-radius: 8px;
          padding: 10px 12px;
        }

        .share-url {
          flex: 1;
          font-size: 13px;
          color: #1b1f4a;
          word-break: break-all;
          line-height: 1.4;
        }

        .copy-btn {
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          min-height: 36px;
          flex-shrink: 0;
          transition: opacity 150ms ease;
        }

        .copy-btn:hover { opacity: 0.88; }

        /* Danger zone */
        .danger-zone {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .signout-btn {
          width: 100%;
          padding: 12px;
          font-size: 15px;
          font-weight: 600;
          background: transparent;
          color: #1b1f4a;
          border: 2px solid #1b1f4a;
          border-radius: 24px;
          cursor: pointer;
          min-height: 52px;
          transition: background 150ms ease;
        }

        .signout-btn:hover:not(:disabled) {
          background: #f0edf8;
        }

        .signout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .delete-btn {
          background: transparent;
          color: #c0392b;
          border: none;
          font-size: 14px;
          text-decoration: underline;
          cursor: not-allowed;
          padding: 8px 0;
          opacity: 0.6;
          text-align: center;
        }
      `}</style>
    </Layout>
  );
};

export default AccountPage;
