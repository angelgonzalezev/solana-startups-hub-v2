'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { SolanaProvider } from '@/components/shared/SolanaProvider';
import { AuthProvider, type InitialAuthState } from '@/context/AuthContext';

export const AppProviders = ({ children, initialAuth }: { children: ReactNode; initialAuth: InitialAuthState }) => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <SolanaProvider>
      <AuthProvider initialAuth={initialAuth}>{children}</AuthProvider>
    </SolanaProvider>
  </ThemeProvider>
);
