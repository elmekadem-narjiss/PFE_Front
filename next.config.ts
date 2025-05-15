import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add core-js as a fallback for client-side bundles
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'core-js/modules/es.array.index-of': path.resolve('node_modules/core-js/modules/es.array.index-of.js'),
      'core-js/modules/es.string.trim': path.resolve('node_modules/core-js/modules/es.string.trim.js'),
      'core-js/modules/es.string.includes': path.resolve('node_modules/core-js/modules/es.string.includes.js'),
      'core-js/modules/es.array.reverse': path.resolve('node_modules/core-js/modules/es.array.reverse.js'),
    };

    return config;
  },
};

export default nextConfig;