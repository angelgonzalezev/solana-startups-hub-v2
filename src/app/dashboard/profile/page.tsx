'use client';

import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import ProfileForm from '@/components/profile/ProfileForm';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AtSign, ExternalLink } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AuthGate>
      <DashboardShell
        title="My Profile"
        subtitle="Manage your professional identity and contact information."
        actions={
          user?.username ? (
            <Link
              href={`/${user.username}`}
              className="btn btn-white-dark btn-md inline-flex items-center justify-center gap-2 border-white/10">
              <ExternalLink aria-hidden="true" className="size-4" />
              View public page
            </Link>
          ) : (
            <p className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-white/15 px-5 text-sm font-medium text-white/50">
              <AtSign aria-hidden="true" className="size-4 text-primary-400" />
              Choose a username below to unlock your public page
            </p>
          )
        }>
        <div className="max-w-4xl">
          <ProfileForm initialData={user} />
        </div>
      </DashboardShell>
    </AuthGate>
  );
}
