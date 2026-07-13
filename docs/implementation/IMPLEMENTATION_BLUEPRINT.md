# Implementation Blueprint

## Agent Context Guide

Open this file when building or modifying screens, routes, page layouts, protected pages, or shared UI components. This is the main implementation map. If you only need types, validation, or service contracts, open the narrower implementation docs instead.

Related files:

- Data types: `docs/implementation/DATA_MODELS.md`
- Validation: `docs/implementation/VALIDATION_RULES.md`
- Services: `docs/implementation/SERVICES_CONTRACTS.md`
- Permissions: `docs/product/ACCESS_AND_PERMISSIONS.md`
- Current task status: `docs/delivery/TASK_BACKLOG.md`

New product screens must keep the current landing visual style: dark background, Solana purple/green accents, dark cards, subtle borders, premium spacing, and responsive layouts.

## Route Map

| Route                                   | Access                         | Purpose                                         |
| :-------------------------------------- | :----------------------------- | :---------------------------------------------- |
| `/`                                     | Public                         | Landing page.                                   |
| `/startups`                             | Logged-in only                 | Marketplace of verified and published startups. |
| `/startups/[id]`                        | Logged-in only                 | Startup detail and founder contact.             |
| `/dashboard`                            | Logged-in only                 | Private user overview.                          |
| `/dashboard/profile`                    | Logged-in only                 | Create/edit user profile.                       |
| `/dashboard/startups`                   | Logged-in only                 | Manage owned startups.                          |
| `/dashboard/startups/new`               | Logged-in with minimum profile | Create startup draft.                           |
| `/dashboard/startups/[id]/edit`         | Owner only                     | Edit owned startup.                             |
| `/dashboard/startups/[id]/verification` | Owner only                     | Request verification and publish.               |

Template routes like `/case-study` and `/use-case` are not final product routes.

## Screen Specs

### `/` Landing

- Public.
- Shows marketing only.
- Must not show individual startup data.
- Main CTAs: `Connect Wallet`, `Explore Startups`, `List Your Startup`.
- CTAs to protected routes should lead to auth gate if disconnected.
- Copy must follow v1 messaging rules.

### `/startups`

- Protected by `AuthGate`.
- Loads only `verified + published` startups.
- Components: `StartupFilters`, search, grid, `StartupCard`, loading, empty, error state.
- Filters: category, stage, tech stack, `isRaising`, `acquisitionStatus`.
- Filters must combine and reset.

### `/startups/[id]`

- Protected by `AuthGate`.
- Shows only available `verified + published` startups.
- Components: `StartupDetailHeader`, badges, description, category, tech stack, team, metrics, `FounderContact`.
- Owner sees `Edit startup`.
- Non-owner does not see edit controls.
- Empty contact state: `No public founder contact available yet`.

### `/dashboard`

- Protected by `AuthGate`.
- Shows current user summary and owned startup stats.
- CTAs: `Edit profile`, `List new startup`, `Manage startups`, `Explore marketplace`.

### `/dashboard/profile`

- Protected by `AuthGate`.
- Fields: display name, job title, X, Telegram, uploaded/cropped profile image, bio.
- Saves with `userService.upsertProfile`.
- Must show per-field errors.

### `/dashboard/startups`

- Protected by `AuthGate`.
- Shows only startups where `ownerWallet` matches current wallet.
- Shows all owner states, including draft/pending/rejected/archived.
- Actions: edit, verification, archive, view public detail when published.

### `/dashboard/startups/new`

- Protected by `AuthGate`.
- Requires minimum profile.
- Blocks with CTA `Complete profile` if profile is incomplete.
- Uses `StartupForm`.
- Saves startup as `draft`.
- Supports an optional uploaded/cropped logo, deferred until the draft is saved.

### `/dashboard/startups/[id]/edit`

- Protected and owner-only.
- Uses `StartupForm`.
- Supports keeping, replacing, or removing the existing logo.
- Non-owner gets permission error.
- Changing website/X on a verified startup resets verification.

### `/dashboard/startups/[id]/verification`

- Protected and owner-only.
- Shows verification checklist.
- `Request verification` disabled until requirements pass.
- The protected database request function sets verification to `pending`.
- Simulated approve/reject is allowed only through the explicitly gated, non-production development endpoint.
- Publish is available only when verified.

## Expected UI Components

- `WalletConnectButton`
- `AuthGate`
- `DashboardShell`
- `StartupCard`
- `StartupFilters`
- `StartupDetailHeader`
- `StartupStatusBadge`
- `VerificationStatusBadge`
- `ListingStatusBadge`
- `MarketSignalBadge`
- `FounderContact`
- `ProfileForm`
- `StartupForm`
- `MyStartupCard`
- `EmptyState`
- `LoadingState`
- `ErrorState`
