'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import MyStartupCard from '@/components/startup/MyStartupCard';
import { LoadingState, EmptyState } from '@/components/shared/States';
import Link from 'next/link';
import { cn } from '@/utils/cn';

type ListingTab = 'published' | 'archived';

export default function MyStartupsPage() {
  const { walletAddress } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ListingTab>('published');

  // silent skips the loading state so an in-place refresh (e.g. right after a
  // featured purchase) does not unmount the list and the success modal with it.
  const refreshStartups = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!walletAddress) {
        setStartups([]);
        setIsLoading(false);
        return;
      }

      if (!options?.silent) setIsLoading(true);
      try {
        const data = await startupService.listStartupsByOwner();
        setStartups(data);
      } catch (error) {
        console.error('Error loading startups:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress],
  );

  useEffect(() => {
    void refreshStartups();
  }, [refreshStartups]);

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this startup? It will no longer be visible in the marketplace.')) {
      try {
        await startupService.archiveStartup(id);
        await refreshStartups();
      } catch (error) {
        console.error('Error archiving startup:', error);
      }
    }
  };

  // Errors propagate to MyStartupCard, which surfaces them inline.
  const handleDelete = async (id: string) => {
    await startupService.deleteStartup(id);
    await refreshStartups({ silent: true });
  };

  const publishedStartups = useMemo(() => startups.filter((s) => s.listingStatus !== 'archived'), [startups]);
  const archivedStartups = useMemo(() => startups.filter((s) => s.listingStatus === 'archived'), [startups]);
  const visibleStartups = activeTab === 'published' ? publishedStartups : archivedStartups;

  return (
    <AuthGate>
      <DashboardShell
        title="My Startups"
        subtitle="Manage your projects and track their verification status."
        actions={
          <Link href="/dashboard/startups/new" className="btn btn-primary btn-md shadow-lg shadow-primary-500/20">
            List New Startup
          </Link>
        }>
        {isLoading ? (
          <LoadingState />
        ) : startups.length === 0 ? (
          <EmptyState
            title="No Startups Yet"
            description="You haven't listed any startups on Orbital. Start by creating your first project."
            actionHref="/dashboard/startups/new"
            actionLabel="List New Startup"
          />
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-white/10">
              {(
                [
                  { id: 'published', label: 'Published', count: publishedStartups.length },
                  { id: 'archived', label: 'Archived', count: archivedStartups.length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'border-b-2 px-4 py-3 text-sm font-bold transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-500 text-white'
                      : 'border-transparent text-white/40 hover:text-white/70',
                  )}>
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {visibleStartups.length === 0 ? (
              <EmptyState
                title={activeTab === 'published' ? 'No Published Startups' : 'No Archived Startups'}
                description={
                  activeTab === 'published'
                    ? "You don't have any published startups yet."
                    : "You haven't archived any startups yet."
                }
                {...(activeTab === 'published'
                  ? { actionHref: '/dashboard/startups/new', actionLabel: 'List New Startup' }
                  : {})}
              />
            ) : (
              <div className="space-y-6">
                {visibleStartups.map((startup) => (
                  <MyStartupCard
                    key={startup.id}
                    startup={startup}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onFeatured={() => refreshStartups({ silent: true })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardShell>
    </AuthGate>
  );
}
