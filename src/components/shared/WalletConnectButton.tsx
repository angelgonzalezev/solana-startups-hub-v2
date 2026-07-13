'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useHydrated } from '@/hooks/useHydrated';

interface WalletConnectButtonProps {
  className?: string;
}

const truncateAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ className = '' }) => {
  const { availableWallets, error, isAuthenticated, isSigningIn, signIn, walletAddress } = useAuth();
  const isHydrated = useHydrated();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setIsModalOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSigningIn) setIsModalOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, isSigningIn]);

  if (isHydrated && isAuthenticated && walletAddress) {
    return (
      <Link
        href="/dashboard"
        aria-label="Open wallet profile"
        className={`btn btn-white-dark hover:btn-primary transition-all duration-300 ${className}`}>
        {truncateAddress(walletAddress)}
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isHydrated || isSigningIn}
        className={`btn btn-primary hover:btn-white transition-all duration-300 shadow-lg shadow-primary-500/20 disabled:cursor-wait disabled:opacity-60 ${className}`}>
        {isSigningIn ? 'Signing in...' : 'Connect Wallet'}
      </button>

      {isHydrated &&
        isModalOpen &&
        createPortal(
          <div
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isSigningIn) setIsModalOpen(false);
            }}
            className="fixed inset-0 z-[10000] grid min-h-[100dvh] place-items-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="wallet-dialog-title"
              className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-white/10 bg-[#0A0A0A] p-5 shadow-2xl shadow-primary-500/10 sm:max-h-[calc(100dvh-3rem)] sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                  <h2 id="wallet-dialog-title" className="text-xl font-semibold text-white">
                    Sign in with Solana
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Select a wallet, then sign the free message that proves ownership of your address.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close wallet dialog"
                  disabled={isSigningIn}
                  onClick={() => setIsModalOpen(false)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xl text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-40">
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {availableWallets.map((wallet) => (
                  <button
                    type="button"
                    key={wallet.id}
                    disabled={!wallet.ready || isSigningIn}
                    onClick={() => void signIn(wallet.id)}
                    className="flex w-full items-center gap-4 rounded-md border border-white/10 bg-black px-4 py-3.5 text-left text-white transition hover:border-primary-500/50 hover:bg-primary-500/5 disabled:cursor-not-allowed disabled:opacity-45 sm:px-5 sm:py-4">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9945FF]/25 to-[#14F195]/20 font-semibold">
                      {wallet.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="font-medium">{wallet.name}</span>
                    {!wallet.ready && <span className="ml-auto text-xs text-white/40">Unavailable</span>}
                  </button>
                ))}

                {availableWallets.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black p-5 text-sm leading-6 text-white/55">
                    No Wallet Standard compatible extension was detected. Install Phantom, Solflare, Backpack, or
                    another compatible Solana wallet and reload the page.
                  </div>
                )}
              </div>

              {error && <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default WalletConnectButton;
