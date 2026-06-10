'use client';

import React, { useEffect, useState } from 'react';
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

export default function StartupDetailPage({ params }: { params: { id: string } }) {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [founder, setFounder] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const s = await startupService.getStartupById(params.id);
      if (s) {
        setStartup(s);
        const u = await userService.getUserByWallet(s.ownerWallet);
        setFounder(u);
      }
    } catch (error) {
      console.error('Error loading startup data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <NavbarOne
        className="bg-black/60 backdrop-blur-[25px] border border-white/10 top-5"
        btnClassName="btn-primary hover:btn-white"
      />

      <main className="flex-grow pt-[150px] pb-20">
        <AuthGate>
          <div className="main-container">
            {isLoading ? (
              <LoadingState />
            ) : !startup ? (
              <ErrorState message="Startup not found or not available." />
            ) : (
              <div className="grid grid-cols-12 gap-12">
                {/* Main Content */}
                <div className="col-span-12 lg:col-span-8 space-y-16">
                  <RevealAnimation delay={0.1}>
                    <StartupDetailHeader startup={startup} />
                  </RevealAnimation>

                  <RevealAnimation delay={0.2}>
                    <div className="space-y-8">
                      <h3 className="text-3xl font-bold text-white tracking-tight underline decoration-primary-500/30 decoration-4 underline-offset-8">About the Project</h3>
                      <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed whitespace-pre-wrap">
                        {startup.description}
                      </div>
                    </div>
                  </RevealAnimation>

                  {/* Team & Stack Section */}
                  <RevealAnimation delay={0.3}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-white/5">
                        <div className="space-y-6">
                            <h4 className="text-xl font-bold text-white uppercase tracking-widest">Tech Stack</h4>
                            <div className="flex flex-wrap gap-3">
                                {startup.techStack.map(tech => (
                                    <span key={tech} className="px-4 py-2 bg-primary-500/5 border border-primary-500/20 rounded-xl text-primary-400 font-medium">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                             <h4 className="text-xl font-bold text-white uppercase tracking-widest">Categories</h4>
                            <div className="flex flex-wrap gap-3">
                                {startup.category.map(cat => (
                                    <span key={cat} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium">
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
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[30px] p-8 space-y-6">
                            <h4 className="text-lg font-bold text-white uppercase tracking-widest">Key Metrics</h4>
                            <div className="space-y-4">
                                <MetricItem label="Stage" value={startup.stage} />
                                <MetricItem label="Team Size" value={`${startup.teamSize} members`} />
                                {startup.showMrr && startup.mrr !== undefined && (
                                    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0" suppressHydrationWarning>
                                        <span className="text-white/40 text-sm font-medium uppercase tracking-wider">MRR</span>
                                        <span className="text-white font-bold tracking-tight">${startup.mrr.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <span className="text-white/40 text-sm font-medium uppercase tracking-wider">Launched</span>
                                    <span className="text-white font-bold tracking-tight" suppressHydrationWarning>{new Date(startup.createdAt).toLocaleDateString()}</span>
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

const MetricItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
        <span className="text-white/40 text-sm font-medium uppercase tracking-wider">{label}</span>
        <span className="text-white font-bold tracking-tight">{value}</span>
    </div>
);
