'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHydrated } from '@/hooks/useHydrated';
import WalletConnectButton from './WalletConnectButton';
import RevealAnimation from '../animation/RevealAnimation';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isHydrated = useHydrated();

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-[500px] space-y-7 rounded-lg border border-white/10 bg-[#0A0A0A] p-6 text-center shadow-2xl shadow-primary-500/5 sm:p-8">
          <RevealAnimation delay={0.2}>
            <div className="w-20 h-20 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </RevealAnimation>

          <div className="space-y-3">
            <RevealAnimation delay={0.3}>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Access Protected</h2>
            </RevealAnimation>
            <RevealAnimation delay={0.4}>
              <p className="text-white/60 text-lg">
                Please connect your Solana wallet to explore startups, view details, and manage your projects.
              </p>
            </RevealAnimation>
          </div>

          <RevealAnimation delay={0.5}>
            <WalletConnectButton className="btn-xl w-full" />
          </RevealAnimation>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
