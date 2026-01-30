---
title: "Cơm Ánh Dương - React App Rebuild Plan"
description: "Comprehensive plan for rebuilding Cơm Ánh Dương POS system using React 19, MUI v6, and Supabase."
status: in-progress
priority: P1
effort: 8 weeks
branch: main
tags: [react-19, pos, migration, supabase, mui-v6]
created: 2026-01-30
---

# Cơm Ánh Dương - React App Rebuild Plan

Overview plan for migrating the legacy HTML/JS POS to a modern React 19 application.

## Phases Overview

| Phase | Name | Status | Description |
| :--- | :--- | :--- | :--- |
| **01** | [Project Setup](./phase-01-project-setup.md) | **Completed** | Initialize React 19, Vite, MUI, and FSD Lite structure. |
| **02** | [Shared Core](./phase-02-shared-core.md) | **Completed** | Implement core types, API client, theme system, and layouts. |
| **03** | [Routing & Auth](./phase-03-routing-auth.md) | **Completed** | Setup React Router, Supabase Auth, and protected routes. |
| **04** | [Customer Interface](./phase-04-customer-interface.md) | **Completed** | Build Customer Ordering UI (Menu, Cart, Checkout). |
| **05** | [Kitchen Display](./phase-05-kitchen-display.md) | **Completed** | Develop Real-time KDS with Supabase Realtime. |
| **06** | [Staff POS](./phase-06-staff-pos.md) | **Completed** | Implement Staff POS for order entry and table management. |
| **07** | [Shipper Delivery](./phase-07-shipper-delivery.md) | **Completed** | Create delivery interface for shippers. |
| **08** | [Admin Dashboard](./phase-08-admin-dashboard.md) | **Completed** | Build management dashboard for menu and reports. |
| **09** | [PWA & Offline](./phase-09-pwa-offline.md) | **Completed** | Enable offline capabilities and PWA installation. |
| **10** | [Testing & Deploy](./phase-10-testing-deployment.md) | **Completed** | Comprehensive testing, CI/CD setup, and production launch. |

## Key Dependencies
- [React 19 + Vite Best Practices](../reports/researcher-260130-1958-react19-vite-best-practices.md)
- [MUI v6 Design System](../reports/researcher-260130-1958-mui-v6-md3-pos-research.md)
- [Supabase Integration](../reports/researcher-260130-1958-supabase-react-integration.md)
- [POS Architecture](../reports/researcher-260130-1958-pos-architecture-2026.md)

## Architecture Highlights
- **Architecture**: Feature-Sliced Design (FSD) Lite
- **State Management**: TanStack Query (Server) + React Context/Zustand (Client)
- **Styling**: MUI v6 (Material Design 3) with emotion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Offline**: IndexedDB + Service Workers (Workbox)
