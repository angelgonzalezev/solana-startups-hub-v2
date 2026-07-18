'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useHydrated } from '@/hooks/useHydrated';

interface WalletConnectButtonProps {
  className?: string;
}

const truncateAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

// Privy's modal owns the whole sign-in surface (email, Google, wallet list,
// mobile deeplinks), so this collapses to a single entry button plus the
// signed-in state.
const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ className = '' }) => {
  const { error, isAuthenticated, isSigningIn, signIn, walletAddress } = useAuth();
  const isHydrated = useHydrated();

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

  const button = (
    <button
      onClick={() => void signIn()}
      disabled={!isHydrated || isSigningIn}
      className={`btn btn-primary hover:btn-white transition-all duration-300 shadow-lg shadow-primary-500/20 disabled:cursor-wait disabled:opacity-60 ${className}`}>
      {isSigningIn ? 'Signing in...' : 'Sign in'}
    </button>
  );

  if (!error) return button;

  return (
    <div className="flex flex-col items-stretch">
      {button}
      <p className="mt-2 max-w-60 text-xs leading-4 text-red-300">{error}</p>
    </div>
  );
};

export default WalletConnectButton;
