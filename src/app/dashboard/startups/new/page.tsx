'use client';

import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { isProfileMinimumComplete } from '@/utils/validation';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import { EmptyState } from '@/components/shared/States';
import StartupForm from '@/components/startup/StartupForm';
import { useRouter } from 'next/navigation';

export default function NewStartupPage() {
  const { user } = useAuth();
  const { refreshOnboarding } = useOnboarding();
  const router = useRouter();

  const isComplete = user ? isProfileMinimumComplete(user) : false;

  const handleSave = () => {
    // First startup created: the onboarding nudge can retire itself.
    void refreshOnboarding();
    router.push('/dashboard/startups');
  };

  return (
    <AuthGate>
      <DashboardShell title="List New Startup" subtitle="Share your project with the Solana ecosystem.">
        {!isComplete ? (
          <EmptyState
            title="Profile Incomplete"
            description="You need to complete your professional profile (Display Name and Job Title) before you can list a startup."
            actionHref="/dashboard/profile"
            actionLabel="Complete Profile"
            icon={
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            }
          />
        ) : (
          <div className="max-w-4xl">
            <StartupForm onSave={handleSave} />
          </div>
        )}
      </DashboardShell>
    </AuthGate>
  );
}
