# Roadmap

## Agent Context Guide

Open this file when deciding what should happen next at the milestone level. This roadmap reflects the current audited implementation state, not the original greenfield plan. For task-level status, use `docs/delivery/TASK_BACKLOG.md`.

Related files:

- Task tracking: `docs/delivery/TASK_BACKLOG.md`
- Product scope: `docs/product/PRODUCT_BRIEF.md`
- Release checklist: `QA_CHECKLIST.md`
- Implementation details: `docs/implementation/IMPLEMENTATION_BLUEPRINT.md`

## Current State - 2026-07-13

The MVP is no longer in early setup. Most core product surfaces exist:

- Product routes exist for marketplace, detail, dashboard, profile, startup CRUD, and verification.
- The public route surface is limited to the landing, product routes, and `/docs`; inherited template pages are gone.
- Solana Wallet Standard SIWS auth and Supabase SSR sessions exist.
- `AuthGate` protects product routes.
- Local-only profile/startup fixtures exist.
- Models include verification, listing, acquisition, and MRR visibility fields.
- Supabase-backed services, RLS, and protected state-transition RPCs exist.
- Profile, dashboard, startup form, marketplace, detail, founder contact, and verification pages exist.
- `QA_CHECKLIST.md` exists.

However, the product is not release-ready:

- `npm run build` now passes.
- Some core tasks remain partial: startup validation hardening, generic service visibility helpers, and direct save-and-request verification flow.
- Analytics and broader service/UI tests remain incomplete.

## Roadmap Priorities

### Milestone 1 - Stabilize the Current MVP

Goal: make the existing implementation internally consistent, lint-clean, and aligned with the v1 product promise.

Priority: highest.

Tasks to finish:

- Harden startup validation to match the implementation rules more closely.
- Keep service-level visibility constrained to accessible lookups.
- Keep `/startups/[id]` hidden from non-owners when a startup is unavailable.

Exit criteria:

- `npm run build` passes.
- Landing copy has no v1 scope violations.
- Protected startup detail cannot show drafts, pending, rejected, or archived startups to non-owners.
- Marketplace filters match the spec: search, category, stage, tech stack, fundraising, acquisition.

Relevant backlog items:

- TASK-001
- TASK-002
- TASK-008
- TASK-010
- TASK-028
- TASK-029
- TASK-030
- TASK-031
- TASK-033
- TASK-039

### Milestone 2 - Complete Founder Workflow Polish

Goal: make the founder flow feel complete from profile to published startup.

Tasks to finish:

- Add `Save and request verification` flow to startup creation/editing where requirements are met.
- Make `StartupForm` distinguish clearly between:
  - save draft.
  - save changes.
  - request verification.
- Improve startup validation to fully match `docs/implementation/VALIDATION_RULES.md`.
- Ensure verification reset behavior is obvious when website or X changes.
- Improve error messages for owner-only edit/verification access.
- Confirm archived startups are visible to owner but never marketplace-visible.

Exit criteria:

- A founder can complete profile, create draft, request verification, mock approve, publish, and view public detail without manual workarounds.
- Validation errors are field-level and consistent.
- Owner/non-owner behavior is clear in UI.

Relevant backlog items:

- TASK-008
- TASK-020
- TASK-021
- TASK-023
- TASK-024
- TASK-025
- TASK-026

### Milestone 3 - Release Quality and Regression Coverage

Goal: reduce regression risk before considering the MVP releasable.

Tasks to finish:

- Add unit tests for:
  - profile validation.
  - startup validation.
  - `listPublishedStartups`.
  - owner/non-owner mutations.
  - `requestVerification`.
  - `publishStartup`.
  - `showMrr` visibility.
- Run manual QA for protected routes.
- Run responsive/visual QA on:
  - landing.
  - marketplace.
  - detail.
  - dashboard.
  - profile form.
  - startup form.
  - verification page.
- Update `QA_CHECKLIST.md` to match actual results, not intended results.

Exit criteria:

- Unit tests cover critical business logic.
- QA checklist reflects verified behavior.
- No startup data is visible before wallet connection.
- No high-risk responsive issues remain.

Relevant backlog items:

- TASK-036
- TASK-037
- TASK-038
- TASK-040

### Milestone 4 - Measurement and Learning Loop

Goal: instrument the MVP enough to learn whether the marketplace is valuable.

Tasks to finish:

- Implement a lightweight `trackEvent` helper.
- Track:
  - `wallet_connected`
  - `profile_saved`
  - `startup_draft_created`
  - `startup_updated`
  - `verification_requested`
  - `startup_published`
  - `marketplace_viewed`
  - `startup_filter_applied`
  - `startup_filter_reset`
  - `startup_detail_viewed`
  - `founder_contact_clicked`
- Keep it mock/local for v1; do not add an external analytics dependency unless explicitly decided.

Exit criteria:

- Key product events are emitted.
- Analytics can later be swapped for a real provider.

Relevant backlog items:

- TASK-035

## v1.0 Release Candidate Scope

The first release candidate should include:

- Landing aligned with v1 messaging.
- Solana SIWS wallet auth.
- `AuthGate`.
- Editable profile.
- Private dashboard.
- Owned startup list.
- Startup draft creation.
- Startup editing.
- Database-controlled verification transitions with an explicitly gated development simulator.
- Publishing verified startups.
- Protected marketplace.
- Protected startup detail.
- `Founder Contact`.
- Combined filters including tech stack.
- Empty/loading/error states.
- Sufficient local development fixtures.
- Build passing.
- Critical unit tests passing.
- Updated QA checklist.

The first release candidate must not include:

- XMTP.
- Anonymous chat.
- Internal contact forms.
- Saved contact requests.
- USDC payments.
- Deal room.
- Private offers.
- Real admin dashboard.
- Real domain verification.
- X API integration.

## Post-MVP Roadmap

Only start these after v1.0 is stable and validated:

1. Real domain verification.
2. Real X verification.
3. Admin/reviewer workflow.
4. Hosted wallet compatibility and RPC resilience work.
5. XMTP wallet-to-wallet messaging.
6. Anonymous contact request flow.
7. Notifications.
8. Private deal room.
9. Paid/premium features.
