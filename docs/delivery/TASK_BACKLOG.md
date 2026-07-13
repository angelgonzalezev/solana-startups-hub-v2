# Development Task Backlog

## Agent Context Guide

Open this file when choosing the next development task, checking progress, or updating task status. This file is the delivery tracker, not the product spec. For implementation detail, jump to the relevant linked docs before coding.

Use status markers consistently:

- `[x]`: done.
- `[~]`: partially done.
- `[ ]`: pending.

Related files:

- Product summary: `MVP_SPEC.md`
- Screen details: `docs/implementation/IMPLEMENTATION_BLUEPRINT.md`
- Service rules: `docs/implementation/SERVICES_CONTRACTS.md`
- QA checklist: `QA_CHECKLIST.md`

Status:

- `[x]`: done.
- `[~]`: partially done.
- `[ ]`: pending.

Audit date: 2026-06-11.

Current progress:

- Done: 57/69.
- Partial: 10/69.
- Pending: 2/69.

Build status:

- `npm run build` compiles the bundle and passes lint/type validity.

## Phase A: Technical Base and Product Cleanup

| Status | Priority | Task                                            | Notes                                                                                |
| :----- | :------- | :---------------------------------------------- | :----------------------------------------------------------------------------------- |
| [x]    | P0       | TASK-001 - Define final product routes          | Only the landing, nine product pages, `/docs`, and the product 404 remain available. |
| [x]    | P0       | TASK-002 - Align landing copy with v1 messaging | Landing copy now uses v1 messaging and removes `trade` / `Future USDC Marketplace`.  |
| [x]    | P0       | TASK-003 - Create taxonomy constants            | `src/data/startupTaxonomy.ts` exists.                                                |
| [x]    | P0       | TASK-004 - Update User and Startup models       | Includes verification, listing, acquisition, `showMrr`.                              |
| [x]    | P0       | TASK-005 - Expand user mock data                | 5 users.                                                                             |
| [x]    | P0       | TASK-006 - Expand startup mock data             | 8 startups across states.                                                            |

## Phase B: Services, Validation, Auth

| Status | Priority | Task                                  | Notes                                                                         |
| :----- | :------- | :------------------------------------ | :---------------------------------------------------------------------------- |
| [x]    | P0       | TASK-007 - Profile validation helpers | Implemented in `src/utils/validation.ts`.                                     |
| [~]    | P0       | TASK-008 - Startup validation helpers | Exists, but some URL/field rules are lighter than spec.                       |
| [x]    | P0       | TASK-009 - `userService` mock         | Original mock completed; now replaced by the Supabase-backed service.         |
| [x]    | P0       | TASK-010 - `startupService` mock      | Replaced by owner-only tables and protected marketplace/detail RPCs.          |
| [x]    | P0       | TASK-011 - `verificationService` mock | Replaced by protected SQL transitions and a gated development-only simulator. |
| [x]    | P0       | TASK-012 - Mock wallet auth           | Original mock completed; now replaced by TASK-046 SIWS authentication.        |
| [x]    | P0       | TASK-013 - `AuthGate`                 | Implemented.                                                                  |

## Phase C: Shared UI and Visual System

| Status | Priority | Task                             | Notes                                     |
| :----- | :------- | :------------------------------- | :---------------------------------------- |
| [x]    | P1       | TASK-014 - `DashboardShell`      | Implemented with dark Solana style.       |
| [x]    | P1       | TASK-015 - State components      | Loading, error, empty states exist.       |
| [x]    | P1       | TASK-016 - Status badges         | Implemented.                              |
| [x]    | P0       | TASK-017 - `WalletConnectButton` | Implemented and used in navbar/auth gate. |

## Phase D: User Profile

| Status | Priority | Task                                                      | Notes        |
| :----- | :------- | :-------------------------------------------------------- | :----------- |
| [x]    | P0       | TASK-018 - `/dashboard/profile`                           | Implemented. |
| [x]    | P0       | TASK-019 - Block startup creation without minimum profile | Implemented. |

## Phase E: Owned Startup CRUD

| Status | Priority | Task                                       | Notes                                                            |
| :----- | :------- | :----------------------------------------- | :--------------------------------------------------------------- |
| [~]    | P0       | TASK-020 - Reusable `StartupForm`          | Exists, but lacks `Save and request verification` secondary CTA. |
| [~]    | P0       | TASK-021 - `/dashboard/startups/new`       | Creates drafts; direct save-and-request flow incomplete.         |
| [x]    | P0       | TASK-022 - `/dashboard/startups`           | Implemented.                                                     |
| [x]    | P0       | TASK-023 - `/dashboard/startups/[id]/edit` | Implemented with owner check.                                    |
| [x]    | P1       | TASK-024 - Archive startup                 | Implemented.                                                     |

## Phase F: Verification and Publication

| Status | Priority | Task                                   | Notes                       |
| :----- | :------- | :------------------------------------- | :-------------------------- |
| [x]    | P0       | TASK-025 - Verification page           | Implemented with checklist. |
| [x]    | P0       | TASK-026 - Publish verified startup    | Implemented.                |
| [x]    | P1       | TASK-027 - Mock approve/reject helpers | Implemented as dev actions. |

## Phase G: Protected Marketplace

| Status | Priority | Task                        | Notes                                                                                |
| :----- | :------- | :-------------------------- | :----------------------------------------------------------------------------------- |
| [x]    | P0       | TASK-028 - `StartupCard`    | `IS RAISING` badge now renders only when `isRaising = true`.                         |
| [x]    | P0       | TASK-029 - `StartupFilters` | Tech stack filter added to the marketplace sidebar.                                  |
| [x]    | P0       | TASK-030 - `/startups`      | Protected marketplace now uses verified+published filtering and the full filter set. |

## Phase H: Startup Detail and Contact

| Status | Priority | Task                             | Notes                                                            |
| :----- | :------- | :------------------------------- | :--------------------------------------------------------------- |
| [x]    | P1       | TASK-031 - `StartupDetailHeader` | Raising badge is now conditional on `isRaising`.                 |
| [x]    | P0       | TASK-032 - `FounderContact`      | Implemented with X/Telegram and empty state.                     |
| [x]    | P0       | TASK-033 - `/startups/[id]`      | Protected detail now hides unavailable startups from non-owners. |

## Phase I: Dashboard

| Status | Priority | Task                    | Notes        |
| :----- | :------- | :---------------------- | :----------- |
| [x]    | P1       | TASK-034 - `/dashboard` | Implemented. |

## Phase J: Metrics, Events, QA

| Status | Priority | Task                                | Notes                                                                                                |
| :----- | :------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------- |
| [ ]    | P2       | TASK-035 - Analytics mock           | No `trackEvent` helper found.                                                                        |
| [~]    | P1       | TASK-036 - Unit tests               | Mapper and draft/verification validation tests exist; broader service/UI coverage remains.           |
| [~]    | P1       | TASK-037 - QA protected routes      | QA checklist exists; build now passes, but manual protected-route QA is still not evidenced in repo. |
| [~]    | P1       | TASK-038 - Responsive and visual QA | Checklist says done; no automated/browser evidence in repo.                                          |
| [x]    | P1       | TASK-039 - Copy QA                  | Landing copy is now aligned with v1 messaging.                                                       |

## Phase K: Release Preparation

| Status | Priority | Task                                     | Notes                                                                                                                              |
| :----- | :------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [x]    | P0       | TASK-040 - MVP v1.0 checklist            | `QA_CHECKLIST.md` exists.                                                                                                          |
| [x]    | P2       | TASK-041 - Post-MVP technical decisions  | Documented in `QA_CHECKLIST.md`.                                                                                                   |
| [x]    | P1       | TASK-042 - Update project README         | Replaced template README with project-specific product, setup, docs, route, status, and commit guidance.                           |
| [x]    | P1       | TASK-043 - Create public Docusaurus docs | Adds a Docusaurus docs package served under `/docs`, with product, flow, roadmap, task, technology, and contributor documentation. |

## Phase L: Landing Navigation and Footer Polish

| Status | Priority | Task                                   | Notes                                                                                                         |
| :----- | :------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| [x]    | P1       | TASK-044 - Redesign shared footer      | `FooterOne` now matches the Solana landing style with dark cards, gradient brand treatment, and product CTAs. |
| [x]    | P1       | TASK-045 - Correct footer menu options | Replaced template/social/legal menu options with product, docs, and company links aligned to current routes.  |

## Phase M: Solana Authentication and Supabase Persistence

| Status | Priority | Task                                            | Notes                                                                                      |
| :----- | :------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------- |
| [x]    | P0       | TASK-046 - Replace mock auth with Solana SIWS   | Wallet Standard discovery, message signing, Supabase Auth, SSR refresh, and sign-out.      |
| [x]    | P0       | TASK-047 - Persist profiles and startups        | Supabase schema, local fixtures, typed services, RLS, protected RPCs, and MRR redaction.   |
| [x]    | P0       | TASK-048 - Move verification transitions to SQL | Request, publish, archive, and verification-reset rules execute in protected DB functions. |
| [~]    | P1       | TASK-049 - Hosted auth and wallet QA            | Hosted Supabase and MetaMask SIWS are validated; broader wallet/browser evidence remains.  |
| [ ]    | P0       | TASK-050 - Production reviewer workflow         | Replace the explicitly gated development verification endpoint before production launch.   |

## Phase N: Managed Profile and Startup Media

| Status | Priority | Task                                           | Notes                                                                                        |
| :----- | :------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------- |
| [~]    | P0       | TASK-051 - Configure Supabase media storage    | Migration and pgTAP coverage exist; local execution awaits an available Docker stack.        |
| [x]    | P0       | TASK-052 - Build image crop and upload tooling | Reusable square cropper, WebP conversion, previews, replacement, removal, and media service. |
| [x]    | P0       | TASK-053 - Add managed profile image           | Profile saves coordinate Storage upload, database path update, rollback, and cleanup.        |
| [x]    | P0       | TASK-054 - Add managed startup logos           | New and existing startups support deferred logo upload with owner-scoped paths.              |
| [~]    | P1       | TASK-055 - Media compatibility, docs, and QA   | Unit/build/route checks pass; interactive browser QA remains unevidenced.                    |

## Phase O: Product Surface Cleanup

| Status | Priority | Task                                   | Notes                                                                                       |
| :----- | :------- | :------------------------------------- | :------------------------------------------------------------------------------------------ |
| [x]    | P1       | TASK-056 - Simplify product navigation | Desktop and mobile navigation expose only Marketplace and Dashboard; docs remain in footer. |
| [x]    | P1       | TASK-057 - Prune orphan template code  | Removed unreachable template components, mock content, style bundles, assets, and packages. |
| [x]    | P1       | TASK-058 - Restore How it Works step 2 | Restored the missing central Create Profile step and its original content.                  |
| [x]    | P1       | TASK-059 - Align How it Works cards    | Step 2 now uses the same card treatment and reveal animation pattern as steps 1 and 3.      |
| [x]    | P1       | TASK-060 - Stabilize How it Works grid | All three cards render inside one reveal animation so no individual step can remain hidden. |

## Phase P: Honest Landing and Responsive Product UI

| Status | Priority | Task                                         | Notes                                                                                          |
| :----- | :------- | :------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| [x]    | P0       | TASK-061 - Redesign honest product landing   | Removes fabricated scale and partner claims and documents live platform capabilities.          |
| [x]    | P1       | TASK-062 - Reorganize contextual navigation  | Landing anchors, a Marketplace action, and the wallet now provide contextual navigation.       |
| [x]    | P0       | TASK-063 - Improve marketplace mobile UX     | Mobile filters use an accessible drawer; cards no longer overlap at narrow widths.             |
| [x]    | P0       | TASK-064 - Improve protected mobile surfaces | Dashboard tabs, forms, cards, detail views, states, and dialogs now adapt to narrow screens.   |
| [~]    | P1       | TASK-065 - Validate responsive product UI    | Checks, build, and route probes pass; browser screenshots remain unavailable in this session.  |
| [x]    | P1       | TASK-066 - Remove landing maturity messaging | Removes the roadmap section and visible MVP or early-stage language from the product landing.  |
| [x]    | P1       | TASK-067 - Restore original card styling     | Restores soft borders and the previous card radii while preserving responsive layouts.         |
| [x]    | P1       | TASK-068 - Apply project brand mark          | Uses the supplied SolRadar artwork across the app, documentation, and browser favicon.         |
| [x]    | P0       | TASK-069 - Rebrand platform as Orbital       | Aligns product UI, metadata, authentication, and documentation around the Orbital proposition. |
