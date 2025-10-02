import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation: Configuration pour les performances
  experimental: {
    optimizePackageImports: ['lottie-web'], // Tree-shaking pour Lottie
  },
  
  // Optimisation: Compression et cache
  compress: true,
  
  // Optimisation: Headers de performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
      {
        source: '/Bouncing Square.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ];
  },

  // Optimisation: Images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 an
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimisation: Webpack
  webpack: (config, { dev, isServer }) => {
    // Optimisation: Tree-shaking pour Lottie
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          lottie: {
            test: /[\\/]node_modules[\\/]lottie-web[\\/]/,
            name: 'lottie',
            chunks: 'async',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
