import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'The Orbital — Startups Around the Globe',
  description:
    'Explore the Solana startup ecosystem on an interactive 3D globe. Every published startup, geopositioned where it was founded.',
  alternates: { canonical: '/orbital' },
};

export default function OrbitalLayout({ children }: { children: ReactNode }) {
  return children;
}
