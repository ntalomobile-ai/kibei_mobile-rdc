/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Désactiver ESLint pendant le build pour éviter les avertissements de dépréciation
    // ESLint sera toujours exécuté via `npm run lint` en développement
    ignoreDuringBuilds: true,
  },
  // Proxy API requests to the API server in development
  // This allows cookies to work properly since requests go through the same origin
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Only proxy in development when API is on a different port
    if (process.env.NODE_ENV === 'development' && apiUrl.includes('localhost:3000')) {
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ];
    }
    
    return [];
  },
};

module.exports = nextConfig;
