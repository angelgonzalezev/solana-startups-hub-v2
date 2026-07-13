'use client';

import { useWalletConnection } from '@solana/react-hooks';
import { useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { userService } from '@/services/userService';
import type { User } from '@/interface/user';

export type WalletOption = {
  icon?: string;
  id: string;
  name: string;
  ready: boolean;
};

export type InitialAuthState = {
  profile: User | null;
  resolved: boolean;
  walletAddress: string | null;
};

interface AuthContextType {
  availableWallets: WalletOption[];
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  isWalletConnected: boolean;
  refreshUser: () => Promise<void>;
  signIn: (connectorId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
  walletAddress: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const errorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Wallet authentication failed.';

  if (/web3 provider is disabled/i.test(message)) {
    return 'Wallet sign-in is disabled in Supabase. Enable Authentication → Providers → Web3 in the Supabase dashboard, then try again.';
  }

  return message;
};

export const AuthProvider = ({
  children,
  initialAuth,
}: {
  children: React.ReactNode;
  initialAuth: InitialAuthState;
}) => {
  const router = useRouter();
  const walletConnection = useWalletConnection();
  const [walletAddress, setWalletAddress] = useState<string | null>(initialAuth.walletAddress);
  const [user, setUser] = useState<User | null>(initialAuth.profile);
  const [isLoading, setIsLoading] = useState(!initialAuth.resolved);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingSignIn = useRef(false);
  const authenticationInFlight = useRef(false);

  const refreshProfile = useCallback(async () => {
    const profile = await userService.getCurrentUser();
    setUser(profile);
    setWalletAddress(profile?.walletAddress || null);
    return profile;
  }, []);

  const completeSignIn = useCallback(async () => {
    const wallet = walletConnection.wallet;
    if (!pendingSignIn.current || authenticationInFlight.current || !wallet) return;
    if (!wallet.signMessage) {
      pendingSignIn.current = false;
      setIsSigningIn(false);
      setError('This wallet does not support message signing required by SIWS.');
      return;
    }

    authenticationInFlight.current = true;
    setError(null);

    try {
      const address = wallet.account.address.toString();
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        options: {
          url: `${window.location.origin}/`,
        },
        statement: 'Sign in to Solana Startups Hub.',
        wallet: {
          publicKey: { toBase58: () => address },
          signMessage: (message) => wallet.signMessage?.(message),
        },
      });
      if (signInError) throw signInError;

      const profileResponse = await fetch('/api/auth/profile', {
        body: JSON.stringify({ walletAddress: address }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const profileResult = (await profileResponse.json().catch(() => null)) as { error?: string } | null;
      if (!profileResponse.ok) throw new Error(profileResult?.error || 'Unable to create wallet profile.');

      await refreshProfile();
      router.replace('/startups');
    } catch (signInFailure) {
      await getSupabaseBrowserClient()
        .auth.signOut()
        .catch(() => undefined);
      setError(errorMessage(signInFailure));
    } finally {
      authenticationInFlight.current = false;
      pendingSignIn.current = false;
      setIsSigningIn(false);
      setIsLoading(false);
    }
  }, [refreshProfile, router, walletConnection.wallet]);

  useEffect(() => {
    void completeSignIn();
  }, [completeSignIn]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setWalletAddress(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const connectedAddress = walletConnection.wallet?.account.address.toString();
    if (connectedAddress && walletAddress && connectedAddress !== walletAddress && !isSigningIn) {
      void getSupabaseBrowserClient().auth.signOut();
      setError('The connected wallet changed. Sign the message again to continue.');
    }
  }, [isSigningIn, walletAddress, walletConnection.wallet]);

  const signIn = useCallback(
    async (connectorId?: string) => {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Add the required environment variables.');
        return;
      }

      setError(null);
      setIsSigningIn(true);
      pendingSignIn.current = true;

      try {
        if (!walletConnection.wallet) {
          if (!connectorId) throw new Error('Select a Solana wallet.');
          await walletConnection.connect(connectorId);
        } else {
          await completeSignIn();
        }
      } catch (connectionError) {
        pendingSignIn.current = false;
        setIsSigningIn(false);
        setError(errorMessage(connectionError));
      }
    },
    [completeSignIn, walletConnection],
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await getSupabaseBrowserClient().auth.signOut();
      await walletConnection.disconnect().catch(() => undefined);
      setUser(null);
      setWalletAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletConnection]);

  const availableWallets = useMemo<WalletOption[]>(
    () =>
      walletConnection.connectors.map((connector) => ({
        icon: connector.icon,
        id: connector.id,
        name: connector.name,
        ready: connector.ready !== false,
      })),
    [walletConnection.connectors],
  );

  return (
    <AuthContext.Provider
      value={{
        availableWallets,
        error,
        isAuthenticated: Boolean(walletAddress),
        isLoading,
        isSigningIn,
        isWalletConnected: Boolean(walletConnection.wallet),
        refreshUser: async () => {
          await refreshProfile();
        },
        signIn,
        signOut,
        user,
        walletAddress,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
