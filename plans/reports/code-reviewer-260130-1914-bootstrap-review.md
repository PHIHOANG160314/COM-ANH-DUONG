## Code Review Summary

### Scope
- Files reviewed: `package.json`, `tsconfig.app.json`, `src/App.tsx`, `src/main.tsx`, `src/lib/supabase-client-config.ts`, `src/pages/*`
- Review focus: Project bootstrap, Architecture, Type Safety, React 19 + Router v7 usage
- Updated plans: None

### Overall Assessment
The project is successfully bootstrapped with a modern stack (Vite, React 19, TypeScript, Router v7). The foundation is solid with code splitting and state management (Zustand/React Query) ready. However, the implementation is currently "shell-only". **Critical missing piece is the actual usage of Material 3 (@material/web) and Type definitions.** The pages are currently raw HTML/CSS without using the installed design system libraries.

### Critical Issues
- **Missing Domain Types**: `src/types` is empty. Supabase client is initialized without Database type definitions, meaning all database interactions will be untyped (`any`).
- **Material 3 Not Integrated**: Dependencies include `@material/web`, but pages use standard HTML tags (`<button>`, `<div>`) with BEM-style classes (`btn-primary`) instead of Material Web Components.

### High Priority Findings
- **Empty UI Library**: `src/components/ui` is empty. Reusable components (Buttons, Cards, Inputs) should be created here wrapping Material Web to avoid duplication.
- **Hardcoded Logic**: `customer-ordering-page.tsx` contains hardcoded data and logic. This needs to be connected to the Supabase client and React Query.

### Medium Priority Improvements
- **Route Definitions**: Routes are hardcoded in `App.tsx`. Move to `src/routes.ts` (as originally seemingly intended) for better organization.
- **Env Var Validation**: `supabase-client-config.ts` defaults to empty strings `''` if env vars are missing. This should throw an initialization error to fail fast in development.

### Low Priority Suggestions
- **Lazy Load Fallback**: The "Đang tải..." text in `App.tsx` should be a proper Spinner component.
- **Explicit Return Types**: Enforce explicit return types on React components for better type inference performance.

### Positive Observations
- **Modern Stack**: Correctly using React 19, Vite, and Router v7 data router.
- **Performance**: Code splitting (lazy loading) is implemented correctly for all routes.
- **Clean Config**: `tsconfig.json` and `vite.config.ts` are well-configured for strict TypeScript.

### Recommended Actions
1.  **Generate Supabase Types**: Run Supabase CLI to generate types and apply them to `createClient`.
2.  **Create UI Components**: Build `Button`, `Card`, `TextField` wrappers around `@material/web` in `src/components/ui`.
3.  **Define Domain Types**: Create `product.ts`, `order.ts`, `profile.ts` in `src/types`.
4.  **Refactor Pages**: Replace raw HTML in pages with the new UI components.

### Metrics
- Score: 6.5/10
- Type Coverage: Low (files are .tsx but lack domain types)
- Linting Issues: 0 (clean scaffold)
