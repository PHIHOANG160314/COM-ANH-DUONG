# Code Standards & Guidelines

## 🟦 TypeScript Conventions
- **Strict Mode**: Always enabled. No `any`. Use `unknown` if necessary.
- **Types vs Interfaces**: Use `type` for unions/primitives, `interface` for object shapes.
- **Naming**:
  - Components: `PascalCase.tsx` (e.g., `OrderCard.tsx`)
  - Functions/Vars: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Types: `PascalCase` (e.g., `OrderPayload`)

## ⚛️ React Patterns
- **Functional Components**: Use `const Component = () => {}` syntax.
- **Hooks**: Custom hooks for logic extraction (`useOrderSubmit`).
- **Composition**: Prefer composition over prop drilling.
- **Performance**: Use `useMemo` and `useCallback` judiciously for expensive ops.

## 💾 State Management
- **Zustand**: Use for global UI state (sidebar open, theme).
  - Store files: `use[StoreName].ts`
- **React Query**: Use for ALL server data.
  - Keys: Factory pattern (`orderKeys.all`, `orderKeys.detail(id)`)
- **Context**: Avoid unless strictly necessary for dependency injection.

## 📂 File Naming & Structure
```
feature-name/
├── api/             # API calls
├── components/      # Sub-components
├── model/           # Types, stores, hooks
├── index.ts         # Public API
└── FeatureMain.tsx  # Main component
```

## 🧪 Testing Standards
- **Unit**: Vitest for utility functions and hooks.
- **Integration**: React Testing Library for components.
- **E2E**: Playwright for critical user flows (Checkout, Login).
- **Coverage**: Aim for >80% on core business logic.
