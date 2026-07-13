# Solana Startups Hub

Solana Startups Hub is a curated marketplace directory for startups building in the Solana ecosystem.

The MVP lets founders sign in by signing a message with a Solana wallet, complete a professional profile, list a startup, request verification, publish verified startups, and make them discoverable to logged-in users.

In v1, "marketplace" means structured discovery and founder contact through public social links. It does not include chat, offers, payments, USDC acquisition flows, or deal rooms.

## Current Status

Last audited: 2026-07-13.

- Core product routes are implemented.
- Solana wallet sign-in (SIWS) and SSR-backed Supabase sessions are implemented.
- Profiles and startups are persisted in Supabase/PostgreSQL with RLS and protected RPCs.
- User profile, dashboard, startup CRUD, verification, marketplace, detail page, and founder contact screens exist.
- Product and implementation documentation lives under `docs/`.
- Local seed data and database policy tests are included under `supabase/`.

Current task progress is tracked in [docs/delivery/TASK_BACKLOG.md](docs/delivery/TASK_BACKLOG.md).

## Product Scope

Included in the MVP:

- Solana wallet login using Wallet Standard-compatible wallets.
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
- Notifications.
- Admin/reviewer dashboard.

## Key Routes

| Route                                   | Access                 | Purpose                                         |
| :-------------------------------------- | :--------------------- | :---------------------------------------------- |
| `/`                                     | Public                 | Landing page.                                   |
| `/docs`                                 | Public                 | Product and contributor documentation.          |
| `/startups`                             | Logged-in only         | Marketplace of verified and published startups. |
| `/startups/[id]`                        | Logged-in only         | Startup detail and founder contact.             |
| `/dashboard`                            | Logged-in only         | Private overview.                               |
| `/dashboard/profile`                    | Logged-in only         | Edit founder profile.                           |
| `/dashboard/startups`                   | Logged-in only         | Manage owned startups.                          |
| `/dashboard/startups/new`               | Logged-in with profile | Create startup draft.                           |
| `/dashboard/startups/[id]/edit`         | Owner only             | Edit startup.                                   |
| `/dashboard/startups/[id]/verification` | Owner only             | Verification and publication.                   |

All inherited template routes have been removed. Unknown routes render the Solana Startups Hub 404 page.

## Tech Stack

- Next.js 15 App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- GSAP and Lenis for animation and smooth scrolling.
- Solana Wallet Standard via `@solana/client` and `@solana/react-hooks`.
- Supabase Auth, SSR, PostgreSQL, RLS, and SQL RPCs.

## Project Structure

```text
src/app/                         App Router pages
src/components/solana-hub/       Landing page sections
src/components/startup/          Startup marketplace and form components
src/components/profile/          Founder profile form
src/components/shared/           Shared shell, auth gate, states, badges, wallet button
src/context/                     React authentication context
src/lib/supabase/                Browser/server Supabase clients and mappers
src/data/startupTaxonomy.ts      Product taxonomy constants
src/interface/                   TypeScript interfaces
src/services/                    Supabase-backed product services
src/utils/validation.ts          Validation helpers
supabase/migrations/             Database schema, policies, triggers, and RPCs
supabase/tests/                  pgTAP database authorization tests
supabase/seed.sql                Local-only development fixtures
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

Public documentation site:

- Source package: [docs-site](docs-site)
- Local dev: `npm run docs:dev` at `http://localhost:3001/docs/`
- Static build: `npm run docs:build`
- Served path after build: `/docs`

## Getting Started

Prerequisites:

- Node.js 22 or higher.
- npm.
- A Supabase project, or Docker for the local Supabase stack.

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local`. For local Supabase development, start and reset the stack:

```bash
npm run supabase:start
npm run db:reset
```

Use the API URL, publishable key, and service-role key printed by `supabase:start`. For hosted environments, enable the Solana Web3 provider in Supabase Auth and provide the hosted project values instead. `SUPABASE_SERVICE_ROLE_KEY` provisions a profile only after the server verifies the SIWS identity; it also powers the optional development verification endpoint. It must never use a `NEXT_PUBLIC_` prefix.

Database migrations also provision the public `media` Storage bucket used for profile images and startup logos. Upload mutations require authentication and are restricted to the current user's object prefix. Images are cropped in the browser and stored as 512x512 WebP files; anyone with a resulting public URL can read the asset.

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
npm run build:netlify # Install docs dependencies and build for Netlify
npm run build:with-docs # Build Docusaurus docs and then the app
npm run docs:dev     # Start Docusaurus locally
npm run docs:build   # Generate static Docusaurus files under public/docs
npm run start        # Start the production server
npm run lint         # Run lint command configured in package.json
npm run lint:fix     # Run lint autofix command configured in package.json
npm run format       # Format files with Prettier
npm run format:check # Check formatting with Prettier
npm test             # Run TypeScript unit tests
npm run db:test      # Run pgTAP RLS/RPC tests (local Supabase required)
```

## Wallet Authentication

The app discovers installed Solana wallets through Wallet Standard and asks the selected wallet to sign Supabase's SIWS challenge. The resulting Supabase session is refreshed by middleware and is the only identity accepted by database policies.

Supported wallets depend on the user's installed Wallet Standard-compatible extensions. No embedded wallet or WalletConnect/Reown account is required.

Verification approval/rejection can be enabled only outside production with both `ENABLE_DEV_VERIFICATION=true` and `NEXT_PUBLIC_ENABLE_DEV_VERIFICATION=true`. This is a development aid, not an admin feature.

## Deploy to Netlify

Connect this repository to Netlify and select `main` as the production branch. The committed `netlify.toml` configures Node.js 22, builds the Docusaurus site under `/docs`, runs the Next.js production build, and publishes the `.next` output. Netlify detects Next.js and provisions its OpenNext adapter automatically; do not add or pin a legacy Next.js plugin.

Add these environment variables in **Project configuration → Environment variables**:

| Variable                               | Recommended scopes   | Secret |
| :------------------------------------- | :------------------- | :----- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Builds and Functions | No     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Builds and Functions | No     |
| `NEXT_PUBLIC_SOLANA_RPC_URL`           | Builds               | No     |
| `SUPABASE_SERVICE_ROLE_KEY`            | Functions only       | Yes    |

Use the hosted Supabase project values, not the local `127.0.0.1` values. Store `SUPABASE_SERVICE_ROLE_KEY` only in the Netlify UI, mark it as containing a secret value if that option is available, and never add it to `netlify.toml` or prefix it with `NEXT_PUBLIC_`. If your Netlify plan supports custom scopes, restrict it to Functions; otherwise, the default scope still does not expose it to the browser. Leave `ENABLE_DEV_VERIFICATION` and `NEXT_PUBLIC_ENABLE_DEV_VERIFICATION` unset or set to `false` in production.

In Supabase, keep the Solana Web3 provider enabled and set **Authentication → URL Configuration → Site URL** to the final Netlify production URL (or the custom domain). After saving the variables and URL, trigger a new production deploy.

## Known Gaps

The product is still mid-MVP. Before release:

- Align all landing copy with v1 messaging.
- Add the missing tech stack filter UI.
- Fix unconditional `IS RAISING` badges.
- Add direct `Save and request verification` flow.
- Add analytics mock.
- Replace development verification with a real reviewer/admin workflow.
- Add hosted-environment and wallet compatibility QA evidence.

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
