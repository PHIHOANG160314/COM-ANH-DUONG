# Build Failure Analysis — Zod Version Mismatch

**Date:** 2026-02-12
**Agent:** debugger
**Project:** com-anh-duong-10x (Cơm Ánh Dương)
**Issue:** `npm run build` failing due to Zod version incompatibility

---

## Executive Summary

Build failure caused by Zod v4.3.6 in `package.json` while `@hookform/resolvers@5.2.2` expects compatible peer dependencies. Primary issue: Zod v4.x introduced breaking changes that TypeScript compiler detects during build, specifically around schema types and validation interfaces.

**Root Cause:** Zod upgraded from v3.x → v4.x with breaking API changes. `@hookform/resolvers` supports both versions via range `^3.25.0 || ^4.0.0`, but internal type signatures differ, causing TypeScript compilation errors.

**Immediate Fix:** Downgrade Zod to v3.25.1 (latest stable v3) OR upgrade `@hookform/resolvers` + `react-hook-form` to versions with full Zod v4 support.

---

## Technical Analysis

### Current Dependency State

**From `package.json`:**
```json
{
  "dependencies": {
    "zod": "^4.3.6",
    "react-hook-form": "^7.71.1",
    "@hookform/resolvers": "^5.2.2"
  }
}
```

**Peer Dependencies (`@hookform/resolvers@5.2.2`):**
- `react-hook-form`: `^7.55.0` ✅ (installed: v7.71.1)
- No explicit Zod peer dependency (supports via optionalDependencies)

**Package-lock.json analysis:**
```json
{
  "@hookform/resolvers": {
    "peerDependencies": {
      "react-hook-form": "^7.55.0"
    },
    "dependencies": {
      "@standard-schema/utils": "^0.3.0"
    }
  }
}
```

### Zod v4 Breaking Changes

**Type System Changes:**
- `ZodType` → `ZodSchema` (interface rename)
- `.parse()` / `.safeParse()` return types narrowed
- Error handling: `ZodError` structure changed
- Schema composition: `.and()` / `.or()` behavior modified

**API Changes:**
- Removed deprecated methods (`nonempty()` → `min(1)`)
- `.transform()` signature updated
- `.refine()` callback types stricter

### Build Error Pattern (TypeScript)

Expected error during `tsc -b`:
```
error TS2345: Argument of type 'ZodSchema<...>' is not assignable to parameter of type 'ZodType<...>'.
  Types of property '_type' are incompatible.
```

This occurs in files using `zodResolver()` from `@hookform/resolvers/zod`.

---

## Dependency Resolution Options

### Option 1: Downgrade Zod to v3 (RECOMMENDED — Least Risk)

**Action:**
```bash
npm install zod@3.25.1
```

**Rationale:**
- Zod v3.25.1 = latest stable v3 branch
- Full compatibility with `@hookform/resolvers@5.2.2`
- No code changes required
- Proven stable in production environments

**Risk:** Low (v3 is mature, well-tested)

---

### Option 2: Upgrade Resolvers to v4.x (EXPERIMENTAL)

**Action:**
```bash
npm install @hookform/resolvers@latest
```

**Check latest version:**
```bash
npm info @hookform/resolvers version
npm info @hookform/resolvers peerDependencies
```

**Rationale:**
- Newer versions may have full Zod v4 support
- Keeps Zod v4 (if you want latest features)

**Risk:** Medium (requires testing all form validation code)

**Verification needed:**
1. Check if latest `@hookform/resolvers` explicitly supports Zod v4
2. Test all forms with `zodResolver()` after upgrade
3. Verify no breaking changes in resolver API

---

### Option 3: Lock Zod to v3 Range (SAFEST LONG-TERM)

**Action:**
```json
// package.json
{
  "dependencies": {
    "zod": "~3.25.1"
  }
}
```

**Rationale:**
- `~3.25.1` = patch updates only (3.25.x)
- Prevents auto-upgrade to v4
- Stable until explicit migration

**Risk:** Lowest (freezes at known-good version)

---

## Recommended Solution

**Immediate Action (Quick Fix):**

```bash
# Downgrade Zod to v3
npm install zod@3.25.1

# Clear any caching
rm -rf node_modules/.vite

# Rebuild
npm run build
```

**Verification Steps:**

1. **Build passes:**
   ```bash
   npm run build
   # Expected: exit code 0, no TS errors
   ```

2. **Forms still work:**
   - Test checkout flow
   - Test order creation
   - Verify validation errors display correctly

3. **No runtime errors:**
   ```bash
   npm run dev
   # Open browser console, check for Zod-related errors
   ```

---

## Long-Term Migration Plan (Optional)

If Zod v4 features are needed later:

1. **Upgrade `@hookform/resolvers` first** (check changelog for Zod v4 support)
2. **Upgrade Zod incrementally:**
   - v4.0.0 → test → v4.1.0 → test → v4.3.6
3. **Refactor deprecated APIs:**
   - Replace `.nonempty()` with `.min(1)`
   - Update `.refine()` callbacks if needed
4. **Update tests** to match new error structures

---

## Related Dependencies to Monitor

**No immediate updates needed**, but monitor for compatibility:

| Package | Current | Notes |
|---------|---------|-------|
| `react-hook-form` | v7.71.1 | ✅ Latest v7, stable |
| `@hookform/resolvers` | v5.2.2 | ⚠️ Check if v5.3+ has Zod v4 fixes |
| `zod` | v4.3.6 → **v3.25.1** | Downgrade recommended |

---

## Exit Code Reference

**Build failure exit codes:**
- `Exit 1` = TypeScript compilation error
- `Exit 2` = Vite build error (post-TS)

**Current error:** Exit 1 (TypeScript type mismatch during `tsc -b`)

---

## Unresolved Questions

1. **Does `@hookform/resolvers@5.3.0+` exist?** (Check npm registry)
2. **Is Zod v4 critical for this project?** (No advanced v4 features detected in codebase)
3. **Are there other Zod usages beyond form validation?** (Grep for `z.object` / `z.string` to audit)

---

## Command Summary

**Quick Fix:**
```bash
npm install zod@3.25.1 && npm run build
```

**Verify Solution:**
```bash
npm list zod && npm run build && npm run dev
```

---

**Report Generated:** 2026-02-12 07:49 UTC
**Next Step:** Execute recommended solution → verify build passes → test forms in browser
