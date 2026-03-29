import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

const SignupPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If session returned immediately (email confirmation disabled), go straight to app
    if (data.session) {
      try {
        await api.getMe();
        router.push('/dashboard');
      } catch {
        router.push('/onboarding');
      }
      return;
    }

    // Email confirmation required — show check-email screen
    setDone(true);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Create account · JyotishHardev</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="page">
        <div className="card">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">⊕</span>
          </div>

          {done ? (
            <div className="success-state">
              <div className="success-icon" aria-hidden="true">✉️</div>
              <h1 className="heading">Check your email</h1>
              <p className="success-body">
                We sent a confirmation link to{' '}
                <strong>{email}</strong>. Click the link to activate
                your account, then come back to sign in.
              </p>
              <Link href="/login" className="back-link">
                Back to sign in →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="heading">Create your account</h1>
              <p className="subheading">Start your free 30-day trial — no card needed</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="field">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="field">
                  <label htmlFor="confirm" className="label">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    className="input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <div className="error-box" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || !email || !password || !confirm}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="footer-link">
                Already have an account?{' '}
                <Link href="/login" className="link">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f0e8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .card {
          background: #ffffff;
          border-radius: 12px;
          padding: 40px 32px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 16px rgba(27, 31, 74, 0.1);
        }

        .brand {
          text-align: center;
          margin-bottom: 20px;
        }

        .brand-icon {
          font-size: 36px;
          color: #c9a84c;
        }

        .heading {
          font-family: 'Tiro Devanagari Hindi', Georgia, serif;
          font-size: 28px;
          color: #1b1f4a;
          text-align: center;
          margin-bottom: 8px;
        }

        .subheading {
          font-size: 14px;
          color: #6b6b8a;
          text-align: center;
          margin-bottom: 32px;
        }

        .field {
          margin-bottom: 20px;
        }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }

        .input {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #e0dbd0;
          border-radius: 8px;
          background: #f9f7f2;
          color: #1a1a2e;
          outline: none;
          transition: border-color 150ms ease;
          min-height: 44px;
        }

        .input:focus {
          border-color: #1b1f4a;
          background: #ffffff;
        }

        .error-box {
          background: #fff5f5;
          border: 1.5px solid #ffb3b3;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          color: #c0392b;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 600;
          background: #1b1f4a;
          color: #ffffff;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          transition: opacity 150ms ease;
          min-height: 52px;
          margin-bottom: 24px;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.88;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .footer-link {
          font-size: 14px;
          color: #6b6b8a;
          text-align: center;
        }

        .link {
          color: #1b1f4a;
          font-weight: 600;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }

        /* Success state */
        .success-state {
          text-align: center;
          padding: 8px 0;
        }

        .success-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .success-body {
          font-size: 15px;
          color: #6b6b8a;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .back-link {
          display: inline-block;
          color: #1b1f4a;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

export default SignupPage;
