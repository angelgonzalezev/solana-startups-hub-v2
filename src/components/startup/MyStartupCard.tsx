'use client';

import React from 'react';
import { Startup } from '@/interface/startup';
import {
  VerificationStatusBadge,
  ListingStatusBadge,
  StartupStageBadge,
} from '../shared/Badges';
import Link from 'next/link';
import Image from 'next/image';

interface MyStartupCardProps {
  startup: Startup;
  onArchive?: (id: string) => void;
}

const MyStartupCard: React.FC<MyStartupCardProps> = ({ startup, onArchive }) => {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-[30px] p-6 flex flex-col md:flex-row items-center gap-6 hover:border-white/10 transition-all duration-300">
      <div className="w-24 h-24 rounded-2xl bg-black border border-white/5 flex-shrink-0 overflow-hidden relative">
        {startup.logo ? (
          <Image
            src={startup.logo}
            alt={startup.name}
            fill
            className="object-cover p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-2xl">
            {startup.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-grow space-y-3 text-center md:text-left w-full">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <h3 className="text-xl font-bold text-white">{startup.name}</h3>
          <StartupStageBadge stage={startup.stage} />
        </div>
        <p className="text-white/60 line-clamp-1">{startup.oneLiner}</p>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
          <VerificationStatusBadge status={startup.verificationStatus} />
          <ListingStatusBadge status={startup.listingStatus} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 md:border-l md:border-white/5 md:pl-6 w-full md:w-auto">
        <Link
          href={`/dashboard/startups/${startup.id}/edit`}
          className="btn btn-white-dark btn-sm hover:btn-primary"
        >
          Edit
        </Link>
        <Link
          href={`/dashboard/startups/${startup.id}/verification`}
          className="btn btn-white-dark btn-sm hover:btn-primary"
        >
          Verification
        </Link>
        {startup.listingStatus !== 'archived' && (
          <button
            onClick={() => onArchive && onArchive(startup.id)}
            className="btn btn-white-dark btn-sm hover:btn-red border-red-500/10 text-red-500/60 hover:text-red-500"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
};

export default MyStartupCard;
