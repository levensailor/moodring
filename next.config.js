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
    // Build-time instrumentation (shows in Vercel Build Logs)
    // Helps confirm exactly what Vercel is compiling when it reports TSX parse errors.
    try {
      const fs = require('fs');
      const path = require('path');
      const crypto = require('crypto');
      const target = path.join(process.cwd(), 'components', 'board', 'CanvasObject.tsx');
      if (fs.existsSync(target)) {
        const src = fs.readFileSync(target, 'utf8');
        const hash = crypto.createHash('sha1').update(src).digest('hex').slice(0, 12);
        const hasOldTypo = src.includes('fill=\"#666666\"}');
        console.log('[moodring][debug][CanvasObject.tsx]', { isServer, hash, hasOldTypo, bytes: src.length });
      } else {
        console.log('[moodring][debug][CanvasObject.tsx]', { isServer, missing: true });
      }
    } catch (e) {
      console.log('[moodring][debug][CanvasObject.tsx]', { isServer, error: String(e?.message || e) });
    }
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

