/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static export
  trailingSlash: true, // Optional: Adds trailing slashes to URLs for compatibility with S3
};

module.exports = nextConfig;
