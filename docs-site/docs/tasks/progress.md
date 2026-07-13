---
title: Task Progress
description: Current delivery status and task conventions.
---

# Task Progress

Last audited: 2026-07-13.

## Current snapshot

| Status  | Count |
| ------- | ----: |
| Done    |    40 |
| Partial |     8 |
| Pending |     2 |

The canonical internal tracker is `docs/delivery/TASK_BACKLOG.md` in the repository.

## Completed areas

- Startup taxonomy.
- User and startup models.
- Local user and startup fixtures.
- Profile validation helpers.
- Supabase-backed user, startup, and verification services.
- Solana SIWS authentication and SSR session refresh.
- PostgreSQL schema, RLS, protected RPCs, triggers, and database policy tests.
- Auth gate.
- Dashboard shell.
- Shared state components.
- Status badges.
- Wallet connect button.
- Profile screen.
- Startup owner dashboard.
- Startup edit screen.
- Verification page.
- Founder contact block.
- Dashboard overview.
- Product checklist.
- Project README.
- Public Docusaurus documentation.
- Shared footer redesign.
- Footer menu option cleanup.
- Unit tests for data mapping and draft/verification validation.

## Partial areas

- Final product route cleanup.
- Startup validation completeness.
- Startup service visibility filtering.
- Startup form save-and-request flow.
- QA coverage and visual evidence.
- Hosted wallet authentication QA.
- Broader service and UI test coverage.

## Pending areas

- Analytics mock.
- Production reviewer workflow.

## Commit convention

Product work uses task-based commits:

```text
agonzalez/TASK-ID/commit-title
```

Example:

```text
agonzalez/TASK-043/create-docusaurus-docs
```
