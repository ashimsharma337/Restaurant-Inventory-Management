/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Recommended for Docker / containers
  output: 'standalone',

  eslint: {
    // Prevent build from failing on lint errors in CI
    // (CI already runs lint separately)
    ignoreDuringBuilds: true,
  },

  // Enable this only if you need external images later
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
