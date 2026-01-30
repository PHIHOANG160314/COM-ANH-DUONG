# Plan: Supabase Integration for React App

**Status:** Draft
**Priority:** High
**Goal:** Implement robust Supabase integration for the React application, enabling authentication, real-time data, and secure data access.

## Phases

- [ ] **Phase 1: Project Setup & Client Configuration**
    - Initialize React + Vite + TypeScript (if needed/restore).
    - Install Supabase client.
    - Configure environment variables.
    - Setup global Supabase client instance.
- [ ] **Phase 2: Database Type Generation**
    - Setup CLI for type generation.
    - Generate TypeScript definitions from database schema.
    - Automate type sync workflow.
- [ ] **Phase 3: Authentication Implementation**
    - Implement Auth Provider/Context.
    - Create Login/Logout hooks.
    - Handle session persistence and state changes.
    - Implement Role-Based Access Control (RBAC) hooks.
- [ ] **Phase 4: Data Access & Row Level Security (RLS)**
    - Implement data fetching hooks (using TanStack Query).
    - Verify RLS policies with client-side checks.
    - Create "Service" layer for DB interactions.
- [ ] **Phase 5: Real-time Features**
    - Implement real-time subscription hooks.
    - Handle Order updates (INSERT/UPDATE).
    - Manage subscription lifecycle.
- [ ] **Phase 6: Optimistic UI Updates**
    - Implement optimistic mutations for Order status changes.
    - Handle rollback on error.
    - Ensure smooth UX for staff operations.

## Dependencies
- Node.js Environment
- Existing Supabase Project (URL & Anon Key)
- Database Schema (orders, profiles, etc.)

## Notes
- Ensure strictly typed client usage.
- Follow RLS security best practices.
- Use TanStack Query for state management.
