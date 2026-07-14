'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import { ListingStatusBadge, VerificationStatusBadge } from '@/components/shared/Badges';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { isProfileMinimumComplete } from '@/utils/validation';
import Link from 'next/link';
import RevealAnimation from '@/components/animation/RevealAnimation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { resolveMediaUrl } from '@/services/mediaService';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, signOut, user, walletAddress } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
    router.refresh();
  };

  useEffect(() => {
    if (!walletAddress) {
      setStartups([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const data = await startupService.listStartupsByOwner();
        if (!cancelled) {
          setStartups(data);
        }
      } catch (error) {
        console.error('Error loading startups:', error);
        if (!cancelled) {
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, reloadKey]);

  const isProfileComplete = user ? isProfileMinimumComplete(user) : false;
  const avatarUrl = resolveMediaUrl(user?.avatar);

  return (
    <AuthGate>
      <DashboardShell title="Dashboard" subtitle={`Welcome back, ${user?.displayName || 'Builder'}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Profile Summary */}
          <div className="space-y-6 lg:col-span-4 lg:space-y-8">
            <RevealAnimation delay={0.1}>
              <div className="space-y-6 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black sm:size-16">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={user?.displayName || 'Profile avatar'}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 font-bold text-xl">
                        {user?.displayName?.slice(0, 1).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="break-words text-lg font-bold text-white">{user?.displayName || 'Anonymous'}</h3>
                    <p className="break-words text-sm font-medium text-primary-500">
                      {user?.jobTitle || 'Role not set'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40 font-medium">Profile Status</span>
                    <span className={isProfileComplete ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}>
                      {isProfileComplete ? 'COMPLETE' : 'INCOMPLETE'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40 font-medium">Joined</span>
                    <span className="text-white/80 font-bold" suppressHydrationWarning>
                      {user ? new Date(user.joinedAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>

                {walletAddress && (
                  <Link
                    href={`/u/${walletAddress}`}
                    className="btn btn-md inline-flex w-full items-center justify-center gap-2 border border-primary-500/30 bg-primary-500/10 text-primary-400 transition hover:border-primary-500/50 hover:bg-primary-500/20">
                    <ExternalLink aria-hidden="true" className="size-4" />
                    View Public Page
                  </Link>
                )}
                <Link href="/dashboard/profile" className="btn btn-white-dark btn-md w-full border-white/10">
                  Edit Profile
                </Link>
                <button
                  type="button"
                  disabled={isAuthLoading}
                  onClick={() => void handleSignOut()}
                  className="btn btn-md w-full border border-red-400/20 bg-red-500/10 text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-50">
                  {isAuthLoading ? 'Disconnecting...' : 'Disconnect Wallet'}
                </button>
              </div>
            </RevealAnimation>

            {/* Quick Stats */}
            <RevealAnimation delay={0.2}>
              <div className="space-y-6 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6">
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">My Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 rounded-2xl border border-white/10 bg-black p-3 sm:p-4">
                    <p className="text-2xl font-bold text-white">{startups.length}</p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Total Projects</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-white/10 bg-black p-3 sm:p-4">
                    <p className="text-2xl font-bold text-primary-500">
                      {startups.filter((s) => s.listingStatus === 'published').length}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Published</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-white/10 bg-black p-3 sm:p-4">
                    <p className="text-2xl font-bold text-green-500">
                      {startups.filter((s) => s.verificationStatus === 'verified').length}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Verified</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-white/10 bg-black p-3 sm:p-4">
                    <p className="text-2xl font-bold text-yellow-500">
                      {startups.filter((s) => s.verificationStatus === 'pending').length}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Pending</p>
                  </div>
                </div>
              </div>
            </RevealAnimation>
          </div>

          {/* Right Column: Recent Startups & Actions */}
          <div className="space-y-8 lg:col-span-8">
            <RevealAnimation delay={0.3}>
              <div className="space-y-7 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Start Building</h3>
                  <p className="text-white/60">
                    Ready to showcase another project? List your startup and get discovered by the Solana ecosystem.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/dashboard/startups/new"
                    className="btn btn-primary btn-xl shadow-lg shadow-primary-500/20 w-full sm:w-auto">
                    List New Startup
                  </Link>
                  <Link href="/startups" className="btn btn-white-dark btn-xl border-white/10 w-full sm:w-auto">
                    Explore Marketplace
                  </Link>
                </div>
              </div>
            </RevealAnimation>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recent Startups</h3>
                <Link href="/dashboard/startups" className="text-sm text-primary-500 font-bold hover:underline">
                  View All
                </Link>
              </div>

              {isLoading ? (
                <LoadingState />
              ) : hasError ? (
                <ErrorState
                  message="We couldn't load your startups right now. Please try again."
                  onRetry={() => setReloadKey((key) => key + 1)}
                />
              ) : startups.length === 0 ? (
                <div className="rounded-[30px] border border-dashed border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-white/30 italic">You haven&apos;t listed any startups yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {startups.slice(0, 3).map((startup) => {
                    const startupLogoUrl = resolveMediaUrl(startup.logo);
                    return (
                      <Link key={startup.id} href={`/dashboard/startups/${startup.id}/edit`}>
                        <div className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black p-4 transition-colors hover:border-white/20 sm:p-5">
                          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            <div className="relative size-11 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] sm:size-12">
                              {startupLogoUrl ? (
                                <Image
                                  src={startupLogoUrl}
                                  alt={startup.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-bold text-white/20">
                                  {startup.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <h4 className="truncate font-bold text-white transition-colors group-hover:text-primary-500">
                                {startup.name}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                <VerificationStatusBadge status={startup.verificationStatus} />
                                <ListingStatusBadge status={startup.listingStatus} />
                              </div>
                            </div>
                          </div>
                          <ChevronRight
                            aria-hidden="true"
                            className="size-5 shrink-0 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardShell>
    </AuthGate>
  );
}
