# Security Audit Report
**Date:** 2026-01-23
**Project:** Cơm Ánh Dương (F&B Master)

## Executive Summary
A security scan was performed on the database schema and RLS policies. The following critical issues were identified regarding Row Level Security (RLS) policies that are too permissive.

## Findings

### 1. Overly Permissive RLS Policies
The following policies allow public access or modification without proper authentication checks (`USING (true)` or `WITH CHECK (true)`).

**File:** `sql/schema.sql`
- **Table:** `orders`
  - Policy: `"Anyone can create orders"`
  - Issue: `FOR INSERT WITH CHECK (true)`
  - Risk: Anyone can insert spam orders without authentication.
  - Recommendation: Restrict to authenticated users or validate via strict API endpoints.

- **Table:** `orders`
  - Policy: `"Users can view own orders"`
  - Issue: `FOR SELECT USING (true)`
  - Risk: All users can view all orders.
  - Recommendation: Restrict using `auth.uid() == customer_id` or similar logic.

### 2. General Observations
- **Encryption:** Ensure sensitive fields (phone, email) are handled securely.
- **Backup:** Regular backups are required (see `scripts/backup-db.bat`).

## Action Plan
1. Review and tighten RLS policies in `sql/schema.sql`.
2. Implement specific policies for authenticated staff vs anonymous customers.
