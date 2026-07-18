'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { PrivyProviderWrapper } from '@/components/shared/PrivyProviderWrapper';
import { PrivyWalletBridge } from '@/components/shared/PrivyWalletBridge';
import { SolanaProvider } from '@/components/shared/SolanaProvider';
import OnboardingNudge from '@/components/shared/OnboardingNudge';
import { AuthProvider, type InitialAuthState } from '@/context/AuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';

export const AppProviders = ({ children, initialAuth }: { children: ReactNode; initialAuth: InitialAuthState }) => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <PrivyProviderWrapper>
      <SolanaProvider>
        <PrivyWalletBridge />
        <AuthProvider initialAuth={initialAuth}>
          <OnboardingProvider>
            {children}
            <OnboardingNudge />
          </OnboardingProvider>
        </AuthProvider>
      </SolanaProvider>
    </PrivyProviderWrapper>
  </ThemeProvider>
);
