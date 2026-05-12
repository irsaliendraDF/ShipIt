/** @type {import('next').NextConfig} */

/**
 * Content Security Policy applied to every embedded experiment under
 * /games-static/*. This is the primary technical guardrail against a
 * malicious or careless contributor: even if a PR slips through review
 * with a fetch() to an attacker server, the browser will block it.
 *
 * What's intentionally allowed:
 *   - `self` for scripts/styles/images/fonts (their own assets)
 *   - `cdn.jsdelivr.net`, `unpkg.com` for MediaPipe and small libs
 *   - `storage.googleapis.com` for MediaPipe model assets
 *   - `data:` and `blob:` for canvas/wasm/audio/image dataurls
 *   - `'unsafe-inline'` for styles/scripts (legacy game code), `'unsafe-eval'`
 *     for wasm + MediaPipe. We accept this risk because experiments are
 *     same-origin and the host page never includes their script directly.
 *
 * What's blocked:
 *   - Arbitrary `connect-src` (no exfiltration to attacker servers)
 *   - Arbitrary script-src origins (no remote code injection via <script src=>)
 *   - Framing the page anywhere except our own origin
 *   - Top-level form submissions (no phishing post-back)
 *   - <base> hijacks
 *   - Object/embed plugins
 */
const experimentCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https://cdn.jsdelivr.net",
  "media-src 'self' data: blob:",
  "connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://storage.googleapis.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "form-action 'none'",
  "base-uri 'none'",
  "object-src 'none'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shipit-fun/ui', '@shipit-fun/gesture-core'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/games-static/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: experimentCsp },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
};

export default nextConfig;
