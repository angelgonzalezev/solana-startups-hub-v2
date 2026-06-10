---
title: Architecture Overview
description: High-level structure of the app and documentation.
---

# Architecture Overview

The MVP is a frontend-first product using mock data and mock services. This keeps product behavior easy to validate before adding persistence or real wallet integrations.

## Main areas

- `src/app`: Next.js routes.
- `src/components/solana-hub`: landing page sections.
- `src/components/startup`: startup marketplace, detail, and form components.
- `src/components/profile`: founder profile form.
- `src/components/shared`: shared layout, auth gate, states, badges, and wallet button.
- `src/context`: React contexts, including mock auth.
- `src/data/mock`: mock users and startups.
- `src/services`: mock user, startup, and verification services.
- `src/utils/validation.ts`: profile and startup validation helpers.

## Data flow

1. Mock auth identifies the current wallet.
2. Services load users and startups from static mock data.
3. Protected pages use the auth gate before rendering startup data.
4. Owner-only pages compare the current wallet with `Startup.ownerWallet`.
5. Marketplace pages should render only verified and published startups.

## Documentation flow

Internal Markdown files remain the working source of truth for agents and contributors. Docusaurus provides a curated public documentation site that explains the project without requiring readers to inspect every internal spec file.
