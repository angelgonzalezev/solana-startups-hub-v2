import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { createSupabaseAnonClient } from '@/lib/supabase/anon';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/startups`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/orbital`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const supabase = createSupabaseAnonClient();
  if (!supabase) return staticEntries;

  try {
    const { data, error } = await supabase.rpc('list_published_startups', {
      acquisition: null,
      categories: null,
      raising: null,
      search_text: null,
      stages: null,
      technologies: null,
    });
    if (error) throw error;

    const startupEntries: MetadataRoute.Sitemap = (data || []).flatMap((row) => {
      const startup = row as { id?: string; updated_at?: string };
      if (!startup?.id) return [];
      return [
        {
          url: `${SITE_URL}/startups/${startup.id}`,
          ...(startup.updated_at ? { lastModified: new Date(startup.updated_at) } : {}),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
      ];
    });

    return [...staticEntries, ...startupEntries];
  } catch (error) {
    console.error('sitemap: unable to list published startups:', error);
    return staticEntries;
  }
}
