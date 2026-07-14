'use client';

import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import ProfileForm from '@/components/profile/ProfileForm';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function ProfilePage() {
  const { user, walletAddress } = useAuth();

  return (
    <AuthGate>
      <DashboardShell
        title="My Profile"
        subtitle="Manage your professional identity and contact information."
        actions={
          walletAddress && (
            <Link
              href={`/u/${walletAddress}`}
              className="btn btn-white-dark btn-md inline-flex items-center justify-center gap-2 border-white/10">
              <ExternalLink aria-hidden="true" className="size-4" />
              View public page
            </Link>
          )
        }>
        <div className="max-w-4xl">
          <ProfileForm initialData={user} />
        </div>
      </DashboardShell>
    </AuthGate>
  );
}
