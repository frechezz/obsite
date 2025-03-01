import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_GITHUB_OWNER: process.env.GITHUB_OWNER || 'frechezz',
    NEXT_PUBLIC_GITHUB_REPO: process.env.GITHUB_REPO || 'obsidianvault',
    NEXT_PUBLIC_IMAGES_REPO: 'publicobs',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/frechezz/publicobs/**',
      },
    ],
  },
};

export default nextConfig;
