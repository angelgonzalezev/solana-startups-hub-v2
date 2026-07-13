'use client';

import React from 'react';
import { User } from '@/interface/user';
import Image from 'next/image';
import { resolveMediaUrl } from '@/services/mediaService';

interface FounderContactProps {
  founder: User | null;
}

const FounderContact: React.FC<FounderContactProps> = ({ founder }) => {
  if (!founder) return null;

  const hasSocials = !!founder.twitterHandle || !!founder.telegramHandle;
  const avatarUrl = resolveMediaUrl(founder.avatar);

  return (
    <div className="space-y-7 rounded-[30px] border border-white/5 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">Founder Contact</h3>
        <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Reach out directly to the team</p>
      </div>

      <div className="flex flex-col items-center gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-start">
        <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={founder.displayName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10 font-bold text-2xl">
              {founder.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h4 className="text-xl font-bold text-white">{founder.displayName}</h4>
          <p className="text-primary-500 font-medium">{founder.jobTitle}</p>
          {founder.bio && <p className="text-white/60 text-sm max-w-[300px] pt-1">{founder.bio}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {!hasSocials ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-center">
            <p className="text-white/30 italic">No public founder contact available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {founder.twitterHandle && (
              <a
                href={`https://x.com/${founder.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-white/10 bg-black p-4 transition-all hover:border-primary-500/50 hover:bg-primary-500/5">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 fill-white/40 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="break-all font-bold text-white/70 transition-colors group-hover:text-white">
                    @{founder.twitterHandle}
                  </span>
                </div>
                <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold group-hover:text-primary-500 transition-colors">
                  Twitter / X
                </span>
              </a>
            )}
            {founder.telegramHandle && (
              <a
                href={`https://t.me/${founder.telegramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-white/10 bg-black p-4 transition-all hover:border-primary-500/50 hover:bg-primary-500/5">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 fill-white/40 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.441-.168.575-.533.766-.74.785-.453.041-.795-.299-1.233-.584-.687-.446-1.074-.722-1.741-1.161-.77-.506-.271-.785.168-1.241.115-.12 2.112-1.939 2.15-2.103.005-.021.01-.1-.035-.139-.046-.039-.114-.026-.163-.015-.069.016-1.171.744-3.308 2.185-.313.215-.597.321-.852.315-.282-.007-.824-.16-1.228-.291-.494-.161-.887-.247-.852-.521.018-.143.214-.289.587-.439 2.296-.999 3.827-1.658 4.591-1.977 2.183-.91 2.637-1.068 2.933-1.073.065-.001.21.015.304.092.079.064.102.151.111.218.009.064.012.2.008.32z" />
                  </svg>
                  <span className="break-all font-bold text-white/70 transition-colors group-hover:text-white">
                    @{founder.telegramHandle}
                  </span>
                </div>
                <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold group-hover:text-primary-500 transition-colors">
                  Telegram
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FounderContact;
