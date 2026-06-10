'use client';

import React from 'react';
import { Startup } from '@/interface/startup';
import { StartupStageBadge, MarketSignalBadge } from '../shared/Badges';
import Link from 'next/link';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';

interface StartupCardProps {
  startup: Startup;
  index?: number;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, index = 0 }) => {
  return (
    <RevealAnimation delay={0.1 * (index % 4)}>
      <div className="bg-[#0A0A0A] border border-white/5 rounded-[30px] p-8 flex flex-col h-full hover:border-primary-500/30 transition-all duration-500 group relative overflow-hidden">
        {/* Market Signals (Top Right) */}
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-10">
          {startup.isRaising && <MarketSignalBadge type="raising" />}
          <MarketSignalBadge type="acquisition" status={startup.acquisitionStatus} />
        </div>

        <div className="space-y-6 flex-grow">
          {/* Header: Logo & Name */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex-shrink-0 overflow-hidden relative group-hover:border-primary-500/50 transition-colors">
              {startup.logo ? (
                <Image src={startup.logo} alt={startup.name} fill className="object-cover p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-xl">
                  {startup.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                {startup.name}
              </h3>
              <div className="flex items-center gap-2">
                <StartupStageBadge stage={startup.stage} />
              </div>
            </div>
          </div>

          {/* Body: One Liner */}
          <p className="text-white/70 text-lg leading-relaxed line-clamp-2">{startup.oneLiner}</p>

          {/* Taxonomy Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {startup.category.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/40 uppercase tracking-widest font-medium">
                {cat}
              </span>
            ))}
            {startup.techStack.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-primary-500/5 border border-primary-500/10 rounded-full text-xs text-primary-400/60 uppercase tracking-widest font-medium">
                {tech}
              </span>
            ))}
            {(startup.category.length > 2 || startup.techStack.length > 2) && (
              <span className="text-white/20 text-xs self-center ml-1">...</span>
            )}
          </div>
        </div>

        {/* Footer: Metrics & CTA */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            {startup.showMrr && startup.mrr !== undefined ? (
              <div suppressHydrationWarning>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">MRR</p>
                <p className="text-white font-bold">${startup.mrr.toLocaleString()}</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Team</p>
                <p className="text-white font-bold">
                  {startup.teamSize} member{startup.teamSize !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          <Link
            href={`/startups/${startup.id}`}
            className="btn btn-white-dark btn-sm group-hover:btn-primary transition-all">
            View Startup
          </Link>
        </div>
      </div>
    </RevealAnimation>
  );
};

export default StartupCard;
