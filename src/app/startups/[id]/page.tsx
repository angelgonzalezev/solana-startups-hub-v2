'use client';

import React, { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startupService } from '@/services/startupService';
import { userService } from '@/services/userService';
import { Startup } from '@/interface/startup';
import { User } from '@/interface/user';
import AuthGate from '@/components/shared/AuthGate';
import NavbarOne from '@/components/shared/header/NavbarOne';
import FooterOne from '@/components/shared/footer/FooterOne';
import StartupDetailHeader from '@/components/startup/StartupDetailHeader';
import FounderContact from '@/components/startup/FounderContact';
import { LoadingState, ErrorState } from '@/components/shared/States';
import RevealAnimation from '@/components/animation/RevealAnimation';

export default function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [founder, setFounder] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, walletAddress } = useAuth();

  useEffect(() => {
    if (!id || !isAuthenticated) {
      setStartup(null);
      setFounder(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const s = await startupService.getAccessibleStartupById(id);
        if (!cancelled) {
          setStartup(s);
          if (s) {
            const u = await userService.getUserByWallet(s.ownerWallet);
            if (!cancelled) {
              setFounder(u);
            }
          } else {
            setFounder(null);
          }
        }
      } catch (error) {
        console.error('Error loading startup data:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, walletAddress]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavbarOne
        className="bg-black/60 backdrop-blur-[25px] border border-white/10 top-5"
        btnClassName="btn-primary hover:btn-white"
      />

      <main className="flex-grow pb-16 pt-[120px] md:pb-20 md:pt-[150px]">
        <AuthGate>
          <div className="main-container">
            {isLoading ? (
              <LoadingState />
            ) : !startup ? (
              <ErrorState message="Startup not found or not available." />
            ) : (
              <div className="grid grid-cols-12 gap-10 lg:gap-12">
                {/* Main Content */}
                <div className="col-span-12 space-y-12 lg:col-span-8 lg:space-y-16">
                  <RevealAnimation delay={0.1}>
                    <StartupDetailHeader startup={startup} />
                  </RevealAnimation>

                  <RevealAnimation delay={0.2}>
                    <div className="space-y-8">
                      <h3 className="text-2xl font-bold tracking-tight text-white underline decoration-primary-500/30 decoration-4 underline-offset-8 sm:text-3xl">
                        About the Project
                      </h3>
                      <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed whitespace-pre-wrap">
                        {startup.description}
                      </div>
                    </div>
                  </RevealAnimation>

                  {/* Team & Stack Section */}
                  <RevealAnimation delay={0.3}>
                    <div className="grid grid-cols-1 gap-8 border-t border-white/10 pt-8 md:grid-cols-2 md:gap-12 md:pt-10">
                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-white uppercase tracking-widest">Tech Stack</h4>
                        <div className="flex flex-wrap gap-3">
                          {startup.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-md border border-primary-500/20 bg-primary-500/5 px-3 py-2 font-medium text-primary-400">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-white uppercase tracking-widest">Categories</h4>
                        <div className="flex flex-wrap gap-3">
                          {startup.category.map((cat) => (
                            <span
                              key={cat}
                              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-medium text-white/60">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </RevealAnimation>
                </div>

                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-4 space-y-8">
                  <RevealAnimation delay={0.4}>
                    <div className="space-y-6 rounded-lg border border-white/10 bg-[#0A0A0A] p-5 sm:p-6">
                      <h4 className="text-lg font-bold text-white uppercase tracking-widest">Key Metrics</h4>
                      <div className="space-y-4">
                        <MetricItem label="Stage" value={startup.stage} />
                        <MetricItem label="Team Size" value={`${startup.teamSize} members`} />
                        {startup.showMrr && startup.mrr !== undefined && (
                          <div
                            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                            suppressHydrationWarning>
                            <span className="text-white/40 text-sm font-medium uppercase tracking-wider">MRR</span>
                            <span className="text-white font-bold tracking-tight">${startup.mrr.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <span className="text-white/40 text-sm font-medium uppercase tracking-wider">Launched</span>
                          <span className="text-white font-bold tracking-tight" suppressHydrationWarning>
                            {new Date(startup.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </RevealAnimation>

                  <RevealAnimation delay={0.5}>
                    <FounderContact founder={founder} />
                  </RevealAnimation>
                </aside>
              </div>
            )}
          </div>
        </AuthGate>
      </main>

      <FooterOne className="bg-black border-t border-white/10" />
    </div>
  );
}

const MetricItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <span className="text-white/40 text-sm font-medium uppercase tracking-wider">{label}</span>
    <span className="text-white font-bold tracking-tight">{value}</span>
  </div>
);
