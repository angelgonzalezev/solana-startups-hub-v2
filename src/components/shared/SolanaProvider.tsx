'use client';

import { autoDiscover, createClient, watchWalletStandardConnectors } from '@solana/client';
import { SolanaProvider as ReactSolanaProvider } from '@solana/react-hooks';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const DEFAULT_RPC_URL = 'https://api.mainnet-beta.solana.com';
const ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL;

let initialClient: ReturnType<typeof createClient> | undefined;

const getInitialClient = () => {
  initialClient ??= createClient({
    endpoint: ENDPOINT,
    walletConnectors: autoDiscover(),
  });
  return initialClient;
};

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState(getInitialClient);
  // Live reference for the event callback plus the handle to the client the
  // tree is still rendering with, so replacement can be decided outside React
  // and destruction deferred until after the switch.
  const clientRef = useRef(client);
  const renderedClientRef = useRef(client);

  useEffect(() => {
    // Wallets often register after hydration (in-app browsers, the Privy
    // bridge); the client's connector registry is frozen at creation, so
    // build a replacement when a new Wallet Standard wallet appears. All of
    // this happens in the event callback — never inside a setState updater,
    // which React runs during render (destroying the old client there emits
    // store updates into other components mid-render).
    const stop = watchWalletStandardConnectors((connectors) => {
      const current = clientRef.current;
      const knownIds = new Set(current.connectors.all.map((connector) => connector.id));
      if (!connectors.some((connector) => !knownIds.has(connector.id))) return;

      const { status } = current.store.getState().wallet;
      if (status === 'connected' || status === 'connecting') return;

      const next = createClient({ endpoint: ENDPOINT, walletConnectors: connectors });
      clientRef.current = next;
      setClient(next);
    });
    return stop;
  }, []);

  // Destroy the replaced client only after the tree re-rendered with the new
  // one — nothing is subscribed to it anymore at that point.
  useEffect(() => {
    const previous = renderedClientRef.current;
    if (previous === client) return;
    renderedClientRef.current = client;
    if (previous === initialClient) initialClient = undefined;
    previous.destroy();
  }, [client]);

  return <ReactSolanaProvider client={client}>{children}</ReactSolanaProvider>;
};
