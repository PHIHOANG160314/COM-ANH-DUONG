# React 19 + Vite 6 Best Practices (2026)

## 1. React 19 Features & Migration
React 19 introduces the **React Compiler** (formerly React Forget) and first-class support for **Server Components** and **Actions**.

### Key Features
- **React Compiler**: Automatic memoization. No need for `useMemo` or `useCallback`.
- **Actions**: Native form handling with `useActionState` (formerly `useFormState`), `useFormStatus`, and `useOptimistic`.
- **`use` API**: Read resources (Promises, Context) in render.
- **Direct Ref Prop**: `forwardRef` is deprecated; pass `ref` as a normal prop.
- **Document Metadata**: Native `<title>`, `<meta>`, `<link>` support in components.

### Code Example: Actions
```tsx
import { useActionState } from "react";
import { updateName } from "./actions";

function UpdateName() {
  const [state, formAction, isPending] = useActionState(updateName, { error: null });

  return (
    <form action={formAction}>
      <input name="name" />
      <button type="submit" disabled={isPending}>Update</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

## 2. Vite 6.x Configuration
Vite 6 makes **Rolldown** (Rust-based bundler) the default for production builds, significantly improving performance.

### `vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]], // Enable React Compiler
      },
    }),
  ],
  build: {
    target: 'esnext', // Modern browsers only
    minify: 'esbuild', // Faster minification
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Explicit vendor splitting
        },
      },
    },
  },
  server: {
    warmup: {
      clientFiles: ['./src/App.tsx'], // Pre-transform key files
    },
  },
});
```

## 3. TypeScript Setup
React 19 types remove global namespace pollution (`JSX.Element` changes) and require stricter type safety.

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true, // Safety for array access
    "erasableSyntaxOnly": true // TS 5.8+ performance boost
  }
}
```

## 4. Performance Optimization
- **Enable React Compiler**: Eliminates manual memoization overhead.
- **React Server Components (RSC)**: Move data fetching to server components (requires framework support like Next.js or TanStack Start, or custom Vite RSC setup).
- **Asset Loading**: Use React 19's native preloading APIs (`preload`, `preinit`).
- **Code Splitting**: Use `lazy` with `Suspense` for route-based splitting.

```tsx
import { preload } from 'react-dom';

function App() {
  preload('/fonts/inter.woff2', { as: 'font' });
  // ...
}
```

## 5. Project Structure (Feature-Sliced Design Lite)
Group by feature/domain rather than file type.

```
src/
├── app/                 # App-wide setup (routes, providers)
├── features/            # Feature-based modules
│   ├── auth/            # Auth feature
│   │   ├── api/         # Data fetching/Actions
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific hooks
│   │   └── types/       # Feature types
│   └── menu/
├── shared/              # Shared utilities & UI kit
│   ├── components/      # Button, Input, Modal
│   ├── hooks/           # useDebounce, useLocalStorage
│   └── utils/           # formatCurrency, dateHelpers
└── main.tsx             # Entry point
```

## Sources
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Vite 6 Documentation](https://vitejs.dev/guide/)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)

## Unresolved Questions
- Specific integration steps for existing Supabase realtime hooks with React 19 Actions?
- Migration strategy for existing `useMemo`/`useCallback` (codemods available)?
