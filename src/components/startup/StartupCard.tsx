'use client';

import React from 'react';
import { Startup } from '@/interface/startup';
import { StartupStageBadge, MarketSignalBadge } from '../shared/Badges';
import Link from 'next/link';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import { resolveMediaUrl } from '@/services/mediaService';

interface StartupCardProps {
  startup: Startup;
  index?: number;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, index = 0 }) => {
  const logoUrl = resolveMediaUrl(startup.logo);

  return (
    <RevealAnimation delay={0.1 * (index % 4)}>
      <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 transition-colors duration-300 hover:border-primary-500/30 sm:p-6 lg:p-8">
        <div className="mb-5 flex min-h-6 flex-wrap items-center gap-2">
          {startup.isRaising && <MarketSignalBadge type="raising" />}
          <MarketSignalBadge type="acquisition" status={startup.acquisitionStatus} />
        </div>

        <div className="flex-grow space-y-5">
          {/* Header: Logo & Name */}
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black transition-colors group-hover:border-primary-500/50 sm:size-16">
              {logoUrl ? (
                <Image src={logoUrl} alt={startup.name} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-xl">
                  {startup.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 space-y-2">
              <h3 className="break-words text-xl font-bold text-white transition-colors group-hover:text-primary-400 sm:text-2xl">
                {startup.name}
              </h3>
              <div className="flex items-center gap-2">
                <StartupStageBadge stage={startup.stage} />
              </div>
            </div>
          </div>

          {/* Body: One Liner */}
          <p className="line-clamp-3 text-base leading-7 text-white/70 sm:text-lg">{startup.oneLiner}</p>

          {/* Taxonomy Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {startup.category.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium uppercase text-white/45">
                {cat}
              </span>
            ))}
            {startup.techStack.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-primary-500/10 bg-primary-500/5 px-2.5 py-1 text-xs font-medium uppercase text-primary-400/70">
                {tech}
              </span>
            ))}
            {(startup.category.length > 2 || startup.techStack.length > 2) && (
              <span className="text-white/20 text-xs self-center ml-1">...</span>
            )}
          </div>
        </div>

        {/* Footer: Metrics & CTA */}
        <div className="mt-7 flex flex-col gap-4 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
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
            className="btn btn-white-dark btn-md w-full transition-all group-hover:btn-primary sm:w-auto">
            View Startup
          </Link>
        </div>
      </article>
    </RevealAnimation>
  );
};

export default StartupCard;
