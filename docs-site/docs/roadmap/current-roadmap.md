---
title: Current Roadmap
description: Milestones and release criteria for Orbital.
---

# Current Roadmap

Orbital continues to evolve through focused product and release milestones.

## Milestone 1: Stabilize the current product

Goal: make the existing implementation internally consistent, lint-clean, and aligned with the v1 product promise.

Key work:

- Make `npm run build` pass fully.
- Replace loose `any` usage with proper types.
- Remove unused imports and resolve relevant hook dependency warnings.
- Align landing copy with v1 messaging.
- Keep the cleaned product route surface free of inherited template pages.
- Prevent unavailable startup detail leakage.
- Add the missing tech stack filter.
- Show raising badges only when a startup is actually raising.

## Milestone 2: Complete founder workflow polish

Goal: make the founder flow complete from profile to published startup.

Key work:

- Add save-and-request verification flow.
- Improve startup validation to match the product spec.
- Make verification reset behavior clear when website or X changes.
- Improve owner-only access errors.
- Confirm archived startups are owner-visible but never marketplace-visible.

## Milestone 3: Release quality and regression coverage

Goal: reduce regression risk before a wider product release.

Key work:

- Add unit tests for validation and services.
- Run manual QA for protected routes.
- Run responsive QA for landing, marketplace, detail, dashboard, profile, startup form, and verification page.
- Update QA evidence to match actual behavior.

## Milestone 4: Measurement and learning loop

Goal: instrument Orbital enough to learn whether the marketplace is useful.

Key work:

- Add a lightweight mock `trackEvent` helper.
- Track wallet connection, profile saves, startup creation, verification requests, publishing, marketplace views, filters, detail views, and founder contact clicks.

## Release candidate requirements

The first release candidate must include:

- Landing aligned with v1 messaging.
- Solana wallet SIWS auth.
- Protected marketplace and startup detail pages.
- Editable profile.
- Private dashboard.
- Startup creation, editing, verification, and publishing.
- Founder contact.
- Combined filters including tech stack.
- Empty, loading, and error states.
- Local development fixtures.
- Supabase RLS/RPC policy coverage.
- Passing build.
- Critical unit tests.
- Updated QA checklist.
