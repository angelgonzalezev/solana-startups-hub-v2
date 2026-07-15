import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    default: 'Startup Marketplace',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Browse published Solana startups by category, stage, and tech stack. Find teams that are raising, open to acquisition, or just launching.',
  alternates: { canonical: '/startups' },
};

export default function StartupsLayout({ children }: { children: ReactNode }) {
  return children;
}
