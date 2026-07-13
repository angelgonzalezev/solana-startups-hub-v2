---
slug: /
title: Orbital
description: Discover startups orbiting the Solana ecosystem.
---

<span className="status-pill">Product documentation</span>

# Orbital

Discover startups orbiting the Solana ecosystem.

Orbital brings structured startup profiles, market signals, and founder context into one focused discovery experience. Founders can sign in with a Solana wallet, maintain their profile, list a startup, request review, and publish approved projects.

In v1, marketplace means structured discovery and founder contact through public social links. It does not mean chat, offers, payments, USDC acquisition flows, or deal rooms.

<div className="card-grid">
  <div className="info-card"><strong>Purpose</strong><br/>Help people discover real Solana startups with clear status and founder context.</div>
  <div className="info-card"><strong>Primary user</strong><br/>Solana founders who want to showcase a verified startup.</div>
  <div className="info-card"><strong>Secondary users</strong><br/>Investors, scouts, builders, funds, accelerators, and ecosystem teams.</div>
</div>

## Current state

Last audited: 2026-07-13.

- The route surface is limited to the landing, protected product workflows, and these public docs.
- SIWS authentication with Wallet Standard-compatible Solana wallets is implemented.
- Profiles and startups use Supabase/PostgreSQL with RLS and protected RPCs.
- Profile, dashboard, startup CRUD, verification, marketplace, detail page, and founder contact screens exist.
- Production still needs a real reviewer workflow and hosted wallet compatibility QA.

## Where to start

- Read [Product Vision](product/vision) to understand why the project exists.
- Read [Application Flow](flows/application-flow) to understand how users move through the product.
- Read [Current Roadmap](roadmap/current-roadmap) to understand what is next.
- Read [Task Progress](tasks/progress) to understand what is done, partial, and pending.
