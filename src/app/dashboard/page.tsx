'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import DashboardShell from '@/components/shared/DashboardShell';
import AuthGate from '@/components/shared/AuthGate';
import { VerificationStatusBadge } from '@/components/shared/Badges';
import { LoadingState } from '@/components/shared/States';
import { isProfileMinimumComplete } from '@/utils/validation';
import Link from 'next/link';
import RevealAnimation from '@/components/animation/RevealAnimation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, signOut, user, walletAddress } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      try {
        const data = await startupService.listStartupsByOwner();
        if (!cancelled) {
          setStartups(data);
        }
      } catch (error) {
        console.error('Error loading startups:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const isProfileComplete = user ? isProfileMinimumComplete(user) : false;

  return (
    <AuthGate>
      <DashboardShell title="Dashboard" subtitle={`Welcome back, ${user?.displayName || 'Builder'}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Profile Summary */}
          <div className="md:col-span-4 space-y-8">
            <RevealAnimation delay={0.1}>
              <div className="bg-[#0A0A0A] border border-white/5 rounded-[30px] p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 overflow-hidden relative">
                    {user?.avatar ? (
                      <Image src={user.avatar} alt={user.displayName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 font-bold text-xl">
                        {user?.displayName?.slice(0, 1).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-lg">{user?.displayName || 'Anonymous'}</h3>
                    <p className="text-primary-500 text-sm font-medium">{user?.jobTitle || 'Role not set'}</p>
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
              <div className="bg-[#0A0A0A] border border-white/5 rounded-[30px] p-8 space-y-6">
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">My Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-1">
                    <p className="text-2xl font-bold text-white">{startups.length}</p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Total Projects</p>
                  </div>
                  <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-1">
                    <p className="text-2xl font-bold text-primary-500">
                      {startups.filter((s) => s.listingStatus === 'published').length}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Published</p>
                  </div>
                  <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-1">
                    <p className="text-2xl font-bold text-green-500">
                      {startups.filter((s) => s.verificationStatus === 'verified').length}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Verified</p>
                  </div>
                  <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-1">
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
          <div className="md:col-span-8 space-y-8">
            <RevealAnimation delay={0.3}>
              <div className="bg-[#0A0A0A] border border-white/5 rounded-[30px] p-8 space-y-8 text-center sm:text-left">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Start Building</h3>
                  <p className="text-white/60">
                    Ready to showcase another project? List your startup and get discovered by the Solana ecosystem.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
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
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-bold text-white">Recent Startups</h3>
                <Link href="/dashboard/startups" className="text-sm text-primary-500 font-bold hover:underline">
                  View All
                </Link>
              </div>

              {isLoading ? (
                <LoadingState />
              ) : startups.length === 0 ? (
                <div className="p-10 bg-white/5 border border-white/5 border-dashed rounded-[30px] text-center">
                  <p className="text-white/30 italic">You haven&apos;t listed any startups yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {startups.slice(0, 3).map((startup) => (
                    <Link key={startup.id} href={`/dashboard/startups/${startup.id}/edit`}>
                      <div className="bg-black border border-white/5 rounded-2xl p-6 flex items-center justify-between hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-white/10 flex-shrink-0 flex items-center justify-center font-bold text-white/20">
                            {startup.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-white group-hover:text-primary-500 transition-colors">
                              {startup.name}
                            </h4>
                            <div className="flex gap-2">
                              <VerificationStatusBadge status={startup.verificationStatus} />
                            </div>
                          </div>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white/10 group-hover:text-white transition-all translate-x-0 group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardShell>
    </AuthGate>
  );
}
