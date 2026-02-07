# Supabase Setup Guide for Cơm Ánh Dương

This guide helps you set up the Supabase backend for the React application.

## Prerequisites

1.  **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2.  **Supabase CLI**: Installed locally (optional but recommended) or use Dashboard SQL Editor.
3.  **Project Created**: Create a new project in Supabase.

## Step 1: Database Setup

You can set up the database using the SQL migration files provided.

### Option A: Using Supabase Dashboard (Easiest)

1.  Go to your project in Supabase Dashboard.
2.  Navigate to **SQL Editor**.
3.  Open `supabase/migrations/20260131_initial_schema.sql`.
4.  Copy the content and paste it into the SQL Editor.
5.  Click **Run**.
6.  Open `supabase/migrations/20260131_rls_policies.sql`.
7.  Copy and paste into SQL Editor.
8.  Click **Run**.

### Option B: Using Supabase CLI

1.  Login to CLI:
    ```bash
    npx supabase login
    ```
2.  Link your project:
    ```bash
    npx supabase link --project-ref your-project-id
    ```
3.  Push migrations:
    ```bash
    npx supabase db push
    ```

## Step 2: Environment Variables

1.  Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
2.  Get your credentials from **Project Settings > API**:
    *   `VITE_SUPABASE_URL`: Project URL
    *   `VITE_SUPABASE_ANON_KEY`: Project API Key (anon public)

## Step 3: Create Initial Users

To access the Staff/Admin portals, you need to create users with appropriate roles.

1.  Go to **Authentication > Users** in Supabase Dashboard.
2.  **Add User**: Create a new user (e.g., `admin@comanhduong.com`).
3.  **Assign Role**: Since we use a `profiles` table linked to Auth, you need to manually set the role in the database after creating the user, OR use the SQL Editor:

```sql
-- Replace 'USER_UUID_HERE' with the actual ID from Authentication tab
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID_HERE';
```

### Setup Staff PINs (For POS)

The POS system uses a separate `staff` table for PIN-based quick login.

```sql
-- Insert a manager with PIN 1234
INSERT INTO public.staff (name, role, pin)
VALUES ('Manager', 'manager', crypt('1234', gen_salt('bf')));

-- Insert a cashier with PIN 0000
INSERT INTO public.staff (name, role, pin)
VALUES ('Thu Ngân', 'cashier', crypt('0000', gen_salt('bf')));
```

## Step 4: Generate TypeScript Types

To ensure type safety in the React app:

1.  Make sure you are logged in to Supabase CLI.
2.  Run the generation script:
    ```bash
    npm run supabase:types
    ```
3.  This will update `src/types/supabase.ts` with the latest schema.

## Common Troubleshooting

*   **RLS Errors**: If you can't fetch data, check the RLS policies in `20260131_rls_policies.sql`. Ensure your user has the correct role.
*   **Realtime Not Working**: Check **Database > Replication** to ensure the tables (`orders`, `order_items`) are enabled for replication.
*   **Login Fails**: Verify you are using the correct table. Customer login uses Supabase Auth (`auth.users`). Staff POS login uses `public.staff` table + PIN.

## Testing

1.  **Frontend**: Start the app `npm run dev`.
2.  **Staff Portal**: Go to `/staff`, try logging in with the PIN created above.
3.  **Admin Portal**: Login with the email/password created in Step 3.
