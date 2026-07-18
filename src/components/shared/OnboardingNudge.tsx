'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Circle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useHydrated } from '@/hooks/useHydrated';
import { dismissOnboarding, isOnboardingDismissed } from '@/lib/onboarding';

// Floating two-step checklist shown anywhere in the app while the signed-in
// user has no startups yet. Dismissing hides it for the session
// (sessionStorage, keyed per wallet); it disappears for good once the first
// startup exists.
const OnboardingNudge = () => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, walletAddress } = useAuth();
  const { hasStartups, profileComplete } = useOnboarding();
  const isHydrated = useHydrated();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!walletAddress) return;
    setDismissed(isOnboardingDismissed(walletAddress));
  }, [walletAddress]);

  if (!isHydrated || !isAuthenticated || isLoading || dismissed) return null;
  if (hasStartups !== false) return null;
  // Stay out of the way on the page the active step points to.
  if (pathname === '/dashboard/startups/new') return null;
  if (!profileComplete && pathname === '/dashboard/profile') return null;

  const dismiss = () => {
    if (walletAddress) dismissOnboarding(walletAddress);
    setDismissed(true);
  };

  const step = (done: boolean, label: string) => (
    <li className="flex items-center gap-2.5 text-sm">
      {done ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
          <Check aria-hidden="true" className="size-3 text-green-500" />
        </span>
      ) : (
        <Circle aria-hidden="true" className="size-5 shrink-0 text-yellow-500/70" />
      )}
      <span className={done ? 'text-white/40 line-through' : 'text-white/80'}>{label}</span>
    </li>
  );

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
      <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 shadow-2xl shadow-primary-500/10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-white">Finish setting up</h4>
            <p className="text-sm text-white/50">Get your startup in front of the Solana ecosystem.</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss setup reminder"
            onClick={dismiss}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-white/50 transition hover:border-white/20 hover:text-white">
            ×
          </button>
        </div>

        <ul className="mt-4 space-y-2.5">
          {step(profileComplete, 'Complete your profile')}
          {step(false, 'List your first startup')}
        </ul>

        <Link
          href={profileComplete ? '/dashboard/startups/new' : '/dashboard/profile'}
          className="btn btn-primary btn-md mt-4 w-full shadow-lg shadow-primary-500/20">
          {profileComplete ? 'List your first startup' : 'Complete your profile'}
        </Link>
      </div>
    </div>
  );
};

export default OnboardingNudge;
