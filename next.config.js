/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // #region agent log
    console.log('[DEBUG] Webpack config - isServer:', isServer);
    // #endregion
    
    // Prevent Konva from trying to use Node.js canvas package during build
    // Konva checks for canvas during module resolution, causing build errors
    if (isServer) {
      // On server side, alias canvas to false to prevent resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        'canvas': false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig

