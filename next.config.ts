import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Expose environment variables to the client side
  env: {
    NEXT_PUBLIC_KEYCLOAK_URL: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    NEXT_PUBLIC_KEYCLOAK_REALM: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  },

  webpack: (config, { isServer }) => {
    // Preserve the existing core-js fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'core-js/modules/es.array.index-of': path.resolve('node_modules/core-js/modules/es.array.index-of.js'),
      'core-js/modules/es.string.trim': path.resolve('node_modules/core-js/modules/es.string.trim.js'),
      'core-js/modules/es.string.includes': path.resolve('node_modules/core-js/modules/es.string.includes.js'),
      'core-js/modules/es.array.reverse': path.resolve('node_modules/core-js/modules/es.array.reverse.js'),
    };

    // Ensure keycloak-js is properly handled (optional, based on your needs)
    if (!isServer) {
      config.externals = {
        ...config.externals,
        'keycloak-js': 'Keycloak', // Ensure Keycloak is available globally if needed
      };
    }

    return config;
  },
};

export default nextConfig;

//test
