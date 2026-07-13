import type { User } from '@/interface/user';
import type {
  AcquisitionStatus,
  ListingStatus,
  Startup,
  StartupStage,
  TeamMember,
  VerificationCheckStatus,
  VerificationStatus,
} from '@/interface/startup';
import type { Json, ProfileRow, StartupRow } from '@/types/database';

export const mapProfileRow = (row: ProfileRow): User => ({
  avatar: row.avatar || undefined,
  bio: row.bio || undefined,
  displayName: row.display_name,
  jobTitle: row.job_title,
  joinedAt: row.joined_at,
  telegramHandle: row.telegram_handle || undefined,
  twitterHandle: row.twitter_handle || undefined,
  walletAddress: row.wallet_address,
});

const mapTeam = (team: Json): TeamMember[] => {
  if (!Array.isArray(team)) return [];

  return team.flatMap((member) => {
    if (!member || Array.isArray(member) || typeof member !== 'object') return [];
    const walletAddress = member.walletAddress;
    const role = member.role;
    return typeof walletAddress === 'string' && typeof role === 'string' ? [{ walletAddress, role }] : [];
  });
};

export const mapStartupRow = (row: StartupRow, ownerWallet?: string): Startup => ({
  acquisitionStatus: row.acquisition_status as AcquisitionStatus,
  category: row.category,
  createdAt: row.created_at,
  description: row.description,
  discord: row.discord || undefined,
  domainVerificationStatus: row.domain_verification_status as VerificationCheckStatus,
  github: row.github || undefined,
  id: row.id,
  isRaising: row.is_raising,
  listingStatus: row.listing_status as ListingStatus,
  logo: row.logo,
  mrr: row.mrr ?? undefined,
  name: row.name,
  oneLiner: row.one_liner,
  ownerWallet: row.owner_wallet || ownerWallet || '',
  showMrr: row.show_mrr,
  stage: row.stage as StartupStage,
  team: mapTeam(row.team),
  teamSize: row.team_size,
  techStack: row.tech_stack,
  twitter: row.twitter,
  updatedAt: row.updated_at,
  verificationRejectionReason: row.verification_rejection_reason || undefined,
  verificationStatus: row.verification_status as VerificationStatus,
  website: row.website,
  xVerificationStatus: row.x_verification_status as VerificationCheckStatus,
});

export const isStartupRow = (value: unknown): value is StartupRow =>
  Boolean(value && typeof value === 'object' && 'id' in value && 'owner_profile_id' in value);
