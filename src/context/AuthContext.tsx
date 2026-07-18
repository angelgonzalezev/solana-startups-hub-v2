'use client';

import { useLogin, usePrivy, type User as PrivyUser } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/solana';
import { useWalletConnection } from '@solana/react-hooks';
import { useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  clearBridgeSession,
  registerSessionRefresher,
  setBridgeSession,
  unregisterSessionRefresher,
  type BridgeSession,
} from '@/lib/auth/tokenBridge';
import { clearOnboardingDismissal } from '@/lib/onboarding';
import { isPrivyConfigured } from '@/lib/privy/config';
import { mapProfileRow } from '@/lib/supabase/mappers';
import { startupService } from '@/services/startupService';
import { userService } from '@/services/userService';
import { isProfileMinimumComplete } from '@/utils/validation';
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

class SessionExchangeError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Trades the caller's Privy access token for a minted Supabase JWT plus the
// resolved profile. This is the only server round-trip in the login flow: it
// verifies the Privy session, adopts/creates the profile, and syncs the
// linked-wallet set used by payment verification.
const exchangePrivySession = async (accessToken: string): Promise<BridgeSession> => {
  const response = await fetch('/api/auth/session', {
    headers: { Authorization: `Bearer ${accessToken}` },
    method: 'POST',
  });
  const result = (await response.json().catch(() => null)) as
    | (BridgeSession & { error?: string })
    | { error?: string }
    | null;
  if (!response.ok || !result || !('token' in result)) {
    throw new SessionExchangeError(result?.error || 'Unable to start the session.', response.status);
  }
  return result;
};

const userCancelledLogin = (error: unknown) => /exited|cancel|closed|abandoned/i.test(String(error));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hasSolanaWallet = (privyUser: PrivyUser | null) =>
  Boolean(
    privyUser?.linkedAccounts?.some(
      (account) => account.type === 'wallet' && 'chainType' in account && account.chainType === 'solana',
    ),
  );

// Right after signup the embedded Solana wallet may still be mid-creation, so
// the exchange can briefly answer 422 ("no wallet yet"). Retrying is the fix;
// logging out here would abort Privy's own wallet creation mid-flight.
const WALLET_WAIT_ATTEMPTS = 8;
const WALLET_WAIT_DELAY_MS = 1500;

const PrivyAuthProvider = ({ children, initialAuth }: { children: React.ReactNode; initialAuth: InitialAuthState }) => {
  const router = useRouter();
  const { authenticated, getAccessToken, logout, ready, user: privyUser } = usePrivy();
  const { createWallet } = useCreateWallet();
  const walletConnection = useWalletConnection();
  const [walletAddress, setWalletAddress] = useState<string | null>(initialAuth.walletAddress);
  const [user, setUser] = useState<User | null>(initialAuth.profile);
  const [isLoading, setIsLoading] = useState(!initialAuth.resolved);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restoreAttempted = useRef(false);
  // Login completion and session restore can both try to run the exchange
  // (OAuth redirects re-enter through both paths); only one may act at a time.
  const authenticationInFlight = useRef(false);

  const applySession = useCallback((session: BridgeSession) => {
    setBridgeSession(session);
    setUser(mapProfileRow(session.profile));
    setWalletAddress(session.profile.wallet_address);
  }, []);

  const resetAuthState = useCallback(() => {
    clearBridgeSession();
    setUser(null);
    setWalletAddress(null);
  }, []);

  const runExchange = useCallback(async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new SessionExchangeError('The Privy session has expired.', 401);
    return exchangePrivySession(accessToken);
  }, [getAccessToken]);

  const runExchangeWaitingForWallet = useCallback(
    async (ensureWallet?: () => Promise<unknown>) => {
      for (let attempt = 1; ; attempt += 1) {
        try {
          return await runExchange();
        } catch (exchangeFailure) {
          const waitingForWallet = exchangeFailure instanceof SessionExchangeError && exchangeFailure.status === 422;
          if (!waitingForWallet || attempt >= WALLET_WAIT_ATTEMPTS) throw exchangeFailure;
          // No Solana wallet on the account yet: nudge creation again (throws
          // harmlessly if one is already being created) and give it time.
          await ensureWallet?.().catch((createError) => {
            console.error('[auth] embedded wallet creation failed:', createError);
          });
          await wait(WALLET_WAIT_DELAY_MS);
        }
      }
    },
    [runExchange],
  );

  // The token bridge calls this whenever supabase-js needs a fresh JWT (first
  // authed query after load, expiry mid-session). It must never throw.
  useEffect(() => {
    const refresher = async () => {
      try {
        return await runExchange();
      } catch {
        return null;
      }
    };
    registerSessionRefresher(refresher);
    return () => unregisterSessionRefresher(refresher);
  }, [runExchange]);

  const completeLogin = useCallback(
    async (loggedInUser: PrivyUser | null, wasAlreadyAuthenticated: boolean) => {
      if (authenticationInFlight.current) return;
      authenticationInFlight.current = true;
      // OAuth logins arrive here after a full page reload, so the pre-redirect
      // "signing in" state was lost - restore it while the exchange runs.
      setIsSigningIn(true);
      setError(null);
      try {
        // Belt and braces over createOnLogin: if the account still has no
        // Solana wallet, create the embedded one explicitly before the
        // exchange (silent - wallet UIs are disabled).
        const ensureWallet = hasSolanaWallet(loggedInUser) ? undefined : () => createWallet();
        if (ensureWallet) {
          await ensureWallet().catch((createError) => {
            console.error('[auth] embedded wallet creation failed:', createError);
          });
        }
        const session = await runExchangeWaitingForWallet(ensureWallet);
        // A fresh login always resurfaces the onboarding checklist while
        // steps remain pending; dismissal only lasts the rest of the visit.
        clearOnboardingDismissal(session.profile.wallet_address);
        applySession(session);
        if (!wasAlreadyAuthenticated) {
          // Onboarding: land on the step that is still pending - profile
          // first, then the first startup. Fully set-up users go straight to
          // the marketplace.
          let destination = '/startups';
          if (!isProfileMinimumComplete(mapProfileRow(session.profile))) {
            destination = '/dashboard/profile';
          } else {
            const startupCount = await startupService.countStartupsByOwner().catch(() => null);
            if (startupCount === 0) destination = '/dashboard/startups/new';
          }
          router.replace(destination);
        }
      } catch (exchangeFailure) {
        console.error('[auth] session exchange failed:', exchangeFailure);
        // A failed exchange leaves a Privy session with no app profile; log it
        // out so the retry starts clean (and a 409 wallet conflict is not
        // retried against a half-open session).
        resetAuthState();
        await logout().catch(() => undefined);
        setError(
          exchangeFailure instanceof SessionExchangeError ? exchangeFailure.message : 'Unable to start the session.',
        );
      } finally {
        authenticationInFlight.current = false;
        setIsSigningIn(false);
        setIsLoading(false);
      }
    },
    [applySession, createWallet, logout, resetAuthState, router, runExchangeWaitingForWallet],
  );

  const { login } = useLogin({
    onComplete: ({ user: loggedInUser, wasAlreadyAuthenticated }) => {
      void completeLogin(loggedInUser, wasAlreadyAuthenticated);
    },
    onError: (loginError) => {
      setIsSigningIn(false);
      if (!userCancelledLogin(loginError)) {
        setError('Sign-in was interrupted. Please try again.');
      }
    },
  });

  // Session restore on reload: the server already hydrated the profile from
  // the privy-token cookie when it could; once the Privy client is ready we
  // reconcile - a live Privy session refreshes the bridge lazily, a dead one
  // clears any stale server-hydrated state.
  //
  // During an OAuth redirect (?privy_oauth_* in the URL) this must stand
  // aside: useLogin's onComplete owns that flow, and racing it here once
  // logged users out mid wallet-creation.
  useEffect(() => {
    if (!ready || isSigningIn || restoreAttempted.current || authenticationInFlight.current) return;
    if (typeof window !== 'undefined' && window.location.search.includes('privy_oauth_')) return;
    restoreAttempted.current = true;

    if (!authenticated) {
      if (initialAuth.walletAddress) resetAuthState();
      setIsLoading(false);
      return;
    }

    if (user) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      if (authenticationInFlight.current) return;
      authenticationInFlight.current = true;
      try {
        const ensureWallet = hasSolanaWallet(privyUser) ? undefined : () => createWallet();
        const session = await runExchangeWaitingForWallet(ensureWallet);
        applySession(session);
      } catch (restoreFailure) {
        console.error('[auth] session restore failed:', restoreFailure);
        resetAuthState();
        await logout().catch(() => undefined);
      } finally {
        authenticationInFlight.current = false;
        setIsLoading(false);
      }
    })();
  }, [
    applySession,
    authenticated,
    createWallet,
    initialAuth.walletAddress,
    isSigningIn,
    logout,
    privyUser,
    ready,
    resetAuthState,
    runExchangeWaitingForWallet,
    user,
  ]);

  const signIn = useCallback(async () => {
    if (!ready || authenticated) return;
    setError(null);
    setIsSigningIn(true);
    login();
  }, [authenticated, login, ready]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      clearBridgeSession();
      await walletConnection.disconnect().catch(() => undefined);
      await logout().catch(() => undefined);
      setUser(null);
      setWalletAddress(null);
    } finally {
      restoreAttempted.current = true;
      setIsLoading(false);
    }
  }, [logout, walletConnection]);

  const refreshUser = useCallback(async () => {
    const profile = await userService.getCurrentUser();
    if (profile) {
      setUser(profile);
      setWalletAddress(profile.walletAddress);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        availableWallets: [],
        error,
        isAuthenticated: Boolean(walletAddress),
        isLoading,
        isSigningIn,
        isWalletConnected: Boolean(walletConnection.wallet),
        refreshUser,
        signIn,
        signOut,
        user,
        walletAddress,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Without Privy env vars the app still renders (public pages, local tooling);
// sign-in just explains what is missing, mirroring the Supabase guard the app
// had before.
const DisabledAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        availableWallets: [],
        error,
        isAuthenticated: false,
        isLoading: false,
        isSigningIn: false,
        isWalletConnected: false,
        refreshUser: async () => undefined,
        signIn: async () => {
          setError('Sign-in is not configured. Add NEXT_PUBLIC_PRIVY_APP_ID to the environment.');
        },
        signOut: async () => undefined,
        user: null,
        walletAddress: null,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({
  children,
  initialAuth,
}: {
  children: React.ReactNode;
  initialAuth: InitialAuthState;
}) =>
  isPrivyConfigured() ? (
    <PrivyAuthProvider initialAuth={initialAuth}>{children}</PrivyAuthProvider>
  ) : (
    <DisabledAuthProvider>{children}</DisabledAuthProvider>
  );

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
