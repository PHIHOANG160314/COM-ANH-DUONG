# Phase 1: Project Setup & Client Configuration

**Status:** Pending
**Priority:** High

## Overview
Initialize the React application (if missing) and configure the core Supabase client with TypeScript support.

## Objectives
- [ ] Ensure React 19 + Vite + TypeScript project structure exists.
- [ ] Install `@supabase/supabase-js`.
- [ ] Configure `.env` variables safely.
- [ ] Create a singleton Supabase client instance.

## Implementation Steps

1.  **Verify/Scaffold Project**
    - Check if `react-app` exists. If not, scaffold using Vite.
    - `npm create vite@latest react-app -- --template react-ts`

2.  **Install Dependencies**
    - `cd react-app`
    - `npm install @supabase/supabase-js`
    - `npm install -D vite-tsconfig-paths`

3.  **Environment Configuration**
    - Create `.env` (and add to `.gitignore`).
    - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

4.  **Client Initialization**
    - Create `src/lib/supabase.ts`.
    - Initialize `createClient` with types (placeholder `Database` type until Phase 2).

## Success Criteria
- [ ] `npm run dev` starts without errors.
- [ ] Supabase client can be imported in App.tsx.
- [ ] Environment variables are loaded correctly.
