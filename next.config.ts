import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation: Configuration pour les performances
  experimental: {
    optimizePackageImports: ['lottie-web'], // Tree-shaking pour Lottie
  },
  
  // Optimisation: Compression et cache
  compress: true,
  
  // Headers de sécurité et performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Performance
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Sécurité
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/**',
      },
    ],
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
