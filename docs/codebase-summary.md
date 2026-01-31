# Codebase Summary

This project is a food delivery management system ("Cơm Ánh Dương") targeting the Sa Đéc, Đồng Tháp market. It consists of a React frontend application, a Supabase backend (implied), and comprehensive marketing and planning assets.

## 📂 Repository Structure

```
.
├── docs/               # Project documentation (Architecture, PDR, Marketing materials)
├── marketing/          # Marketing assets directory
│   ├── content/        # Social media posts and copy
│   ├── gmb/            # Google My Business assets
│   ├── loyalty/        # Loyalty program materials
│   └── print/          # Printable assets (menus, flyers)
├── plans/              # Project plans and reports
│   ├── marketing/      # Marketing strategies and campaigns
│   └── reports/        # Task reports
├── react-app/          # Main application source code (Vite + React 19)
│   ├── src/            # Feature-Sliced Design (FSD) Lite structure
│   └── ...
└── sql/                # Database schemas and scripts
```

## 💻 Application Architecture (react-app)

The frontend follows a **Feature-Sliced Design (FSD) Lite** architecture.

### Directory Structure (`react-app/src/`)

```
react-app/src/
├── app/          # App-wide settings, providers, and router configuration
├── features/     # Business features (auth, cart, ordering, kds) - Smart components
├── entities/     # Business entities (user, product, order) - Data models & UI
├── shared/       # Shared utilities, UI kit, hooks, constants (Low-level)
├── pages/        # Composition of features/entities into routes
├── widgets/      # Complex standalone UI blocks (Header, Sidebar)
└── main.tsx      # Entry point
```

## 🧩 Key Modules & Responsibilities

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| **App** | Global initialization | `App.tsx`, `providers/`, `router/` |
| **Pages** | Route entry points | `HomePage`, `AdminDashboard`, `MenuShowcase` |
| **Widgets** | Large UI components | `OrderList`, `MenuGrid`, `Navbar` |
| **Features** | User interactions | `AddToCart`, `Login`, `MenuShowcase` |
| **Entities** | Business logic/data | `User`, `Product`, `Order` (stores, types) |
| **Shared** | Reusable primitives | `ui/`, `api/`, `utils/`, `hooks/` |

## 📐 Code Organization Principles

1. **Slices**: Code is organized by domain (slice) first, then by technical layer.
2. **Unidirectional Flow**: `Shared` -> `Entities` -> `Features` -> `Widgets` -> `Pages` -> `App`.
3. **Public API**: Each module should export only what is necessary via `index.ts`.
4. **Co-location**: Tests, styles, and types related to a component stay with that component.

## 🔄 State Management Strategy

- **Server State**: `React Query` handles data fetching, caching, and synchronization.
- **Client State**: `Zustand` manages global UI state (e.g., cart, theme, sidebar).
- **Form State**: `React Hook Form` handles complex form validation and submission.

## 🛡️ Resilience & Error Handling

- **Graceful Degradation**: Critical public features (e.g., Menu) utilize a "Demo Mode" fallback. If the backend (Supabase) returns errors (like 401 Unauthorized) or is unconfigured, the application seamlessly serves local demo data to ensure the UI remains functional for visitors.
