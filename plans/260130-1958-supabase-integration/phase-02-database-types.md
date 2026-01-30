# Phase 2: Database Type Generation

**Status:** Pending
**Priority:** High

## Overview
Establish a workflow for automatically generating TypeScript types from the Supabase database schema to ensure type safety across the application.

## Objectives
- [ ] Connect Supabase CLI (or use `npx` directly).
- [ ] Generate `database.types.ts`.
- [ ] Integrate types into the Supabase client initialization.

## Implementation Steps

1.  **Setup Scripts**
    - Add a script to `package.json`:
      `"gen:types": "npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/supabase.ts"`

2.  **Generate Types**
    - Run the generation command.
    - Verify `src/types/supabase.ts` is created and contains correct schema definitions (tables: orders, menu_items, etc.).

3.  **Update Client**
    - Update `src/lib/supabase.ts` to use the generated `Database` interface.
    ```typescript
    import { createClient } from '@supabase/supabase-js'
    import { Database } from '../types/supabase'
    // ...
    export const supabase = createClient<Database>(...)
    ```

## Success Criteria
- [ ] `src/types/supabase.ts` exists.
- [ ] Supabase queries (`supabase.from('orders').select()`) are fully typed.
- [ ] IntelliSense works for table names and columns.
