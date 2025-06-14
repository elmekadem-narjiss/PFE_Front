import path from 'path'

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
@@ -31,4 +32,4 @@ const nextConfig: NextConfig = {
  },
};

export default nextConfig
