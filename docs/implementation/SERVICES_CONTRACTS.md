# Services Contracts

## Agent Context Guide

Open this file when implementing or changing `userService`, `startupService`, `verificationService`, filters, mutation rules, or service-level permission checks. Do not use UI components as the source of truth for business rules.

Related files:

- Permissions: `docs/product/ACCESS_AND_PERMISSIONS.md`
- Data models: `docs/implementation/DATA_MODELS.md`
- Validation: `docs/implementation/VALIDATION_RULES.md`
- Task status for services: `docs/delivery/TASK_BACKLOG.md`

Services isolate the UI from Supabase. Authorization is enforced by PostgreSQL RLS and security-definer RPCs, not by wallet parameters supplied by the browser.

## userService

- `getCurrentUser()`
- `getUserByWallet(walletAddress)`
- `upsertProfile(input, avatarMutation?)`

Rules:

- Validate profile input.
- Return `null` when user does not exist.
- Only update the profile bound to the authenticated Supabase user.
- Upload a replacement avatar before updating the profile, remove it if the database update fails, and clean up replaced managed media after success.

## startupService

```ts
type StartupFilters = {
  search?: string;
  category?: string[];
  stage?: StartupStage[];
  techStack?: string[];
  isRaising?: boolean;
  acquisitionStatus?: AcquisitionStatus;
};
```

Expected methods:

- `listPublishedStartups(filters)`
- `getStartupById(id)`
- `getAccessibleStartupById(id)`
- `listStartupsByOwner()`
- `createStartup(input, logoMutation?)`
- `updateStartup(id, input, logoMutation?)`
- `archiveStartup(id)`
- `publishStartup(id)`

Rules:

- Marketplace list returns only `verified + published`.
- Edit/archive/publish are owner-only through RLS/RPC authorization.
- `publishStartup` fails unless startup is `verified`.
- `archiveStartup` sets `listingStatus = archived`.
- Changing website/X on verified startup resets verification.
- Logo mutations use explicit `keep`, `replace`, and `remove` states so unrelated saves never alter media.

## mediaService

- Validate JPEG, PNG, and WebP inputs up to 2 MB.
- Upload processed WebP files under the authenticated user's Storage prefix.
- Resolve managed object paths to public URLs while passing legacy absolute URLs through unchanged.
- Delete only managed paths; cleanup failures after a successful database save are logged and do not revert the saved record.

## verificationService

- `requestVerification(startupId)`
- `devSetVerification(startupId, decision, reason?)`

Rules:

- Request fails if profile or startup requirements are missing.
- Request sets checks to `pending`.
- Approve sets checks to `verified`.
- Reject sets checks to `failed`.
- Development approve/reject requires explicit server and client flags, a non-production runtime, an authenticated owner, and the service-role-backed API route.
