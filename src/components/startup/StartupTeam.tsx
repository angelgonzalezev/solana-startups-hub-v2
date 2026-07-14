'use client';

import Image from 'next/image';
import React from 'react';
import type { TeamMember } from '@/interface/startup';
import { resolveMediaUrl } from '@/services/mediaService';

interface StartupTeamProps {
  members: TeamMember[];
}

const truncateWallet = (wallet: string) => `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

const StartupTeam: React.FC<StartupTeamProps> = ({ members }) => {
  if (members.length === 0) return null;

  return (
    <div className="space-y-6 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">Team</h3>
        <p className="text-sm font-bold uppercase tracking-widest text-white/40">Collaborators tagged by the founder</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {members.map((member) => {
          const avatarUrl = resolveMediaUrl(member.avatar);
          const displayName = member.displayName || truncateWallet(member.walletAddress);

          return (
            <div key={member.walletAddress} className="group relative">
              <button
                type="button"
                title={`${displayName} • ${member.role}`}
                aria-label={`${displayName} - ${member.role}`}
                className="relative size-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#0A0A0A] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-base font-bold text-white/20">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </button>
              <span className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-medium text-white opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100">
                {displayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StartupTeam;
