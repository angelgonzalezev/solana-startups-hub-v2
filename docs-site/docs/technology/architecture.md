---
title: Architecture Overview
description: High-level structure of the app and documentation.
---

# Architecture Overview

Orbital uses Solana wallets as its identity layer and Supabase as its session and persistence backend. The browser never supplies an owner wallet to authorize a mutation; PostgreSQL derives ownership from the authenticated user through RLS and protected functions.

## Main areas

- `src/app`: Next.js routes.
- `src/components/solana-hub`: landing page sections.
- `src/components/startup`: startup marketplace, detail, and form components.
- `src/components/profile`: founder profile form.
- `src/components/shared`: shared layout, auth gate, states, badges, and wallet button.
- `src/context`: SIWS session and wallet state.
- `src/lib/supabase`: browser/server clients and data mappers.
- `src/services`: typed profile, startup, and verification APIs.
- `src/utils/validation.ts`: profile and startup validation helpers.
- `supabase/migrations`: schema, RLS, triggers, and controlled state-transition RPCs.
- `supabase/seed.sql`: local-only fixtures.

## Data flow

1. Wallet Standard discovers the user's installed Solana wallets.
2. Supabase verifies a signed SIWS message and issues the application session.
3. A server route binds the trusted Web3 identity to a profile.
4. Services query Supabase using the current session; RLS restricts direct table access to owners.
5. Marketplace/detail RPCs expose only verified and published startups and redact hidden MRR.
6. Verification, publication, archive, and identity-change transitions execute in PostgreSQL.

## Documentation flow

Internal Markdown files remain the working source of truth for agents and contributors. Docusaurus provides a curated public documentation site that explains the project without requiring readers to inspect every internal spec file.
