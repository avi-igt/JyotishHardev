import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/favicon-512x512.png" />
        <meta name="theme-color" content="#1b1f4a" />
        <meta property="og:image" content="https://jyotishhardev.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="JyotishHardev — Vedic Astrology" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://jyotishhardev.com/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
