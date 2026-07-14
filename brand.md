# Brand — Orbital (solana-startups-hub)

_Status: deferred_

The user chose to defer brand setup. This project is currently using shadcn's default neutral palette and no custom typography. The `frontend-design-guidelines` skill will quietly use defaults and will not prompt again.

Note: the existing pages already follow a de facto visual language — black background, Solana gradient accents (`#9945FF` → `#14F195`), `rounded-[30px]` cards on `#0A0A0A`, and `white/N` opacity tokens for text hierarchy. New components should match it.

To set up a real brand palette, typography, and voice at any time, run:

    /brand-design

or say: "pick brand colors"

When `brand-design` runs, it will detect this deferred state, skip the "confirm overwrite" step, and proceed directly to the full brand setup. The resulting palette will be applied to `app/globals.css` and this file will be replaced with the real brand documentation.

_Deferred at: 2026-07-14_
