# Codebase Summary (FSD Lite)

This project follows a **Feature-Sliced Design (FSD) Lite** architecture to ensure scalability and maintainability.

## 📂 Directory Structure

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
| **Pages** | Route entry points | `HomePage`, `AdminDashboard`, `KitchenPage` |
| **Widgets** | Large UI components | `OrderList`, `MenuGrid`, `Navbar` |
| **Features** | User interactions | `AddToCart`, `Login`, `UpdateOrderStatus` |
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
