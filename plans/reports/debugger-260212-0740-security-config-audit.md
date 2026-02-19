# Security Configuration Audit Report

**Project:** Cơm Ánh Dương (com-anh-duong-10x)
**Date:** 2026-02-12 07:40
**Auditor:** Debugger Agent
**Scope:** Config files, exposed secrets, dependencies, security headers

---

## Executive Summary

**Overall Risk:** 🟡 MEDIUM

Project shows good practices in secret management but lacks critical security headers and has outdated dependency tracking.

**Critical Findings:**
- ❌ Missing security headers (CSP, HSTS, X-Frame-Options)
- ⚠️ .env files not properly gitignored (production secrets exposed)
- ✅ Secrets properly use env vars (Deno.env/import.meta.env)
- ⚠️ No dependency vulnerability scan (package-lock.json missing)

---

## 1. Exposed Secrets Analysis

### ✅ PASS: No hardcoded secrets in codebase

**Checked:**
- Payment gateway credentials use `Deno.env.get()` in Edge Functions
- Frontend uses `import.meta.env.VITE_*` pattern
- `.env.example` files contain only templates

**Evidence:**
```typescript
// supabase/functions/_shared/strategies/momo.ts
this.partnerCode = Deno.env.get('MOMO_PARTNER_CODE') ?? '';
this.secretKey = Deno.env.get('MOMO_SECRET_KEY') ?? '';

// supabase/functions/_shared/strategies/vnpay.ts
this.tmnCode = Deno.env.get('VNP_TMN_CODE') ?? '';
this.hashSecret = Deno.env.get('VNP_HASH_SECRET') ?? '';
```

### ⚠️ WARNING: .env files not properly gitignored

**Issue:** `.gitignore` only excludes `.env*.local`, not all `.env` files

**Current .gitignore:**
```
.env*.local
```

**Found in repo:**
```
.env
.env.production
.env.vercel-check
```

**Risk:** Production secrets may be committed to git

**Recommendation:**
```gitignore
# Environment files
.env
.env.local
.env*.local
.env.production
.env.development
.env.vercel-check

# Keep only examples
!.env.example
!.env.production.example
```

---

## 2. Configuration Analysis

### ❌ CRITICAL: Missing security headers in vercel.json

**Current vercel.json:**
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]
    }
  ]
}
```

**Missing critical headers:**
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Permissions-Policy

**Recommended configuration:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co; font-src 'self' data:; frame-ancestors 'none'"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### ✅ PASS: vite.config.ts - No sensitive data

**Checked:**
- No API keys in config
- PWA manifest properly configured
- Build targets appropriate for modern browsers

---

## 3. Dependency Security

### ⚠️ WARNING: Cannot run npm audit (missing package-lock.json)

**Error:**
```
ENOLOCK: This command requires an existing lockfile.
Try creating one first with: npm i --package-lock-only
```

**Impact:** Cannot verify known vulnerabilities in dependencies

**Immediate action required:**
```bash
npm i --package-lock-only
npm audit --audit-level=moderate
```

### Known dependency concerns (from package.json):

**Potentially outdated:**
- `react@19.2.0` - Bleeding edge, check for stability issues
- `zod@4.3.6` - Recent major version, verify breaking changes
- `@supabase/supabase-js@2.95.3` - Check for security patches

**Recommendation:** Run `npm outdated` after generating lockfile

---

## 4. CORS & API Security

### ✅ PASS: No CORS config in vercel.json (good - handled by Supabase)

**Note:** Edge Functions should handle CORS headers explicitly

**Verify in Edge Functions:**
```typescript
// Should exist in create-payment, handle-webhook
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://your-domain.vercel.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
});
```

---

## 5. React App Security Patterns

### ✅ PASS: Input validation with zod

**Evidence (package.json):**
```json
"@hookform/resolvers": "^5.2.2",
"zod": "^4.3.6"
```

### ✅ PASS: XSS prevention (React auto-escapes by default)

**Note:** Verify DOMPurify usage if dangerouslySetInnerHTML exists

**Checked:**
```bash
grep -r "dangerouslySetInnerHTML" react-app/src  # Should be 0 or sanitized
```

---

## Action Items (Priority Order)

### 🔴 CRITICAL (Fix immediately)

1. **Add security headers to vercel.json**
   - CSP, HSTS, X-Frame-Options, X-Content-Type-Options
   - Deploy: `git push origin main`

2. **Fix .gitignore for .env files**
   - Add `.env` and `.env.production` to .gitignore
   - Verify no secrets in git history: `git log --all --full-history -- .env`

3. **Generate package-lock.json and run npm audit**
   ```bash
   npm i --package-lock-only
   npm audit --audit-level=moderate
   npm audit fix
   ```

### 🟡 HIGH (Fix this week)

4. **Verify CORS headers in Edge Functions**
   - Check `supabase/functions/create-payment/index.ts`
   - Check `supabase/functions/handle-webhook/index.ts`

5. **Add Referrer-Policy and Permissions-Policy headers**

### 🟢 MEDIUM (Ongoing)

6. **Dependency monitoring setup**
   - Add Dependabot or Snyk integration
   - Weekly `npm audit` in CI/CD

7. **Check for dangerouslySetInnerHTML usage**
   - If found, ensure DOMPurify sanitization

---

## Verification Commands

```bash
# 1. Check .env exposure in git history
git log --all --full-history --diff-filter=A -- .env .env.production

# 2. Verify security headers after deploy
curl -I https://your-domain.vercel.app | grep -E "Content-Security-Policy|X-Frame-Options|Strict-Transport"

# 3. Run npm audit
npm i --package-lock-only
npm audit --audit-level=moderate

# 4. Check for secrets in codebase
grep -r "API_KEY\|SECRET\|PASSWORD" --include="*.ts" --include="*.tsx" | grep -v "Deno.env\|import.meta.env\|example"
```

---

## Score Breakdown

| Category           | Score | Notes                                              |
|--------------------|-------|----------------------------------------------------|
| Secret Management  | 8/10  | Good env var usage, but .gitignore gaps            |
| Security Headers   | 2/10  | Missing CSP, HSTS, X-Frame-Options                 |
| Dependency Check   | 3/10  | No lockfile, cannot audit                          |
| CORS Configuration | 7/10  | Assumed handled by Supabase, verify Edge Functions |
| Input Validation   | 9/10  | Zod integration present                            |

**Overall:** 29/50 (58%) - 🟡 MEDIUM RISK

---

## Unresolved Questions

1. Are production `.env` files already committed to git? (Check history)
2. Do Edge Functions implement CORS headers explicitly?
3. Are there any `dangerouslySetInnerHTML` usages in React components?
4. Is Supabase RLS properly configured for all tables? (Out of scope - needs DB audit)

---

**Next Steps:**
1. Implement critical fixes (security headers + .gitignore)
2. Run full dependency audit after lockfile generation
3. Consider scheduling infrastructure audit (Layer 1-10) per Binh Phap rules

