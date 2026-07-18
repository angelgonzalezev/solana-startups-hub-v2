'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { User } from '@/interface/user';
import { Startup } from '@/interface/startup';
import StartupCard from '@/components/startup/StartupCard';
import { ErrorState } from '@/components/shared/States';
import RevealAnimation from '@/components/animation/RevealAnimation';
import { resolveMediaUrl } from '@/services/mediaService';

interface PublicProfileViewProps {
  profile: User | null;
  startups: Startup[];
  isLoading: boolean;
}

const truncateWallet = (wallet: string) => `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

// Standalone personal page in the spirit of indiepa.ge: no site navbar or
// footer, just the profile and their startups, with a small Orbital badge
// as the only way back into the product.
const PublicProfileView: React.FC<PublicProfileViewProps> = ({ profile, startups, isLoading }) => {
  const ownStartups = startups.filter((startup) => startup.ownerWallet === profile?.walletAddress);
  const collaborations = startups.filter((startup) => startup.ownerWallet !== profile?.walletAddress);
  const avatarUrl = resolveMediaUrl(profile?.avatar);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 md:pb-28 md:pt-16 lg:pt-24">
        {isLoading ? (
          <ProfileSkeleton />
        ) : !profile ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
            <ErrorState message="This profile doesn't exist or isn't available." />
            <OrbitalBadge className="fixed bottom-5 right-5 z-50 shadow-2xl shadow-black/50 lg:static lg:shadow-none" />
          </div>
        ) : (
          <>
            <div className="flex w-full min-w-0 flex-col gap-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-16">
              {/* Left: profile */}
              <RevealAnimation delay={0.1}>
                <aside className="w-full min-w-0 lg:sticky lg:top-24 lg:col-span-4">
                  <section className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
                    <div className="relative size-28 overflow-hidden rounded-[30px] border border-white/10 bg-black shadow-2xl shadow-primary-500/10 sm:size-32">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={profile.displayName} fill sizes="128px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white/10">
                          {(profile.displayName || profile.walletAddress).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h1 className="break-words text-3xl font-bold tracking-tight text-white md:text-4xl">
                        {profile.displayName || truncateWallet(profile.walletAddress)}
                      </h1>
                      {profile.username && <p className="text-sm font-medium text-white/40">@{profile.username}</p>}
                      {profile.jobTitle && (
                        <p className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-lg font-semibold text-transparent">
                          {profile.jobTitle}
                        </p>
                      )}
                    </div>

                    {profile.bio && <p className="text-base leading-7 text-white/60">{profile.bio}</p>}

                    <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-start">
                      {profile.twitterHandle && (
                        <a
                          href={`https://x.com/${profile.twitterHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-9 min-w-0 items-center gap-2 rounded-full border border-white/10 bg-[#0A0A0A] px-3.5 text-xs font-bold text-white/70 transition-all hover:border-primary-500/50 hover:bg-primary-500/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 sm:min-h-11 sm:gap-2.5 sm:px-5 sm:text-sm">
                          <svg
                            aria-hidden="true"
                            className="h-3 w-3 shrink-0 fill-white/40 transition-colors group-hover:fill-white sm:h-3.5 sm:w-3.5"
                            viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          @{profile.twitterHandle}
                        </a>
                      )}
                      {profile.telegramHandle && (
                        <a
                          href={`https://t.me/${profile.telegramHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-9 min-w-0 items-center gap-2 rounded-full border border-white/10 bg-[#0A0A0A] px-3.5 text-xs font-bold text-white/70 transition-all hover:border-primary-500/50 hover:bg-primary-500/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 sm:min-h-11 sm:gap-2.5 sm:px-5 sm:text-sm">
                          <svg
                            aria-hidden="true"
                            className="h-3 w-3 shrink-0 fill-white/40 transition-colors group-hover:fill-white sm:h-3.5 sm:w-3.5"
                            viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.441-.168.575-.533.766-.74.785-.453.041-.795-.299-1.233-.584-.687-.446-1.074-.722-1.741-1.161-.77-.506-.271-.785.168-1.241.115-.12 2.112-1.939 2.15-2.103.005-.021.01-.1-.035-.139-.046-.039-.114-.026-.163-.015-.069.016-1.171.744-3.308 2.185-.313.215-.597.321-.852.315-.282-.007-.824-.16-1.228-.291-.494-.161-.887-.247-.852-.521.018-.143.214-.289.587-.439 2.296-.999 3.827-1.658 4.591-1.977 2.183-.91 2.637-1.068 2.933-1.073.065-.001.21.015.304.092.079.064.102.151.111.218.009.064.012.2.008.32z" />
                          </svg>
                          @{profile.telegramHandle}
                        </a>
                      )}
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                      On Orbital since{' '}
                      <span suppressHydrationWarning>
                        {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </span>
                    </p>

                    {/* Desktop: sits in the profile column flow, below the details. */}
                    <div className="mt-42 hidden lg:block">
                      <OrbitalBadge />
                    </div>
                  </section>
                </aside>
              </RevealAnimation>

              {/* Right: startups */}
              <div className="w-full min-w-0 space-y-12 lg:col-span-8">
                <RevealAnimation delay={0.2}>
                  <section className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight text-white underline decoration-primary-500/30 decoration-4 underline-offset-8 sm:text-3xl">
                      Startups
                    </h2>
                    {ownStartups.length === 0 ? (
                      <div className="rounded-[30px] border border-white/5 bg-[#0A0A0A] p-8 text-center">
                        <p className="text-white/40">No published startups yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
                        {ownStartups.map((startup, index) => (
                          <StartupCard key={startup.id} startup={startup} index={index} />
                        ))}
                      </div>
                    )}
                  </section>
                </RevealAnimation>

                {collaborations.length > 0 && (
                  <RevealAnimation delay={0.3}>
                    <section className="space-y-6">
                      <h2 className="text-2xl font-bold tracking-tight text-white underline decoration-primary-500/30 decoration-4 underline-offset-8 sm:text-3xl">
                        Collaborating on
                      </h2>
                      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
                        {collaborations.map((startup, index) => (
                          <StartupCard key={startup.id} startup={startup} index={index} />
                        ))}
                      </div>
                    </section>
                  </RevealAnimation>
                )}
              </div>
            </div>

            {/* Mobile: floats in the bottom-right corner. Rendered outside the
                animated profile column so position:fixed anchors to the viewport. */}
            <OrbitalBadge className="fixed bottom-5 right-5 z-50 shadow-2xl shadow-black/50 lg:hidden" />
          </>
        )}
      </main>
    </div>
  );
};

// The only piece of Orbital chrome on the page, inviting visitors to create
// their own page. Positioning is passed in per placement: floating bottom-right
// on mobile, in the profile column flow on desktop.
const OrbitalBadge = ({ className = '' }: { className?: string }) => (
  <Link
    href="/"
    className={cn(
      'group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/10 bg-black/80 px-5 text-sm font-bold tracking-wide text-white/60 backdrop-blur-md transition-all hover:border-primary-500/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
      className,
    )}>
    <span aria-hidden="true" className="size-2 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
    Build your Orbit
  </Link>
);

const ProfileSkeleton = () => (
  <div className="flex w-full flex-col gap-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-16">
    <div className="flex flex-col items-center gap-6 lg:col-span-4 lg:items-start">
      <div className="size-28 animate-pulse rounded-[30px] bg-white/5 sm:size-32" />
      <div className="h-9 w-56 animate-pulse rounded-xl bg-white/5" />
      <div className="h-5 w-40 animate-pulse rounded-lg bg-white/5" />
      <div className="flex gap-3">
        <div className="h-11 w-32 animate-pulse rounded-full bg-white/5" />
        <div className="h-11 w-32 animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-5 lg:col-span-8 xl:grid-cols-2 xl:gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-[30px] bg-white/5" />
      ))}
    </div>
  </div>
);

export default PublicProfileView;
