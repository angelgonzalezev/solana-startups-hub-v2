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

Audit date: 2026-06-10.

Current progress:

- Done: 26/42.
- Partial: 12/42.
- Pending: 4/42.

Build status:

- `npm run build` compiles the bundle.
- Build fails during lint/type validity because of ESLint/TypeScript errors (`no-explicit-any`, unused imports, unescaped apostrophes, hook dependencies).

## Phase A: Technical Base and Product Cleanup

| Status | Priority | Task                                            | Notes                                                                                                   |
| :----- | :------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| [~]    | P0       | TASK-001 - Define final product routes          | Routes exist, but some legacy/template routes still exist and one hero CTA still points to `/login-01`. |
| [ ]    | P0       | TASK-002 - Align landing copy with v1 messaging | `Features.tsx` still mentions `trade` and `Future USDC Marketplace`.                                    |
| [x]    | P0       | TASK-003 - Create taxonomy constants            | `src/data/startupTaxonomy.ts` exists.                                                                   |
| [x]    | P0       | TASK-004 - Update User and Startup models       | Includes verification, listing, acquisition, `showMrr`.                                                 |
| [x]    | P0       | TASK-005 - Expand user mock data                | 5 users.                                                                                                |
| [x]    | P0       | TASK-006 - Expand startup mock data             | 8 startups across states.                                                                               |

## Phase B: Services, Validation, Auth

| Status | Priority | Task                                  | Notes                                                                                                  |
| :----- | :------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------- |
| [x]    | P0       | TASK-007 - Profile validation helpers | Implemented in `src/utils/validation.ts`.                                                              |
| [~]    | P0       | TASK-008 - Startup validation helpers | Exists, but some URL/field rules are lighter than spec.                                                |
| [x]    | P0       | TASK-009 - `userService` mock         | Implemented.                                                                                           |
| [~]    | P0       | TASK-010 - `startupService` mock      | Exists, but `getStartupById` returns any startup; visibility filtering is incomplete at service level. |
| [x]    | P0       | TASK-011 - `verificationService` mock | Implemented.                                                                                           |
| [x]    | P0       | TASK-012 - Mock wallet auth           | Implemented with `CURRENT_MOCK_WALLET`.                                                                |
| [x]    | P0       | TASK-013 - `AuthGate`                 | Implemented.                                                                                           |

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

| Status | Priority | Task                        | Notes                                                   |
| :----- | :------- | :-------------------------- | :------------------------------------------------------ |
| [~]    | P0       | TASK-028 - `StartupCard`    | Exists, but `IS RAISING` badge appears unconditionally. |
| [~]    | P0       | TASK-029 - `StartupFilters` | Exists, but UI lacks tech stack filter.                 |
| [~]    | P0       | TASK-030 - `/startups`      | Implemented and protected; inherits filter/card issues. |

## Phase H: Startup Detail and Contact

| Status | Priority | Task                             | Notes                                                                                             |
| :----- | :------- | :------------------------------- | :------------------------------------------------------------------------------------------------ |
| [~]    | P1       | TASK-031 - `StartupDetailHeader` | Exists, but raising badge appears unconditionally.                                                |
| [x]    | P0       | TASK-032 - `FounderContact`      | Implemented with X/Telegram and empty state.                                                      |
| [~]    | P0       | TASK-033 - `/startups/[id]`      | Protected, but service-level filtering does not prevent unavailable startups from being returned. |

## Phase I: Dashboard

| Status | Priority | Task                    | Notes        |
| :----- | :------- | :---------------------- | :----------- |
| [x]    | P1       | TASK-034 - `/dashboard` | Implemented. |

## Phase J: Metrics, Events, QA

| Status | Priority | Task                                | Notes                                                       |
| :----- | :------- | :---------------------------------- | :---------------------------------------------------------- |
| [ ]    | P2       | TASK-035 - Analytics mock           | No `trackEvent` helper found.                               |
| [ ]    | P1       | TASK-036 - Unit tests               | No project tests found for validation/services.             |
| [~]    | P1       | TASK-037 - QA protected routes      | QA checklist exists; build/lint still failing.              |
| [~]    | P1       | TASK-038 - Responsive and visual QA | Checklist says done; no automated/browser evidence in repo. |
| [ ]    | P1       | TASK-039 - Copy QA                  | Landing still has out-of-scope copy.                        |

## Phase K: Release Preparation

| Status | Priority | Task                                    | Notes                                                                                                    |
| :----- | :------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| [x]    | P0       | TASK-040 - MVP v1.0 checklist           | `QA_CHECKLIST.md` exists.                                                                                |
| [x]    | P2       | TASK-041 - Post-MVP technical decisions | Documented in `QA_CHECKLIST.md`.                                                                         |
| [x]    | P1       | TASK-042 - Update project README        | Replaced template README with project-specific product, setup, docs, route, status, and commit guidance. |
