---
title: "Phase 03: Routing & Auth"
description: "Implement React Router v6 setup, Supabase Authentication integration, Row Level Security (RLS) handling, and Role-Based Access Control (RBAC)."
status: completed
priority: P1
effort: 3 days
branch: feat/routing-auth
tags: [auth, router, rbac, security, supabase]
created: 2026-01-30
completed: 2026-01-30
---

# Phase 03: Routing & Auth

## Context Links
- [Supabase React Integration](../reports/researcher-260130-1958-supabase-react-integration.md)
- [React 19 + Vite Best Practices](../reports/researcher-260130-1958-react19-vite-best-practices.md)

## Overview
Implement the application's routing structure and security layer. This involves setting up React Router with protected routes based on user roles (Customer, Staff, Shipper, Admin) and integrating Supabase Auth for seamless login/registration.

## Key Insights
- **RBAC**: Different interfaces for different roles (Admin, Staff, Customer).
- **Protected Routes**: Use wrapper components to check auth state before rendering.
- **Persistent Session**: Supabase handles session persistence automatically; sync this with React Context.

## Requirements
### Functional
- Users can sign in/sign up.
- Users are redirected to their appropriate dashboard based on role.
- Unauthorized access is blocked and redirected to login.
- Logout functionality.

### Non-Functional
- Smooth transitions between routes.
- Secure handling of auth tokens.

## Architecture
- **Router**: `react-router-dom` configuration in `src/app/router.tsx`.
- **Auth Provider**: React Context to wrap the app and provide `user`, `session`, `role`.
- **Guards**: `ProtectedRoute` component to check authenticated state and roles.
- **Features**: `features/auth` (Login form, Register form).

## Related Code Files
- `src/app/router.tsx`
- `src/app/providers/AuthProvider.tsx`
- `src/features/auth/LoginForm.tsx`
- `src/features/auth/RegisterForm.tsx`
- `src/shared/ui/ProtectedRoute.tsx`

## Implementation Steps
1.  **Auth Provider**: Create `AuthProvider` context that listens to `supabase.auth.onAuthStateChange`.
2.  **Role Logic**: Implement logic to fetch user role from `profiles` table after auth.
3.  **Login Feature**: Build `LoginForm` component with React Hook Form + Zod.
4.  **Register Feature**: Build `RegisterForm` component.
5.  **Router Setup**: Configure `createBrowserRouter` with routes:
    - `/` (Home/Landing)
    - `/login`
    - `/admin/*` (Protected: Admin)
    - `/pos/*` (Protected: Staff)
    - `/kitchen/*` (Protected: Kitchen)
    - `/delivery/*` (Protected: Shipper)
6.  **Protected Route**: Create high-order component/wrapper to enforce auth and role checks.

## Todo List
- [x] Create `AuthProvider` Context
- [x] Implement `useAuth` hook
- [x] Build `LoginForm` UI & Logic
- [x] Build `RegisterForm` UI & Logic
- [x] Configure React Router (`router.tsx`)
- [x] Create `ProtectedRoute` Guard
- [x] Implement Redirect Logic based on Role
- [x] Test Login/Logout Flows

## Success Criteria
- User can log in and remain logged in on refresh.
- Accessing `/admin` as a customer redirects to forbidden/home.
- Correct user role is loaded into context.

## Risk Assessment
- **Risk**: Role fetching latency delays UI.
  - **Mitigation**: Show a global loading spinner while initial auth session and role are resolving.

## Next Steps
- Proceed to [Phase 04: Customer Interface](./phase-04-customer-interface.md).
