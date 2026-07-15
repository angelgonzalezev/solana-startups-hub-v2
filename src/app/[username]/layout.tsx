import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { truncateDescription } from '@/lib/seo';
import { createSupabaseAnonClient } from '@/lib/supabase/anon';
import { USERNAME_PATTERN } from '@/utils/validation';

interface UsernameLayoutProps {
  children: ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Pick<UsernameLayoutProps, 'params'>): Promise<Metadata> {
  const { username } = await params;
  const normalized = decodeURIComponent(username ?? '').toLowerCase();
  if (!USERNAME_PATTERN.test(normalized)) return {};

  const supabase = createSupabaseAnonClient();
  if (!supabase) return {};

  try {
    const { data, error } = await supabase.rpc('get_public_profile_by_username', { name: normalized });
    if (error) throw error;

    const profile = data as { display_name?: string; username?: string; bio?: string; job_title?: string } | null;
    if (!profile?.username) return {};

    const title = profile.display_name ? `${profile.display_name} (@${profile.username})` : `@${profile.username}`;
    const description = truncateDescription(
      profile.bio || profile.job_title || `${title} on Orbital, the Solana startups hub.`,
    );

    return {
      title,
      description,
      alternates: { canonical: `/${profile.username}` },
      openGraph: { title, description, url: `/${profile.username}` },
      twitter: { card: 'summary', title, description },
    };
  } catch {
    return {};
  }
}

export default function UsernameLayout({ children }: UsernameLayoutProps) {
  return children;
}
