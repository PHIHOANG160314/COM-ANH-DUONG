---
description: Initialize Supabase database and configure environment
---

# /supabase - Database Setup

Setup and manage Supabase backend connection.

## Commands

| Command | Purpose |
|---------|---------|
| `/supabase:init` | First-time setup |
| `/supabase:migrate` | Run SQL migrations |
| `/supabase:seed` | Seed sample data |
| `/supabase:status` | Check connection |

---

## Setup Steps

// turbo-all

1. Create Supabase project at https://supabase.com

2. Get credentials from Settings → API:
   - Project URL
   - anon public key

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Fill in credentials in `.env`

5. Run schema in Supabase SQL Editor:
   - Open `sql/schema.sql`
   - Copy to SQL Editor
   - Click Run

6. Test connection:
```javascript
// In browser console
SupabaseService.getMenuItems().then(console.log)
```

---

## Files

| File | Purpose |
|------|---------|
| `sql/schema.sql` | Database schema |
| `js/supabase-client.js` | API client |
| `.env.example` | Credential template |
| `.env` | Your credentials (gitignored) |
