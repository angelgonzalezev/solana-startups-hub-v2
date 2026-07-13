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

export default function StartupsPage() {
  const { isAuthenticated } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filters, setFilters] = useState<IStartupFilters>({});
  const [isLoading, setIsLoading] = useState(true);

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

      <main className="flex-grow pt-[150px] pb-20">
        <AuthGate>
          <div className="main-container">
            <div className="space-y-12">
              <RevealAnimation delay={0.1}>
                <div className="max-w-[800px] space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                    Marketplace <br />
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

              <div className="grid grid-cols-12 gap-10">
                {/* Filters Sidebar */}
                <aside className="col-span-12 lg:col-span-3">
                  <RevealAnimation delay={0.2}>
                    <StartupFilters filters={filters} onChange={setFilters} />
                  </RevealAnimation>
                </aside>

                {/* Results Grid */}
                <div className="col-span-12 lg:col-span-9">
                  {isLoading ? (
                    <LoadingState />
                  ) : startups.length === 0 ? (
                    <EmptyState
                      title="No Startups Found"
                      description="We couldn't find any startups matching your current filters. Try adjusting your search or categories."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

      <FooterOne className="bg-black border-t border-white/10" />
    </div>
  );
}
