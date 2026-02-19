# Security Audit Report — Cơm Ánh Dương

**Date:** 2026-02-12 07:40
**Reviewer:** Code Reviewer Agent
**Scope:** CSP Headers, XSS Vectors, Exposed Secrets, CORS Configuration

---

## Executive Summary

**Overall Security Score: 6.5/10** (Medium Risk)

Codebase has basic security measures but **critical gaps** found in CSP headers, CORS config, and env file protection.

**Critical Issues:** 2
**High Priority:** 3
**Medium Priority:** 2
**Low Priority:** 1

---

## 🔴 CRITICAL ISSUES

### 1. Missing CSP Headers in Production Config

**File:** `vercel.json`

**Issue:**
- NO Content-Security-Policy headers configured
- Only cache-control headers present
- HTML has meta CSP tag (index.html) but **Vercel deployment ignores it**

**Current Config:**
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{"key": "Cache-Control", "value": "..."}]
    }
  ]
}
```

**Risk:** XSS attacks, script injection, clickjacking

**Fix Required:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';"
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
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### 2. Permissive CORS Configuration

**Files:**
- `supabase/functions/create-payment/index.ts`
- `supabase/functions/handle-webhook/index.ts`

**Issue:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // ❌ ALLOWS ALL ORIGINS
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Risk:**
- Any website can call your payment APIs
- CSRF attacks possible
- Data theft via malicious sites

**Fix Required:**
```typescript
// Option 1: Whitelist production domain
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.comanhduong.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
};

// Option 2: Dynamic origin validation
const allowedOrigins = [
  'https://www.comanhduong.com',
  'https://com-anh-duong-10x.vercel.app',
];

const origin = req.headers.get('origin') || '';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
};
```

---

## 🟡 HIGH PRIORITY FINDINGS

### 3. .env Files Not Fully Protected in .gitignore

**File:** `.gitignore`

**Issue:**
```gitignore
# Current
.env*.local

# Missing explicit entries:
# .env
# .env.production
```

**Status:** Files `.env` and `.env.production` exist but NOT explicitly ignored!

**Risk:** Accidental commit of secrets to git

**Fix Required:**
```gitignore
# Environment files
.env
.env.local
.env.development
.env.test
.env.production
.env.production.local
.env*.local
```

---

### 4. Weak Input Validation in Payment Functions

**File:** `supabase/functions/create-payment/index.ts`

**Issue:**
```typescript
// Current validation
if (!orderId || !amount || !provider) {
  throw new Error('Missing required fields: orderId, amount, provider');
}
```

**Missing:**
- Amount range validation (min/max)
- Provider enum validation (only allow 'vnpay'|'momo')
- orderId format validation
- SQL injection prevention (though Supabase uses parameterized queries)

**Fix Required:**
```typescript
import { z } from 'zod';

const PaymentRequestSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().min(1000).max(100_000_000), // 1k-100M VND
  provider: z.enum(['vnpay', 'momo']),
});

const requestData = PaymentRequestSchema.parse(await req.json());
```

---

### 5. No Rate Limiting on Payment Endpoints

**Files:** Payment functions

**Issue:** No rate limiting configured

**Risk:**
- Brute force attacks
- DDoS on payment gateway
- Resource exhaustion

**Fix Required:**
Add to Supabase Edge Function config or use middleware:
```typescript
// Simple in-memory rate limiter (use Redis in production)
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}
```

---

## 🟢 MEDIUM PRIORITY IMPROVEMENTS

### 6. Hardcoded Test Passwords in Seed Script

**File:** `scripts/seed-database.ts`

**Issue:**
```typescript
password: 'password123',  // Lines 202, 208, 214, 220, 226, 232
```

**Risk:** Low (seed script only), but bad practice

**Fix:** Use environment variable or stronger test passwords

---

### 7. Missing Webhook Signature Verification Logs

**File:** `supabase/functions/handle-webhook/index.ts`

**Issue:** Signature verification happens but limited audit trail

**Fix:** Add structured logging:
```typescript
console.log({
  event: 'webhook_received',
  provider,
  signature_valid: isValid,
  timestamp: new Date().toISOString(),
  ip: req.headers.get('x-forwarded-for'),
});
```

---

## 🟢 LOW PRIORITY OBSERVATIONS

### 8. No XSS Vectors Found

**Status:** ✅ PASS

- No `dangerouslySetInnerHTML` usage found
- React auto-escapes by default
- No `innerHTML` manipulation detected

---

## ✅ POSITIVE OBSERVATIONS

1. **Supabase Client Properly Configured**
   - Uses anon key (public-safe)
   - Service key only in Edge Functions (server-side)
   - Placeholder fallback prevents crashes

2. **Type Safety**
   - TypeScript enabled
   - `tsc --noEmit` passes (0 errors)

3. **Webhook Signature Verification**
   - VNPay uses HMAC-SHA256
   - MoMo uses HMAC-SHA256
   - Signatures validated before processing

4. **Secrets Management**
   - Payment secrets in Deno.env (server-side)
   - Not exposed to client

---

## 📋 RECOMMENDED ACTIONS (Priority Order)

### Immediate (Deploy Today)

1. **Add CSP Headers to vercel.json** (30 min)
2. **Restrict CORS to production domain** (15 min)
3. **Add .env files to .gitignore explicitly** (5 min)

### This Week

4. **Implement input validation with Zod** (2 hours)
5. **Add rate limiting to payment endpoints** (3 hours)
6. **Add structured logging for webhooks** (1 hour)

### Next Sprint

7. **Security headers monitoring** (setup Sentry/alert)
8. **Penetration testing** (hire external auditor)

---

## 🔧 VERIFICATION COMMANDS

After fixes:

```bash
# 1. Check CSP headers deployed
curl -I https://www.comanhduong.com | grep -i "content-security-policy"

# 2. Verify CORS restriction
curl -H "Origin: https://evil.com" \
  -X POST https://your-supabase-project.functions.supabase.co/create-payment

# 3. Confirm .env not committed
git status --ignored | grep ".env"

# 4. Type check
npm run type-check

# 5. Build success
npm run build
```

---

## 📊 Security Metrics

| Category | Before | After (Target) |
|----------|--------|----------------|
| CSP Headers | ❌ 0/5 | ✅ 5/5 |
| CORS Config | ❌ Wildcard | ✅ Whitelist |
| Input Validation | ⚠️ Basic | ✅ Schema |
| Rate Limiting | ❌ None | ✅ Implemented |
| Secret Protection | ✅ Server-only | ✅ + .gitignore |
| XSS Vectors | ✅ 0 found | ✅ 0 found |

**Overall Target Score: 9/10** (Production Ready)

---

## Unresolved Questions

1. Is there a WAF (Web Application Firewall) in front of Vercel? (Cloudflare recommended)
2. Should we add CAPTCHA to payment flow to prevent bot abuse?
3. Are payment webhook URLs secured with additional tokens/secrets? (Beyond signature)
4. Do we need audit logging for all payment transactions? (Compliance requirement?)

---

_Report generated: 2026-02-12 07:40_
_Next review: After critical fixes deployed_
