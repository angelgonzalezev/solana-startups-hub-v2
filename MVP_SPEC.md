# Solana Startups Hub - MVP Specification

This file is now the compact source-of-truth index for the MVP. Detailed product, implementation, and delivery documentation lives in `docs/`.

## Agent Context Guide

Start here in every new session. Read this file first to understand the product, hard rules, routes, and which deeper document to open next. Do not load all docs by default; jump only to the linked file that matches the task.

Use this file when you need:

- A fast product summary.
- Non-negotiable rules.
- Route overview.
- The right documentation entry point.

## Product Summary

Solana Startups Hub is a curated marketplace directory for startups building in the Solana ecosystem.

The MVP lets founders sign in with a Solana wallet, complete a professional profile, list a startup, request verification, publish verified startups, and make them discoverable to logged-in users.

In v1, "marketplace" means structured discovery and founder contact through public social links. It does not include chat, offers, payments, or deal rooms.

## MVP v1 Scope

Included:

- Solana wallet login using SIWS and Supabase Auth.
- User/founder profile.
- Private dashboard.
- Create, edit, archive, verify, and publish owned startups.
- Protected marketplace of verified and published startups.
- Protected startup detail page.
- Filters by category, stage, tech stack, fundraising, and acquisition status.
- Founder contact through X and Telegram from the startup owner profile.

Out of scope:

- XMTP.
- Anonymous chat.
- Internal contact forms.
- Contact requests.
- Offers.
- USDC payments.
- Deal room.
- Real domain verification.
- Real X API integration.
- Notifications.
- Admin/reviewer dashboard.

## Non-Negotiable Rules

- Anonymous users can only see the landing page and aggregate/marketing information.
- Startup list, startup cards, filters with real results, startup detail, and founder contact require wallet login.
- A startup appears in marketplace only when `verificationStatus = verified` and `listingStatus = published`.
- Only the owner can edit, archive, request verification, or publish their startup.
- Founder contact v1 is limited to X and Telegram from the owner profile associated with the startup.
- `open_to_discuss` means open to acquisition conversations, not a transaction flow.
- Landing copy must not promise `trade startups`, `buy startups`, `USDC acquisitions`, or `deal room` in v1.

## Key Routes

| Route                                   | Access                 | Purpose                             |
| :-------------------------------------- | :--------------------- | :---------------------------------- |
| `/`                                     | Public                 | Landing page.                       |
| `/startups`                             | Logged-in only         | Marketplace.                        |
| `/startups/[id]`                        | Logged-in only         | Startup detail and founder contact. |
| `/dashboard`                            | Logged-in only         | Private overview.                   |
| `/dashboard/profile`                    | Logged-in only         | Edit profile.                       |
| `/dashboard/startups`                   | Logged-in only         | Manage owned startups.              |
| `/dashboard/startups/new`               | Logged-in with profile | Create startup.                     |
| `/dashboard/startups/[id]/edit`         | Owner only             | Edit startup.                       |
| `/dashboard/startups/[id]/verification` | Owner only             | Verification and publication.       |

## Documentation Map

Product:

- [Product Brief](docs/product/PRODUCT_BRIEF.md)
- [Access and Permissions](docs/product/ACCESS_AND_PERMISSIONS.md)
- [Metrics](docs/product/METRICS.md)

Implementation:

- [Implementation Blueprint](docs/implementation/IMPLEMENTATION_BLUEPRINT.md)
- [Data Models](docs/implementation/DATA_MODELS.md)
- [Validation Rules](docs/implementation/VALIDATION_RULES.md)
- [Services Contracts](docs/implementation/SERVICES_CONTRACTS.md)
- [Taxonomy](docs/implementation/TAXONOMY.md)
- [Mock Data Requirements](docs/implementation/MOCK_DATA_REQUIREMENTS.md)

Delivery:

- [Roadmap](docs/delivery/ROADMAP.md)
- [Task Backlog](docs/delivery/TASK_BACKLOG.md)
- [QA Checklist Pointer](docs/delivery/QA_CHECKLIST.md)
- Root checklist: [QA_CHECKLIST.md](QA_CHECKLIST.md)

## Current Progress Snapshot

Last audited: 2026-07-13.

- Done: 43/55 tasks.
- Partial: 10/55 tasks.
- Pending: 2/55 tasks.

See [Task Backlog](docs/delivery/TASK_BACKLOG.md) for task-level tracking.

## Current Technical Status

Wallet authentication and product persistence use Solana Wallet Standard and Supabase. Profile images and startup logos use owner-scoped Supabase Storage paths with public asset delivery. Database authorization is enforced by RLS and protected RPCs; local fixtures and pgTAP policy tests live under `supabase/`. Remaining release work is focused on the production reviewer flow, hosted wallet QA, final route cleanup, analytics, and broader test coverage.
