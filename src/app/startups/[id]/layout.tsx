import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { truncateDescription } from '@/lib/seo';
import { createSupabaseAnonClient } from '@/lib/supabase/anon';
import { resolveMediaUrl } from '@/services/mediaService';

interface StartupLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Pick<StartupLayoutProps, 'params'>): Promise<Metadata> {
  const { id } = await params;
  const supabase = createSupabaseAnonClient();
  if (!supabase) return {};

  try {
    const { data, error } = await supabase.rpc('get_accessible_startup', { startup_id: id });
    if (error) throw error;

    const startup = data as { name?: string; description?: string; logo?: string } | null;
    if (!startup?.name) return {};

    const description = startup.description ? truncateDescription(startup.description) : undefined;
    const logoUrl = resolveMediaUrl(startup.logo);

    return {
      title: startup.name,
      ...(description ? { description } : {}),
      alternates: { canonical: `/startups/${id}` },
      openGraph: {
        title: startup.name,
        ...(description ? { description } : {}),
        url: `/startups/${id}`,
        ...(logoUrl ? { images: [{ url: logoUrl, alt: startup.name }] } : {}),
      },
      twitter: {
        card: 'summary',
        title: startup.name,
        ...(description ? { description } : {}),
        ...(logoUrl ? { images: [logoUrl] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default function StartupDetailLayout({ children }: StartupLayoutProps) {
  return children;
}
