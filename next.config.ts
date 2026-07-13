import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseMediaPattern = supabaseUrl
  ? (() => {
      const url = new URL(supabaseUrl);
      return {
        protocol: url.protocol.slice(0, -1) as 'http' | 'https',
        hostname: url.hostname,
        port: url.port,
        pathname: '/storage/v1/object/public/media/**',
      };
    })()
  : null;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: '/docs/index.html',
      },
      {
        source: '/docs/:path((?!.*\\.).*)',
        destination: '/docs/:path.html',
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      '@': './src',
      '@public': './public',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      ...(supabaseMediaPattern ? [supabaseMediaPattern] : []),
    ],
  },
};

export default nextConfig;
