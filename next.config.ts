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

// Origins the browser talks to, derived from env so provider swaps (RPC,
// Supabase project) update the policy on the next deploy automatically.
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const rpcOrigin = new URL(rpcUrl).origin;
const rpcWssOrigin = rpcOrigin.replace(/^http/, 'ws');
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : '';

// Content Security Policy per Privy's production checklist, extended with
// every origin this app actually uses (Supabase, Solana RPCs, WalletConnect,
// onramps, geocoding). 'unsafe-inline' for scripts is required by Next.js's
// bootstrap inline scripts; tightening to nonces would need middleware.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://crypto-js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin} https://explorer-api.walletconnect.com`,
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org',
  'frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://crypto-js.stripe.com https://buy.moonpay.com',
  // apple.com/google.com are the funding modal's Apple Pay / Google Pay
  // availability probes; moonpay/stripe are the onramp quote APIs.
  `connect-src 'self' https://auth.privy.io https://api.privy.io https://*.rpc.privy.systems wss://*.rpc.privy.systems ${rpcOrigin} ${rpcWssOrigin} ${supabaseOrigin} wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://explorer-api.walletconnect.com https://api.relay.link https://photon.komoot.io https://apple.com https://www.apple.com https://google.com https://www.google.com https://api.moonpay.com https://api.stripe.com`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
]
  .filter(Boolean)
  .join('; ');

const nextConfig: NextConfig = {
  async headers() {
    // Dev servers need eval/HMR freedoms the policy forbids; the headers are
    // a production concern (Privy's go-live checklist).
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
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
