/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shipit-fun/ui', '@shipit-fun/gesture-core'],
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
