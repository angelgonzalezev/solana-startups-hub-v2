# Solana Startups Hub

Solana Startups Hub is a curated marketplace directory for startups building in the Solana ecosystem.

The MVP lets founders connect a wallet, complete a professional profile, list a startup, request mock verification, publish verified startups, and make them discoverable to logged-in users.

In v1, "marketplace" means structured discovery and founder contact through public social links. It does not include chat, offers, payments, USDC acquisition flows, or deal rooms.

## Current Status

Last audited: 2026-06-10.

- Core product routes are implemented.
- Mock wallet authentication is implemented.
- User profile, dashboard, startup CRUD, verification, marketplace, detail page, and founder contact screens exist.
- Product and implementation documentation lives under `docs/`.
- The project is not release-ready yet because `npm run build` still fails during lint/type validity checks.

Current task progress is tracked in [docs/delivery/TASK_BACKLOG.md](docs/delivery/TASK_BACKLOG.md).

## Product Scope

Included in the MVP:

- Wallet login or mock wallet login.
- Founder profile.
- Private dashboard.
- Create, edit, archive, verify, and publish owned startups.
- Protected marketplace for logged-in users.
- Protected startup detail pages.
- Filters by category, stage, tech stack, fundraising, and acquisition status.
- Founder contact through the startup creator's X and Telegram links.

Out of scope for v1:

- XMTP.
- Anonymous chat.
- Internal contact forms.
- Saved contact requests.
- Offers.
- USDC payments.
- Deal room.
- Real domain verification.
- Real X API integration.
- Supabase/PostgreSQL.
- Notifications.
- Admin/reviewer dashboard.

## Key Routes

| Route                                   | Access                 | Purpose                                         |
| :-------------------------------------- | :--------------------- | :---------------------------------------------- |
| `/`                                     | Public                 | Landing page.                                   |
| `/startups`                             | Logged-in only         | Marketplace of verified and published startups. |
| `/startups/[id]`                        | Logged-in only         | Startup detail and founder contact.             |
| `/dashboard`                            | Logged-in only         | Private overview.                               |
| `/dashboard/profile`                    | Logged-in only         | Edit founder profile.                           |
| `/dashboard/startups`                   | Logged-in only         | Manage owned startups.                          |
| `/dashboard/startups/new`               | Logged-in with profile | Create startup draft.                           |
| `/dashboard/startups/[id]/edit`         | Owner only             | Edit startup.                                   |
| `/dashboard/startups/[id]/verification` | Owner only             | Verification and publication.                   |

## Tech Stack

- Next.js 15 App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- GSAP and Lenis for animation and smooth scrolling.
- Static mock data in JSON files.
- Mock services for users, startups, verification, and wallet auth.

## Project Structure

```text
src/app/                         App Router pages
src/components/solana-hub/       Landing page sections
src/components/startup/          Startup marketplace and form components
src/components/profile/          Founder profile form
src/components/shared/           Shared shell, auth gate, states, badges, wallet button
src/context/                     React contexts, including mock auth
src/data/mock/                   Mock users and startups
src/data/startupTaxonomy.ts      Product taxonomy constants
src/interface/                   TypeScript interfaces
src/services/                    Mock product services
src/utils/validation.ts          Validation helpers
docs/product/                    Product definition and rules
docs/implementation/             Implementation blueprint and contracts
docs/delivery/                   Roadmap and task backlog
skills/create-commit/            Repo copy of the commit helper skill
```

## Documentation Map

Start with [MVP_SPEC.md](MVP_SPEC.md) for the compact source-of-truth index.

Product docs:

- [Product Brief](docs/product/PRODUCT_BRIEF.md)
- [Access and Permissions](docs/product/ACCESS_AND_PERMISSIONS.md)
- [Metrics](docs/product/METRICS.md)

Implementation docs:

- [Implementation Blueprint](docs/implementation/IMPLEMENTATION_BLUEPRINT.md)
- [Data Models](docs/implementation/DATA_MODELS.md)
- [Validation Rules](docs/implementation/VALIDATION_RULES.md)
- [Services Contracts](docs/implementation/SERVICES_CONTRACTS.md)
- [Taxonomy](docs/implementation/TAXONOMY.md)
- [Mock Data Requirements](docs/implementation/MOCK_DATA_REQUIREMENTS.md)

Delivery docs:

- [Roadmap](docs/delivery/ROADMAP.md)
- [Task Backlog](docs/delivery/TASK_BACKLOG.md)
- [QA Checklist](QA_CHECKLIST.md)

## Getting Started

Prerequisites:

- Node.js 18 or higher.
- npm.

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev          # Start the local development server
npm run build        # Build for production
npm run start        # Start the production server
npm run lint         # Run lint command configured in package.json
npm run lint:fix     # Run lint autofix command configured in package.json
npm run format       # Format files with Prettier
npm run format:check # Check formatting with Prettier
```

## Mock Auth

The app currently uses mock wallet auth for MVP development.

The current mock wallet is defined in [src/context/AuthContext.tsx](src/context/AuthContext.tsx).

Use the shared wallet button to connect or disconnect in local development. Startup data routes are protected and should show an auth gate when the wallet is disconnected.

## Known Gaps

The product is still mid-MVP. Before release:

- Make `npm run build` pass fully.
- Fix remaining lint/type errors, including `no-explicit-any`, unused imports, unescaped apostrophes, and hook dependency warnings.
- Align all landing copy with v1 messaging.
- Ensure service-level startup visibility cannot return unavailable startups to non-owners.
- Add the missing tech stack filter UI.
- Fix unconditional `IS RAISING` badges.
- Add direct `Save and request verification` flow.
- Add analytics mock.
- Add unit tests for validation and services.
- Update QA evidence after manual/browser checks.

## Commit Convention

This project uses task-based commits for product work:

```text
agonzalez/TASK-ID/commit-title
```

Example:

```text
agonzalez/TASK-042/update-readme
```

Use [docs/delivery/TASK_BACKLOG.md](docs/delivery/TASK_BACKLOG.md) to choose the task ID. The helper skill is documented in [skills/create-commit/SKILL.md](skills/create-commit/SKILL.md).
