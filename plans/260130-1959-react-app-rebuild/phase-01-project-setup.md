---
title: "Phase 01: Project Setup & Architecture"
description: "Initialize React 19 project, configure Vite/TypeScript, setup MUI v6, and establish FSD Lite folder structure."
status: completed
priority: P1
effort: 2 days
branch: feat/project-setup
tags: [setup, vite, react-19, fsd, mui]
created: 2026-01-30
completed: 2026-01-30
---

# Phase 01: Project Setup & Architecture

## Context Links
- [React 19 + Vite Best Practices](../reports/researcher-260130-1958-react19-vite-best-practices.md)
- [POS Architecture 2026](../reports/researcher-260130-1958-pos-architecture-2026.md)

## Overview
Establish the foundational infrastructure for the "Cơm Ánh Dương" React application. This phase ensures the development environment is correctly configured with the latest tools (React 19, Vite 6, TypeScript 5.7) and enforces the architectural boundaries defined in the research.

## Key Insights
- **Vite 6**: Fastest dev server, optimized for modern React 19 features.
- **Strict Mode**: Enable for React 19 compatibility checks.
- **FSD Lite**: Organize by features (auth, menu, order) rather than technical layers (components, hooks) to scale better.
- **Path Aliases**: crucial for clean imports (`@/features`, `@/shared`).

## Requirements
### Functional
- Develop environment runs on `localhost:3000`.
- Hot Module Replacement (HMR) works correctly.
- Application builds successfully for production.

### Non-Functional
- TypeScript strict mode enabled.
- ESLint + Prettier configured for code quality.
- Import aliases configured.

## Architecture
**Folder Structure (FSD Lite):**
```
src/
├── app/          # App-wide providers, router, global styles
├── pages/        # Route components (thin wrappers)
├── widgets/      # Composition of features (e.g., Header, Sidebar)
├── features/     # Business logic features (e.g., auth, cart)
├── entities/     # Business entities (e.g., user, product)
└── shared/       # Reusable UI kit, lib, types
```

## Related Code Files
- `package.json`: Dependencies update.
- `vite.config.ts`: Configuration.
- `tsconfig.json`: Compiler options.
- `.eslintrc.cjs` / `eslint.config.js`: Linting rules.
- `src/*`: Core directory structure.

## Implementation Steps
1.  **Scaffold Project**: Initialize React 19 + TS via Vite (if not already clean).
2.  **Dependencies**: Install `react`, `react-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `react-router-dom`, `@tanstack/react-query`.
3.  **TypeScript Config**: Configure `tsconfig.json` with `strict: true`, `noImplicitAny: true`, and path aliases (`@/*`).
4.  **Vite Config**: Setup `vite.config.ts` with path resolution and React plugin.
5.  **Linting**: Setup ESLint and Prettier with React 19 rules.
6.  **Directory Structure**: Create FSD folders (`app`, `pages`, `widgets`, `features`, `entities`, `shared`).
7.  **Environment**: Setup `.env` files for Supabase keys.

## Todo List
- [x] Initialize Vite project with React-TS template
- [x] Install Core Dependencies (React 19, MUI, Router, Query)
- [x] Configure `tsconfig.json` (Paths, Strict Mode)
- [x] Configure `vite.config.ts` (Aliases)
- [x] Setup ESLint/Prettier
- [x] Create FSD Lite Directory Structure
- [x] Setup `.env` and `.env.example`
- [x] Commit initial structure

## Success Criteria
- `npm run dev` starts without errors.
- `npm run build` produces a production build.
- Imports work using `@/` alias.
- Folder structure matches FSD Lite specification.

## Risk Assessment
- **Risk**: Dependency conflicts with React 19 RC/Beta versions.
  - **Mitigation**: Stick to stable releases if available, or pin specific working versions.
- **Risk**: FSD complexity for new developers.
  - **Mitigation**: Document folder purpose clearly in `README.md`.

## Next Steps
- Proceed to [Phase 02: Shared Core](./phase-02-shared-core.md).
