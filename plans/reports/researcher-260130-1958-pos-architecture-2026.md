# Modern Restaurant POS Architecture 2026: Research Report

## 1. Multi-Interface Architecture (The "Nervous System")
In 2026, the standard is a **Modular Monolith** or **Composable Architecture** sharing a core logic layer (Business Domain) across distinct interfaces.

*   **Customer (PWA/Mobile):** Optimized for high-latency mobile networks. Focus on image caching and optimistic UI.
*   **Staff (POS - Tablet/Desktop):** High-density UI, keyboard shortcuts, immediate feedback. Local-first focus.
*   **Kitchen (KDS - TV/Tablet):** Real-time event stream consumer. Low interaction, high visibility.
*   **Admin (Dashboard):** Analytics heavy, eventual consistency acceptable.

**Pattern: Shared Core Library**
Extract shared types, validation, and API hooks into a shared package to ensure contract consistency.

```typescript
// packages/shared/types/order.ts
export interface Order {
  id: string;
  status: 'pending' | 'cooking' | 'ready' | 'delivered';
  items: OrderItem[];
  // 2026 Standard: CRDT Vector Clock for sync
  _vector: Record<string, number>;
}
```

## 2. Real-Time Order Management
Moving beyond simple polling, 2026 architectures use **Edge-propagated WebSockets** (e.g., Supabase Realtime, Cloudflare Durable Objects).

**Mechanism:** Database Transaction Log Tailing (CDC - Change Data Capture).
**Stack:** Postgres (Wal) -> Supabase Realtime -> Client Subscription.

```typescript
// lib/realtime.ts (Supabase Example)
supabase
  .channel('orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
    payload => {
      // KDS triggers "Ding" sound immediately
      playNotification();
      updateKDSGrid(payload.new);
    }
  )
  .subscribe();
```

## 3. Offline-First & State Synchronization
The "Holy Grail" of POS. Internet failure cannot stop sales.

**Strategy:**
1.  **Write Locally First:** All actions mutate `IndexedDB` / `SQLite` (WASM) immediately.
2.  **Background Sync:** Service Workers flush queues when online.
3.  **Conflict Resolution:** Use **CRDTs** (Conflict-free Replicated Data Types) or **Last-Write-Wins (LWW)** with intelligent merging for simple fields.

**Tech Stack 2026:**
*   **Storage:** `RxDB` or `TanStack Query` (Persisters).
*   **Sync:** Replicache or custom Supabase sync.

```typescript
// lib/queue-sync.ts
const syncQueue = async () => {
  const pending = await db.orders.where('synced').equals(false).toArray();

  for (const order of pending) {
    try {
      await api.post('/orders', order);
      await db.orders.update(order.id, { synced: true });
    } catch (err) {
      if (err.status === 409) {
        // Handle conflict: Server version usually wins in POS for inventory
        applyServerVersion(err.serverData);
      }
    }
  }
};
// Trigger on 'online' event
window.addEventListener('online', syncQueue);
```

## 4. Security Best Practices
*   **Zero Trust / RLS:** Never trust the client. Use Row Level Security (RLS) in Postgres. Staff can only see their branch's orders.
*   **Payment Isolation:** POS never touches PAN (Primary Account Number). Use **P2PE** (Point-to-Point Encryption) hardware or cloud-only tokenization (Stripe Terminal).
*   **Ephemeral Tokens:** Short-lived JWTs (15 min) with silent refresh.

**RLS Example (Postgres):**
```sql
-- Only staff of the specific branch can view orders
CREATE POLICY "Staff view branch orders" ON orders
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM staff_profiles WHERE branch_id = orders.branch_id
  )
);
```

## Unresolved Questions
1.  **Hardware Hardware Integration:** Specific integration capability with local thermal printers (WebUSB vs. Local Server Bridge)?
2.  **Inventory Locking:** Strict consistency (prevent overselling) vs. Availability (offline sales)?

## Sources
*   *Supabase Realtime Architecture* - supabase.com/docs
*   *Local-First Software (Kleppmann et al.)* - inkandswitch.com/local-first
*   *PCI DSS v4.0 Guidelines* - pcisecuritystandards.org
