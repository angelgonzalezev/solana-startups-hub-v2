'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { isProfileMinimumComplete } from '@/utils/validation';

// Shared onboarding signals: whether the signed-in user finished the two
// setup steps (complete profile, first startup). Drives the global nudge and
// the profile -> first-startup chaining; everything is derived, nothing is
// persisted server-side.
interface OnboardingContextType {
  // null while unknown (loading or signed out) - the nudge only shows on an
  // explicit false.
  hasStartups: boolean | null;
  profileComplete: boolean;
  refreshOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
  hasStartups: null,
  profileComplete: false,
  refreshOnboarding: async () => undefined,
});

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [hasStartups, setHasStartups] = useState<boolean | null>(null);

  const profileComplete = user ? isProfileMinimumComplete(user) : false;

  const refreshOnboarding = useCallback(async () => {
    if (!isAuthenticated) {
      setHasStartups(null);
      return;
    }
    try {
      setHasStartups((await startupService.countStartupsByOwner()) > 0);
    } catch {
      // Unknown beats a wrong nudge.
      setHasStartups(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshOnboarding();
  }, [refreshOnboarding]);

  return (
    <OnboardingContext.Provider value={{ hasStartups, profileComplete, refreshOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
