# Product Brief - Orbital

## Agent Context Guide

Open this file when you need product intent, user definitions, v1 scope, out-of-scope boundaries, core flows, product principles, or approved messaging. Do not use this file for implementation details; use `docs/implementation/IMPLEMENTATION_BLUEPRINT.md` instead.

Related files:

- Access rules: `docs/product/ACCESS_AND_PERMISSIONS.md`
- Metrics/events: `docs/product/METRICS.md`
- Task status: `docs/delivery/TASK_BACKLOG.md`

## Product Definition

Orbital is a curated marketplace directory for startups building in the Solana ecosystem.

The MVP lets verified founders register with a wallet, complete a professional profile, list their startup, and make it discoverable to logged-in users such as investors, buyers, scouts, builders, funds, accelerators, and ecosystem teams.

In v1, "marketplace" means structured discovery, public market signals, and founder contact through social links. It does not mean transactional acquisition, payments, offers, or deal rooms.

## Product Promise

> Discover startups orbiting the Solana ecosystem.

## Primary User

The primary user is a Solana startup founder.

Their goals:

- Connect a Solana wallet.
- Complete a professional profile.
- List a startup with enough information to be trusted.
- Control and update the public status of that startup.
- Signal if the startup is raising or open to acquisition conversations.

## Secondary Users

Secondary users are people exploring the Solana startup ecosystem:

- Investors.
- Potential acquirers.
- Scouts.
- Builders.
- Funds and accelerators.
- Ecosystem teams.
- Community members.

Their goal is to discover real startups, filter them by useful criteria, and understand their status quickly.

## MVP v1 Scope

Included:

- Solana wallet login through SIWS and Supabase Auth.
- Basic user/founder profile.
- Private dashboard.
- Create, edit, publish, and archive owned startups.
- Strong minimum verification simulated in v1: wallet + domain + X.
- Protected marketplace of verified and published startups.
- Protected startup detail page.
- Filters by category, stage, tech stack, fundraising, and acquisition status.
- Founder contact through the creator's public X and Telegram.

Out of scope for v1:

- XMTP.
- Anonymous chat.
- Internal contact forms.
- Saved contact requests.
- Private offers.
- USDC payments.
- Deal room.
- NDA/document handling.
- Real domain verification.
- Real X API integration.
- Notifications.
- Admin/reviewer dashboard.

## Non-Negotiable Rules

- Startup information is not visible to anonymous users.
- The landing page can be public.
- `/startups`, `/startups/[id]`, and `/dashboard/*` require wallet login.
- Anonymous users must see a `Connect Wallet` gate before startup data is rendered.
- Any logged-in user can view startups that are `verified + published`.
- Only the owner can edit, archive, verify, or publish their own startups.
- Founder contact v1 is only the public social links from the `User` associated with `Startup.ownerWallet`.
- No forms, chat, or internal messaging should be implemented in v1.
- `open_to_discuss` means open to acquisition conversations, not for-sale transaction flow.

## Core Flows

### Founder Registration

1. User connects wallet.
2. If no profile exists, the app creates or prompts for a basic profile.
3. User completes display name, job title, avatar, bio, and social links.
4. Wallet remains the primary identity.

### List Startup

1. Founder opens `My Startups`.
2. Founder creates a startup in `draft`.
3. Founder completes required public information.
4. Founder adds website and X.
5. Founder requests verification.
6. Startup moves to `pending`.
7. A reviewer approves it as `verified` (development builds may expose a local-only simulation).
8. Founder publishes it.
9. Startup appears in the logged-in marketplace.

### Discover Startups

1. Visitor tries to open `/startups`.
2. If disconnected, they see an auth gate.
3. After wallet connection, they see verified and published startups.
4. They filter by category, stage, tech stack, fundraising, and acquisition status.
5. They open the startup detail page.

### Contact Founder

1. Logged-in user opens startup detail.
2. The app loads the owner profile using `Startup.ownerWallet`.
3. The `Founder Contact` block shows avatar, name, job title, X, and Telegram when available.
4. If no social links exist, show `No public founder contact available yet`.

## Product Principles

- Prioritize trust over volume.
- Avoid promising full startup acquisition in v1.
- Make every published startup look real, maintained, and verifiable.
- Keep the UI ready for future wallet-to-wallet conversations without implementing them now.
- Separate public signals from private/future data.
- Build the marketplace directory before transactional layers.

## Messaging v1

Use:

- `discover`
- `showcase`
- `verified`
- `curated`
- `open to acquisition conversations`
- `founder contact`
- `marketplace directory`

Avoid:

- `trade startups`
- `buy startups`
- `USDC acquisitions`
- `deal room`
- `instant acquisition`
- `on-chain startup sales`

If acquisition is mentioned, phrase it as intent or conversation, not a transaction.
