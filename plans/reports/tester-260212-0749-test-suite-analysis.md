# Test Suite Analysis Report

**Project:** com-anh-duong-10x (Cơm Ánh Dương)
**Date:** 2026-02-12 07:49
**Test Runner:** Vitest 4.0.18
**Duration:** 15.28s
**Agent:** Tester

---

## Executive Summary

**Test Files:** 7 failed | 18 passed (25 total)
**Test Cases:** 4 failed | 137 passed (141 total)
**Status:** ⚠️ REGRESSION DETECTED - 4 critical test failures

**Critical Issues:**
1. Menu API hook returning real Supabase data instead of mocked data
2. Category ID structure mismatch in test expectations
3. Render failures in Print component tests

---

## Test Results Overview

| Category | Passed | Failed | Total | Pass Rate |
|----------|--------|--------|-------|-----------|
| Test Files | 18 | 7 | 25 | 72% |
| Test Cases | 137 | 4 | 141 | 97.2% |

**Performance:**
- Transform: 1.07s
- Setup: 1.64s
- Import: 63.40s (⚠️ High import time)
- Tests: 6.10s
- Environment: 17.90s

---

## Failed Tests Detail

### 1. Menu API Hook Tests (2 failures)

**File:** `src/features/menu/api/use-menu.test.tsx`

#### Failure 1: useAllMenuItems returns real data
```
Expected: Mock data with id: 101, category_id: "c1"
Received: Real Supabase data with id: 1, category_id: "homemade"
```

**Root Cause:** Mock not intercepting Supabase client properly

**Impact:** Test expects demo/mock data but receives actual database records

**Recommendation:**
- Verify Supabase mock setup in `src/test/mocks/supabase.ts`
- Ensure `vi.mock('@/lib/supabase')` properly intercepts client
- Check if `from('menu_items')` chain is fully mocked

---

#### Failure 2: useCategories returns demo data on error
```
Expected: ID contains "cat" (e.g., "cat1", "cat2")
Received: ID is "food" (real database category)
```

**Root Cause:** Error path not triggering - Supabase success bypassing demo fallback

**Impact:** Demo data fallback mechanism not being tested

**Recommendation:**
- Force Supabase error in test setup: `vi.mocked(supabase.from).mockRejectedValueOnce()`
- Verify error handling code path in `use-menu.ts`
- Ensure demo data constants are imported correctly

---

### 2. Print Invoice Tests (2 failures)

**File:** `src/features/pos/components/print-invoice.test.tsx`

#### Failure 1 & 2: Component render errors
```
Error: Uncaught [TypeError: Cannot read properties of undefined (reading 'map')]
at Order/OrderItem/MenuItemDetails rendering
```

**Root Cause:** Order prop structure missing required nested properties

**Stack Trace:**
```
menu-item-details.tsx:17 - order.items?.map is undefined
print-invoice.tsx:46 - invoiceData.items undefined
```

**Impact:** Print invoice feature broken - critical for POS operations

**Recommendation:**
- Add proper TypeScript types for Order interface
- Validate order.items exists before mapping
- Add defensive checks: `order.items?.map() ?? []`
- Update test fixture to include full order structure

---

### 3. ClaudeKit Skill Tests (4 markdown-novel-viewer failures)

**File:** `.claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/scripts/tests/server.test.cjs`

#### Failures: Image path resolution (4 tests)
```
✗ resolveImages converts relative paths
✗ resolveImages handles reference-style definitions
✗ resolveImages handles reference-style with titles
✗ resolveImages handles inline images with titles
```

**Root Cause:** Base path not being prepended to relative image paths

**Impact:** Low - ClaudeKit skill test, not blocking production code

**Recommendation:**
- Update `resolveImages()` function to prepend base path
- Ensure relative path detection regex works correctly
- Non-critical - defer fix after production code tests pass

---

## Performance Metrics

### Import Time Warning
- **63.40s import time** = 77% of total test duration (82.25s)
- Indicates large dependency tree or slow module resolution

**Recommendations:**
- Analyze with `vitest --reporter=verbose --outputFile=test-trace.json`
- Check for circular dependencies
- Consider lazy loading heavy modules (React Query, Material UI)

---

## Test Coverage Analysis

**Not run** - Coverage command: `npm run test:coverage`

**Expected files:**
- src/features/menu/api/*
- src/features/pos/components/*
- src/lib/supabase.ts

**Action Required:** Run coverage analysis separately

---

## Critical Issues Prioritization

### 🔴 High Priority (Blocking)
1. **Print Invoice Render Failure**
   - Severity: Critical
   - Impact: POS core functionality broken
   - Estimated Fix: 15 min (add type guards)

2. **Menu API Mock Leaking Real Data**
   - Severity: High
   - Impact: Tests unreliable, may pass with stale DB data
   - Estimated Fix: 30 min (fix Supabase mock chain)

### 🟡 Medium Priority
3. **Demo Data Fallback Not Tested**
   - Severity: Medium
   - Impact: Error handling path untested
   - Estimated Fix: 10 min (force error in test)

### 🟢 Low Priority
4. **ClaudeKit Skill Image Paths**
   - Severity: Low
   - Impact: Non-production code
   - Estimated Fix: Defer

---

## Recommended Fix Sequence

### Step 1: Fix Print Invoice (Critical)
```typescript
// File: src/features/pos/components/print-invoice.tsx
// Line 46 - Add guard
{invoiceData.items?.map((item) => ...) ?? <EmptyState />}

// File: src/features/pos/components/order/menu-item-details.tsx
// Line 17 - Add guard
{order.items?.map((item) => ...) ?? null}
```

### Step 2: Fix Supabase Mock
```typescript
// File: src/test/mocks/supabase.ts
// Ensure full mock chain
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: MOCK_MENU_ITEMS, // Not real DB data
        error: null
      })
    })
  }
}));
```

### Step 3: Force Error Path Test
```typescript
// File: src/features/menu/api/use-menu.test.tsx
// Add to error test setup
beforeEach(() => {
  vi.mocked(supabase.from).mockReturnValueOnce({
    select: vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Connection failed' }
    })
  });
});
```

---

## Build Verification

**Next Step:** After fixes, verify:
```bash
npm test                    # All tests pass
npm run build              # 0 TypeScript errors
npm run type-check         # Strict null checks pass
grep -r ": any" src | wc -l  # = 0 (type safety)
```

---

## Quality Gates Status

| Gate | Status | Criterion | Result |
|------|--------|-----------|--------|
| Tests | ❌ FAIL | 100% pass | 97.2% (4 failures) |
| Build | ⏳ PENDING | 0 TS errors | Not run |
| Coverage | ⏳ PENDING | >80% | Not run |
| Type Safety | ⏳ PENDING | 0 `any` | Not run |

**Blocker:** Cannot proceed to code-reviewer until tests GREEN

---

## Unresolved Questions

1. **Why is Supabase mock not intercepting?**
   - Is mock setup order correct in vitest.config.ts?
   - Are we using singleton Supabase client that bypasses mocks?

2. **What's causing 63s import time?**
   - Is this normal for React 19 + Material UI combo?
   - Should we investigate circular deps?

3. **Should we add E2E tests for print invoice?**
   - Unit tests caught structure issue, but visual verification needed
   - Playwright test for actual print dialog?

---

**Next Action:** Fix print invoice guards → rerun tests → verify GREEN
