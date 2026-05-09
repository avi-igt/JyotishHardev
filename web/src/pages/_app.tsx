import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
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
  );
}
