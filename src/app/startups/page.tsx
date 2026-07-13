'use client';

import React, { useEffect, useState } from 'react';
import { startupService, StartupFilters as IStartupFilters } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import AuthGate from '@/components/shared/AuthGate';
import NavbarOne from '@/components/shared/header/NavbarOne';
import FooterOne from '@/components/shared/footer/FooterOne';
import StartupCard from '@/components/startup/StartupCard';
import StartupFilters from '@/components/startup/StartupFilters';
import { LoadingState, EmptyState } from '@/components/shared/States';
import RevealAnimation from '@/components/animation/RevealAnimation';
import { useAuth } from '@/context/AuthContext';
import { SlidersHorizontal, X } from 'lucide-react';

export default function StartupsPage() {
  const { isAuthenticated } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filters, setFilters] = useState<IStartupFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilterCount = [
    Boolean(filters.search),
    Boolean(filters.category?.length),
    Boolean(filters.stage?.length),
    Boolean(filters.techStack?.length),
    filters.isRaising === true,
    Boolean(filters.acquisitionStatus),
  ].filter(Boolean).length;

  useEffect(() => {
    if (!isFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFiltersOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFiltersOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStartups([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const data = await startupService.listPublishedStartups(filters);
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
  }, [filters, isAuthenticated]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavbarOne
        className="bg-black/60 backdrop-blur-[25px] border border-white/10 top-5"
        btnClassName="btn-primary hover:btn-white"
      />

      <main className="flex-grow pb-16 pt-[120px] md:pb-20 md:pt-[150px]">
        <AuthGate>
          <div className="main-container">
            <div className="space-y-8 md:space-y-12">
              <RevealAnimation delay={0.1}>
                <div className="max-w-[800px] space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
                    Marketplace <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                      Solana Startups
                    </span>
                  </h1>
                  <p className="text-white/60 text-lg md:text-xl max-w-[600px]">
                    Discover verified projects, track their progress, and connect with founders building the future of
                    Web3.
                  </p>
                </div>
              </RevealAnimation>

              <div className="flex items-center justify-between gap-4 border-y border-white/10 py-4 lg:hidden">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {isLoading ? 'Loading startups' : `${startups.length} results`}
                  </p>
                  <p className="mt-1 text-xs text-white/40">Filter the protected directory</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white">
                  <SlidersHorizontal aria-hidden="true" className="size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary-500 text-[11px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10">
                {/* Filters Sidebar */}
                <aside className="hidden lg:block">
                  <RevealAnimation delay={0.2}>
                    <StartupFilters filters={filters} onChange={setFilters} className="sticky top-[130px]" />
                  </RevealAnimation>
                </aside>

                {/* Results Grid */}
                <div className="min-w-0">
                  {isLoading ? (
                    <LoadingState />
                  ) : startups.length === 0 ? (
                    <EmptyState
                      title="No Startups Found"
                      description="We couldn't find any startups matching your current filters. Try adjusting your search or categories."
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
                      {startups.map((startup, index) => (
                        <StartupCard key={startup.id} startup={startup} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AuthGate>
      </main>

      <div
        className={`fixed inset-0 z-[1000] lg:hidden ${isFiltersOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isFiltersOpen}>
        <button
          type="button"
          aria-label="Close filters"
          tabIndex={isFiltersOpen ? 0 : -1}
          onClick={() => setIsFiltersOpen(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity ${isFiltersOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Marketplace filters"
          className={`absolute right-0 top-0 flex h-dvh w-full max-w-sm flex-col border-l border-white/10 bg-[#080808] transition-transform duration-300 ${
            isFiltersOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-white">Marketplace filters</h2>
              <p className="mt-1 text-xs text-white/40">{activeFilterCount} active filter groups</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFiltersOpen(false)}
              className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/60"
              aria-label="Close filters">
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="scroll-bar flex-1 overflow-y-auto p-4">
            <StartupFilters filters={filters} onChange={setFilters} className="border-0 bg-transparent p-1" />
          </div>
          <div className="border-t border-white/10 p-4">
            <button type="button" onClick={() => setIsFiltersOpen(false)} className="btn btn-primary btn-md w-full">
              Show {isLoading ? 'results' : `${startups.length} results`}
            </button>
          </div>
        </aside>
      </div>

      <FooterOne className="bg-black border-t border-white/10" />
    </div>
  );
}
