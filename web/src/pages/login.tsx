import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Check if profile exists
      try {
        await api.getMe();
        router.push('/dashboard');
      } catch (profileErr: any) {
        if (profileErr?.status === 404) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign in · JyotishHardev</title>
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

          <h1 className="heading">Welcome back</h1>
          <p className="subheading">Sign in to your JyotishHardev account</p>

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
                placeholder="Your password"
                required
                autoComplete="current-password"
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
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="footer-link">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="link">
              Sign up free
            </Link>
          </p>
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
      `}</style>
    </>
  );
};

export default LoginPage;
