import type { AppProps } from 'next/app';
import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

interface AuthContext {
  session: Session | null;
  loading: boolean;
}

const AuthCtx = createContext<AuthContext>({ session: null, loading: true });
export const useAuth = () => useContext(AuthCtx);

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/share'];

export default function App({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.some(
      (r) => router.pathname === r || router.pathname.startsWith('/share')
    );
    if (!session && !isPublic) router.push('/login');
  }, [session, loading, router.pathname]);

  return (
    <AuthCtx.Provider value={{ session, loading }}>
      <>
        <style jsx global>{`
          *,
          *::before,
          *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          html {
            -webkit-text-size-adjust: 100%;
          }

          body {
            background-color: #f5f0e8;
            color: #1a1a2e;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              sans-serif;
            font-size: 16px;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }

          a {
            color: inherit;
          }

          button {
            cursor: pointer;
          }
        `}</style>
        <Component {...pageProps} />
      </>
    </AuthCtx.Provider>
  );
}
