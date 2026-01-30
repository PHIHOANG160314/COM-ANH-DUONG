# Research Report: Supabase Integration Patterns (2026)

**Date:** 2026-01-30
**Topic:** Supabase Integration for React Apps (TypeScript, Real-time, RLS, Auth)

## 1. Client Setup & TypeScript
The standard in 2026 relies on `supabase-js` v2+ with **automatic type generation**. Do not manually type definitions.

**Setup:**
1.  Install: `npm install @supabase/supabase-js`
2.  Generate types: `npx supabase gen types typescript --project-id "$PROJECT_REF" > src/types/supabase.ts`
3.  Initialize client with generic:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## 2. Real-time Subscriptions (Orders)
For a kitchen display system (KDS), use **Channel Subscriptions** to listen for `INSERT` on the `orders` table.

**Pattern:**
- Create a custom hook `useRealtimeOrders`.
- Subscribe to specific events (INSERT/UPDATE) to reduce noise.
- Use `postgres_changes` filter.

```typescript
useEffect(() => {
  const channel = supabase
    .channel('realtime:orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('New order:', payload.new)
        // Update local state or invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

## 3. Row-Level Security (RLS) & Multi-Role Access
**Critical:** Never implement role logic solely in the client. Use RLS policies.

**Strategy:**
1.  Create a `profiles` table linked to `auth.users` with a `role` column (`customer`, `staff`, `admin`).
2.  Create a helper database function `get_my_role()` to read the current user's role.
3.  Apply policies based on this function.

**Example Policy (SQL):**
```sql
-- Allow Staff/Admin to update orders status
CREATE POLICY "Staff can update orders" ON "orders"
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin')
);

-- Customers can only see their own orders
CREATE POLICY "Customers see own orders" ON "orders"
FOR SELECT USING (
  auth.uid() = user_id
);
```

## 4. Authentication Flows
- **Customer:** Phone OTP or Social Login (Google/Apple) for friction-free ordering.
- **Staff/Admin:** Email/Password (or Magic Link) with restricted domain validation if possible.

**Hook Implementation:**
Use `onAuthStateChange` to sync Supabase session with local React context or global store (Zustand/Redux).

## 5. Optimistic UI Updates
Combine **TanStack Query** (React Query) with Supabase for instant feedback.

**Flow:**
1.  **Mutate:** User clicks "Complete Order".
2.  **onMutate:** Cancel outgoing queries, snapshot previous state, optimistically update cache to show "Completed".
3.  **onError:** Rollback to snapshot if Supabase fails.
4.  **onSettled:** Invalidate query to refetch true server state.

```typescript
const mutation = useMutation({
  mutationFn: (orderId) => supabase.from('orders').update({ status: 'done' }).eq('id', orderId),
  onMutate: async (orderId) => {
    await queryClient.cancelQueries(['orders'])
    const previousOrders = queryClient.getQueryData(['orders'])
    queryClient.setQueryData(['orders'], (old) =>
      old.map(o => o.id === orderId ? { ...o, status: 'done' } : o)
    )
    return { previousOrders }
  },
  // ... onError (rollback), onSettled (invalidate)
})
```

## Unresolved Questions
1.  Does the specific "Com Anh Duong" deployment require edge functions for complex order validation (inventory checks)?
2.  Are there specific compliance requirements for storing customer phone numbers?

## Sources
- [Supabase Documentation: Generating Types](https://supabase.com/docs/guides/api/rest/generating-types)
- [Supabase Realtime Guides](https://supabase.com/docs/guides/realtime)
- [TanStack Query: Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
