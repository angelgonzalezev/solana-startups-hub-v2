'use client';

import React from 'react';
import { Startup } from '@/interface/startup';
import { useAuth } from '@/context/AuthContext';
import { StartupStageBadge, MarketSignalBadge } from '../shared/Badges';
import Link from 'next/link';
import Image from 'next/image';
import { resolveMediaUrl } from '@/services/mediaService';

interface StartupDetailHeaderProps {
  startup: Startup;
}

const StartupDetailHeader: React.FC<StartupDetailHeaderProps> = ({ startup }) => {
  const { walletAddress } = useAuth();
  const isOwner = walletAddress === startup.ownerWallet;
  const logoUrl = resolveMediaUrl(startup.logo);

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center lg:gap-8">
        {/* Left Side: Logo & Info */}
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
          <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-[30px] border border-white/10 bg-[#0A0A0A] shadow-2xl shadow-primary-500/10 sm:size-28 lg:size-32">
            {logoUrl ? (
              <Image src={logoUrl} alt={startup.name} fill className="object-cover p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 font-bold text-4xl">
                {startup.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start sm:gap-4">
              <h1 className="break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-6xl">
                {startup.name}
              </h1>
              <StartupStageBadge stage={startup.stage} />
            </div>
            <p className="max-w-[700px] text-lg leading-8 text-white/70 sm:text-xl md:text-2xl">{startup.oneLiner}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {startup.isRaising && <MarketSignalBadge type="raising" />}
              <MarketSignalBadge type="acquisition" status={startup.acquisitionStatus} />
            </div>
          </div>
        </div>

        {/* Right Side: Actions (Owner only) */}
        {isOwner && (
          <div className="flex justify-center sm:justify-start lg:justify-end">
            <Link
              href={`/dashboard/startups/${startup.id}/edit`}
              className="btn btn-white-dark btn-xl w-full border-white/10 hover:btn-primary sm:w-auto">
              Edit Startup
            </Link>
          </div>
        )}
      </div>

      {/* Social & Web Links */}
      <div className="grid grid-cols-2 gap-3 border-y border-white/10 py-5 sm:flex sm:flex-wrap sm:items-center sm:justify-start sm:py-6">
        {startup.website && (
          <a
            href={startup.website}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-all hover:bg-white/10 sm:px-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white/40 group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span className="text-sm font-bold text-white/70 group-hover:text-white uppercase tracking-widest">
              Website
            </span>
          </a>
        )}
        {startup.twitter && (
          <a
            href={startup.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-all hover:bg-white/10 sm:px-5">
            <svg className="h-4 w-4 fill-white/40 group-hover:fill-white" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm font-bold text-white/70 group-hover:text-white uppercase tracking-widest">
              Twitter
            </span>
          </a>
        )}
        {startup.github && (
          <a
            href={startup.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-all hover:bg-white/10 sm:px-5">
            <svg className="h-5 w-5 fill-white/40 group-hover:fill-white" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span className="text-sm font-bold text-white/70 group-hover:text-white uppercase tracking-widest">
              GitHub
            </span>
          </a>
        )}
        {startup.discord && (
          <a
            href={startup.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-all hover:bg-white/10 sm:px-5">
            <svg className="h-5 w-5 fill-white/40 group-hover:fill-white" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.4,80.21a105.73,105.73,0,0,0,32.17,16.15,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.72-27.09-4.57-50.84-19.4-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5.07-12.65,11.41-12.65S54,46,53.86,53,48.81,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.07-12.65,11.44-12.65S96.23,46,96.12,53,91.07,65.69,84.69,65.69Z" />
            </svg>
            <span className="text-sm font-bold text-white/70 group-hover:text-white uppercase tracking-widest">
              Discord
            </span>
          </a>
        )}
      </div>
    </div>
  );
};

export default StartupDetailHeader;
