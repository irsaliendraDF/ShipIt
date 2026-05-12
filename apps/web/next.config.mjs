/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shipit-fun/ui', '@shipit-fun/gesture-core'],
  // ESLint runs separately via `npm run lint`. We skip it during `next build`
  // so intentional design content (e.g. literal `// label` text rendered as
  // styled labels) doesn't trigger `react/jsx-no-comment-textnodes` false
  // positives and block deploys.
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
