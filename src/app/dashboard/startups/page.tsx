'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import MyStartupCard from '@/components/startup/MyStartupCard';
import { LoadingState, EmptyState } from '@/components/shared/States';
import Link from 'next/link';

export default function MyStartupsPage() {
  const { walletAddress } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      loadStartups();
    }
  }, [walletAddress]);

  const loadStartups = async () => {
    setIsLoading(true);
    try {
      const data = await startupService.listStartupsByOwner(walletAddress!);
      setStartups(data);
    } catch (error) {
      console.error('Error loading startups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this startup? It will no longer be visible in the marketplace.')) {
      try {
        await startupService.archiveStartup(id, walletAddress!);
        await loadStartups();
      } catch (error) {
        console.error('Error archiving startup:', error);
      }
    }
  };

  return (
    <AuthGate>
      <DashboardShell
        title="My Startups"
        subtitle="Manage your projects and track their verification status."
        actions={
          <Link href="/dashboard/startups/new" className="btn btn-primary btn-md shadow-lg shadow-primary-500/20">
            List New Startup
          </Link>
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : startups.length === 0 ? (
          <EmptyState
            title="No Startups Yet"
            description="You haven't listed any startups on the hub. Start by creating your first project."
            actionHref="/dashboard/startups/new"
            actionLabel="List New Startup"
          />
        ) : (
          <div className="space-y-6">
            {startups.map((startup) => (
              <MyStartupCard
                key={startup.id}
                startup={startup}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </DashboardShell>
    </AuthGate>
  );
}
