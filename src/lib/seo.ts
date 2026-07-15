export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orbitalhub.dev';
export const SITE_NAME = 'Orbital';
export const SITE_TITLE = 'Orbital — The Solana Startups Hub';
export const SITE_DESCRIPTION =
  'Discover startups orbiting the Solana ecosystem. Founders list their startup with market signals, team, and contact in a directory investors and builders actually browse.';
export const DEFAULT_OG_IMAGE = '/images/solana-hub/orbital-marketplace-demo.png';

export const truncateDescription = (text: string, maxLength = 160): string => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
};
