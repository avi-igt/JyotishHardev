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

          /* Google Places autocomplete dropdown */
          .pac-container {
            background: #ffffff;
            border: 1px solid rgba(27,31,74,0.15);
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(27,31,74,0.12);
            margin-top: 4px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
          }
          .pac-item {
            padding: 10px 14px;
            border-top: 1px solid rgba(27,31,74,0.06);
            color: #1a1a2e;
            cursor: pointer;
            line-height: 1.4;
          }
          .pac-item:first-child { border-top: none; }
          .pac-item:hover,
          .pac-item-selected {
            background: #f5f0e8;
          }
          .pac-item-query {
            font-size: 14px;
            font-weight: 600;
            color: #1b1f4a;
          }
          .pac-matched { color: #c9a84c; }
          .pac-icon { display: none; }
          .pac-logo::after { display: none; }
        `}</style>
        <Component {...pageProps} />
      </>
  );
}
