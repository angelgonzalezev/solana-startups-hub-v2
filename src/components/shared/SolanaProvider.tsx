'use client';

import { autoDiscover, createClient } from '@solana/client';
import { SolanaProvider as ReactSolanaProvider } from '@solana/react-hooks';
import type { ReactNode } from 'react';

const DEFAULT_RPC_URL = 'https://api.mainnet-beta.solana.com';
let client: ReturnType<typeof createClient> | undefined;

const getClient = () => {
  client ??= createClient({
    endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL,
    walletConnectors: autoDiscover(),
  });
  return client;
};

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  return <ReactSolanaProvider client={getClient()}>{children}</ReactSolanaProvider>;
};
