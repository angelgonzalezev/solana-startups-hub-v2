'use client';

import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { useMemo, type ReactNode } from 'react';
import { isPrivyConfigured, toWssEndpoint } from '@/lib/privy/config';

const DEFAULT_RPC_URL = 'https://api.mainnet-beta.solana.com';

// Same custom RPC as SolanaProvider: the public endpoint 403s browser calls,
// so every Privy-internal Solana request must go through it too.
const ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL;

const buildPrivyClientConfig = (): PrivyClientConfig => ({
  appearance: {
    accentColor: '#9945FF',
    landingHeader: 'Sign in to Orbital',
    showWalletLoginFirst: false,
    theme: 'dark',
    walletChainType: 'solana-only',
  },
  embeddedWallets: {
    ethereum: { createOnLogin: 'off' },
    // Silent signing: SIWS for the Supabase session and the USDC transfer run
    // without Privy confirmation modals - the app owns that UI.
    showWalletUIs: false,
    solana: { createOnLogin: 'users-without-wallets' },
  },
  externalWallets: {
    solana: { connectors: toSolanaWalletConnectors() },
  },
  loginMethods: ['email', 'google', 'wallet'],
  solana: {
    rpcs: {
      'solana:mainnet': {
        rpc: createSolanaRpc(ENDPOINT),
        rpcSubscriptions: createSolanaRpcSubscriptions(toWssEndpoint(ENDPOINT)),
      },
    },
  },
});

const ConfiguredPrivyProvider = ({ children }: { children: ReactNode }) => {
  const config = useMemo(buildPrivyClientConfig, []);
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || undefined}
      config={config}>
      {children}
    </PrivyProvider>
  );
};

// Without an app id the tree renders Privy-less and the auth context degrades
// to a disabled state, mirroring how the app behaves without Supabase env.
export const PrivyProviderWrapper = ({ children }: { children: ReactNode }) =>
  isPrivyConfigured() ? <ConfiguredPrivyProvider>{children}</ConfiguredPrivyProvider> : <>{children}</>;
