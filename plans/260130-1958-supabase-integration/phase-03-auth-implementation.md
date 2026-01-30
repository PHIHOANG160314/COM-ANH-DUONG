# Phase 3: Authentication Implementation

**Status:** Pending
**Priority:** High

## Overview
Implement the authentication flow for different user roles (Customer, Staff, Admin) using Supabase Auth.

## Objectives
- [ ] Create an Auth Context/Provider.
- [ ] Implement `useAuth` hook.
- [ ] Handle login (Email/Password for staff, Social/OTP for customers).
- [ ] Handle logout and session recovery.

## Implementation Steps

1.  **Auth Context**
    - Create `src/contexts/AuthContext.tsx`.
    - Track `session`, `user`, and `loading` state.
    - Listen to `supabase.auth.onAuthStateChange`.

2.  **Auth Hooks**
    - Create `src/hooks/useAuth.ts` to consume the context.
    - Create helper functions: `signInWithEmail`, `signOut`, `signUp`.

3.  **Profile/Role Handling**
    - Fetch user role from `profiles` table upon login.
    - Expose `role` in the Auth Context.

## Success Criteria
- [ ] User can sign in and sign out.
- [ ] Application state reflects auth status.
- [ ] Protected routes redirect unauthenticated users.
