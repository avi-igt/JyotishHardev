/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
  },
  // Expose NEXT_PUBLIC_ vars client-side (Next.js does this automatically,
  // but listing them here documents what this app needs)
  // NEXT_PUBLIC_SUPABASE_URL
  // NEXT_PUBLIC_SUPABASE_ANON_KEY
  // NEXT_PUBLIC_API_URL
  // NEXT_PUBLIC_GOOGLE_PLACES_KEY
};

module.exports = nextConfig;
