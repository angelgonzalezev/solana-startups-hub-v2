'use client';

import { usePrivy, useConnectWallet } from '@privy-io/react-auth';
import { useStandardWallets } from '@privy-io/react-auth/solana';
import { useWalletConnection } from '@solana/react-hooks';
import { registerWallet } from '@wallet-standard/wallet';
import { useEffect, useRef } from 'react';
import type { Wallet } from '@wallet-standard/base';
import { isPrivyConfigured, isPrivyStandardWallet, walletStandardConnectorId } from '@/lib/privy/config';

// Bridges Privy's wallets into the app's existing Wallet Standard stack:
//  1. registers Privy's embedded wallet in the window registry, which
//     SolanaProvider's watchWalletStandardConnectors picks up and turns into a
//     regular connector - useSplToken/useWalletConnection then treat it like
//     any other wallet, so the payment flow needs no Privy-specific code;
//  2. silently reconnects the embedded wallet for authenticated users so the
//     featured-listing pay button is ready without prompts;
//  3. exposes reconnectPaymentWallet() for external-wallet users whose
//     browser wallet dropped the connection (Privy's connect-only modal).

let registeredPrivyWallet = false;
let reconnectHandler: (() => Promise<void>) | null = null;

export const reconnectPaymentWallet = async () => {
  if (!reconnectHandler) throw new Error('Wallet reconnection is not available.');
  await reconnectHandler();
};

const findPrivyWallet = (wallets: readonly { features: Record<string, unknown> }[]) =>
  wallets.find((wallet) => isPrivyStandardWallet(wallet)) as (Wallet & { accounts: readonly unknown[] }) | undefined;

const PrivyWalletBridgeInner = () => {
  const { authenticated, ready } = usePrivy();
  const { wallets: standardWallets } = useStandardWallets();
  const walletConnection = useWalletConnection();
  const { connectWallet } = useConnectWallet();
  const autoConnectAttempted = useRef(false);

  const privyWallet = findPrivyWallet(standardWallets);
  const privyConnectorId = privyWallet ? walletStandardConnectorId(privyWallet.name) : null;
  const privyConnectorReady = Boolean(
    privyConnectorId && walletConnection.connectors.some((connector) => connector.id === privyConnectorId),
  );

  // 1. Registration. Happens once per page load, as soon as Privy exposes its
  // standard wallet. SolanaProvider only rebuilds its client while no wallet
  // is connected, which is guaranteed on a fresh load and during Privy login.
  useEffect(() => {
    if (registeredPrivyWallet || !privyWallet) return;
    registeredPrivyWallet = true;
    registerWallet(privyWallet);
  }, [privyWallet]);

  // Allow a fresh auto-connect attempt whenever the session identity changes.
  useEffect(() => {
    autoConnectAttempted.current = false;
  }, [authenticated]);

  // 2. Embedded auto-connect: session restored, wallet disconnected, embedded
  // wallet available -> connect silently so payments are one click away.
  useEffect(() => {
    if (!ready || !authenticated || autoConnectAttempted.current) return;
    if (walletConnection.wallet || walletConnection.status === 'connecting') return;
    if (!privyConnectorId || !privyConnectorReady) return;
    if (!privyWallet || privyWallet.accounts.length === 0) return;

    autoConnectAttempted.current = true;
    walletConnection.connect(privyConnectorId, { autoConnect: true }).catch(() => {
      // Non-fatal: the pay button falls back to reconnectPaymentWallet().
    });
  }, [authenticated, privyConnectorId, privyConnectorReady, privyWallet, ready, walletConnection]);

  // 3. Manual reconnect: embedded wallet connects silently; external wallets
  // go through Privy's connect-only modal, then through the matching
  // Wallet Standard connector (one approval in the wallet, no signature).
  useEffect(() => {
    reconnectHandler = async () => {
      if (walletConnection.wallet) return;
      if (privyConnectorId && privyConnectorReady && privyWallet && privyWallet.accounts.length > 0) {
        await walletConnection.connect(privyConnectorId, { autoConnect: true });
        return;
      }
      connectWallet();
    };
    return () => {
      reconnectHandler = null;
    };
  }, [connectWallet, privyConnectorId, privyConnectorReady, privyWallet, walletConnection]);

  return null;
};

export const PrivyWalletBridge = () => (isPrivyConfigured() ? <PrivyWalletBridgeInner /> : null);
