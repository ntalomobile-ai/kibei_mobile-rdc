/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Désactiver ESLint pendant le build pour éviter les avertissements de dépréciation
    // ESLint sera toujours exécuté via `npm run lint` en développement
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
