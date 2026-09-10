import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's0.wordpress.com',
      },
    ],
  },
};

export default nextConfig;
