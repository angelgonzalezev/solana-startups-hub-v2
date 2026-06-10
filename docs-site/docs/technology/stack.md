---
title: Technology Stack
description: Frameworks, libraries, and development tools used by the project.
---

# Technology Stack

## Application

- Next.js 15 with App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- GSAP and Lenis for animation and smooth scrolling.
- Static mock data for the MVP.

## Documentation

- Docusaurus 3.
- Markdown and MDX.
- Static export served under `/docs`.

## Development tooling

- npm scripts.
- ESLint.
- Prettier.
- Husky and lint-staged.
- Commitlint is installed, but product commits use the task-based format documented in the repository.

## Current limitation

The main app build currently compiles the bundle but fails during lint/type validity. This must be fixed before a release candidate.
