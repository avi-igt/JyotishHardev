import { GetServerSideProps } from 'next';

const BASE = 'https://jyotishhardev.com';

const NAKSHATRA_SLUGS = [
  'ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra',
  'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva-phalguni', 'uttara-phalguni',
  'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha',
  'mula', 'purva-ashadha', 'uttara-ashadha', 'shravana', 'dhanishtha',
  'shatabhisha', 'purva-bhadrapada', 'uttara-bhadrapada', 'revati',
];

const RASHI_SLUGS = [
  'mesha', 'vrishabha', 'mithuna', 'karka', 'simha', 'kanya',
  'tula', 'vrishchika', 'dhanu', 'makara', 'kumbha', 'meena',
];

function url(loc: string, changefreq: string, priority: string) {
  return `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function SitemapXml() { return null; }

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const entries = [
    url(`${BASE}/`,             'weekly',  '1.0'),
    url(`${BASE}/daily`,        'daily',   '0.9'),
    url(`${BASE}/transits`,     'daily',   '0.9'),
    url(`${BASE}/library`,      'monthly', '0.8'),
    url(`${BASE}/predictions`,  'monthly', '0.8'),
    url(`${BASE}/palmistry`,    'monthly', '0.7'),
    url(`${BASE}/til-vichar`,   'monthly', '0.7'),
    url(`${BASE}/about`,        'monthly', '0.6'),
    ...NAKSHATRA_SLUGS.map(s => url(`${BASE}/nakshatras/${s}`, 'monthly', '0.7')),
    ...RASHI_SLUGS.map(s =>     url(`${BASE}/rashis/${s}`,     'monthly', '0.7')),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(xml);
  res.end();

  return { props: {} };
};

export default SitemapXml;
