import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mp4$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
