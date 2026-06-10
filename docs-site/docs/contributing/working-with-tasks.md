---
title: Working With Tasks
description: How contributors should use tasks, docs, and commits.
---

# Working With Tasks

Development is tracked through explicit task IDs.

## Before starting work

1. Read `MVP_SPEC.md` for the product summary and hard rules.
2. Read `docs/delivery/TASK_BACKLOG.md` for the current task status.
3. Open the specific implementation doc that matches the work:
   - Product intent: `docs/product/PRODUCT_BRIEF.md`
   - Routes and screens: `docs/implementation/IMPLEMENTATION_BLUEPRINT.md`
   - Types: `docs/implementation/DATA_MODELS.md`
   - Validation: `docs/implementation/VALIDATION_RULES.md`
   - Services: `docs/implementation/SERVICES_CONTRACTS.md`

## Task status markers

- `[x]`: complete.
- `[~]`: partially complete.
- `[ ]`: pending.

Only mark a task complete when its acceptance criteria are genuinely satisfied.

## Commit format

Use one commit per task when practical.

```text
agonzalez/TASK-ID/commit-title
```

Keep the title short, lowercase, and kebab-case.

## Validation

Run the smallest relevant verification before committing. For docs work, formatting checks are usually enough. For product code, run build, lint, tests, or focused checks depending on the change.
