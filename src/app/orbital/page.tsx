'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { startupService } from '@/services/startupService';
import { Startup } from '@/interface/startup';
import NavbarOne from '@/components/shared/header/NavbarOne';
import OrbitalGlobe from '@/components/orbital/OrbitalGlobe';

export default function OrbitalPage() {
  const [startups, setStartups] = useState<Startup[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await startupService.listPublishedStartups({});
        if (!cancelled) setStartups(data);
      } catch (error) {
        console.error('Error loading startups:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const locatedStartups = useMemo(
    () => startups.filter((startup) => startup.latitude !== undefined && startup.longitude !== undefined),
    [startups],
  );

  return (
    <div className="relative h-screen overflow-hidden bg-black text-white">
      <NavbarOne
        className="bg-black/60 backdrop-blur-[25px] border border-white/10 top-5"
        btnClassName="btn-primary hover:btn-white"
      />

      <div className="absolute inset-0">
        <OrbitalGlobe startups={locatedStartups} />
      </div>
    </div>
  );
}
