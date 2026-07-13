# Data Models

## Agent Context Guide

Open this file when changing TypeScript interfaces, Supabase tables, service inputs/outputs, or visibility fields like `showMrr`, `verificationStatus`, and `listingStatus`. Do not use this file for screen behavior; use `IMPLEMENTATION_BLUEPRINT.md`.

Related files:

- Validation rules: `docs/implementation/VALIDATION_RULES.md`
- Service contracts: `docs/implementation/SERVICES_CONTRACTS.md`
- Mock data requirements: `docs/implementation/MOCK_DATA_REQUIREMENTS.md`

## User

The database stores this product model in `profiles`. `profiles.auth_user_id` binds it to `auth.users`; `walletAddress` remains the public Solana identity exposed to the UI.

`avatar` stores a `media` bucket object path for managed uploads. Legacy absolute URLs remain supported while reading existing data.

```ts
export interface User {
  walletAddress: string;
  displayName: string;
  jobTitle: string;
  twitterHandle?: string;
  telegramHandle?: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
}
```

## Startup

The database stores this model in `startups` using `owner_profile_id`; `ownerWallet` is derived when mapping database results to the UI model.

`logo` stores a `media` bucket object path for managed uploads. Client rendering resolves managed paths to public Storage URLs.

```ts
export type StartupStage = 'Idea' | 'MVP' | 'Early-stage' | 'Scaling' | 'Established';

export type AcquisitionStatus = 'not_open' | 'open_to_discuss';

export type VerificationStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export type ListingStatus = 'draft' | 'published' | 'archived';

export type VerificationCheckStatus = 'not_started' | 'pending' | 'verified' | 'failed';

export interface TeamMember {
  walletAddress: string;
  role: string;
}

export interface Startup {
  id: string;
  ownerWallet: string;
  name: string;
  logo: string;
  oneLiner: string;
  description: string;
  website: string;
  twitter: string;
  discord?: string;
  github?: string;
  stage: StartupStage;
  isRaising: boolean;
  acquisitionStatus: AcquisitionStatus;
  mrr?: number;
  showMrr: boolean;
  teamSize: number;
  techStack: string[];
  category: string[];
  team: TeamMember[];
  verificationStatus: VerificationStatus;
  listingStatus: ListingStatus;
  domainVerificationStatus: VerificationCheckStatus;
  xVerificationStatus: VerificationCheckStatus;
  createdAt: string;
  updatedAt: string;
}
```

## Visibility Rule

A startup appears in marketplace only when:

```ts
startup.verificationStatus === 'verified' && startup.listingStatus === 'published';
```

## MRR Rule

- `mrr` is optional.
- `showMrr` controls whether MRR appears to logged-in users.
- If `showMrr = false`, do not show MRR in marketplace or detail.
- RLS-protected marketplace/detail RPCs remove `mrr` from their JSON response when `showMrr = false`; this is not only a presentation rule.
