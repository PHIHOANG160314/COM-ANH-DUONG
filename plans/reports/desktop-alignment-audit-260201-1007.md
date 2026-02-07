# Desktop UI Alignment Audit Report

**Date**: 2026-02-01 10:07
**Issue**: Menu section misaligned on PC desktop view

## Root Cause Analysis

### Current Architecture
1. **MainLayout** (line 185):
   - Container maxWidth="lg" with py: 4
   - ALL page content renders inside this Container

2. **HeroSection** (home-page.tsx line 28):
   - Renders OUTSIDE Container constraints
   - Full-width Box with own Container maxWidth="lg" inside
   - Creates visual boundary at 1200px

3. **Menu Section** (home-page.tsx lines 82-87):
   - Renders INSIDE MainLayout Container
   - No additional padding removed in previous fix
   - Should align with Hero's Container, but wrapped by outer Container

### The Problem
**Hero structure**: `Full-width Box → Container(lg) → Content`
**Menu structure**: `MainLayout Container(lg) → Box → Content`

Both use maxWidth="lg" (1200px), but Hero has full-width wrapper creating visual edge, while Menu sits directly in MainLayout Container creating different visual alignment.

### MUI Container Default Behavior
- maxWidth="lg" = 1200px
- Container centers content with `margin: 0 auto`
- Padding: default 24px (3 spacing units)

## The Fix Strategy

**Option 1 (RECOMMENDED)**: Make Hero respect MainLayout Container
- Move HeroSection to render WITH container wrapping
- Remove Hero's own Container
- Let MainLayout Container handle all centering

**Option 2**: Make Menu break out like Hero
- Wrap Menu in full-width Box with own Container
- Match Hero's structure exactly
- More complex, potential inconsistency

### Decision: Option 1
- Simpler architecture
- Consistent Container usage
- Easier maintenance
- Aligns with YAGNI/KISS

## Implementation Plan

1. Modify HeroSection to work WITHOUT own Container
2. Ensure home-page.tsx renders Hero inside layout flow
3. Verify both Hero and Menu align at maxWidth="lg"
4. Test responsive breakpoints (xs, md, lg, xl)

## Files to Modify
- src/features/home/components/hero-section.tsx (remove Container, keep full-width styling)
- Possibly src/pages/customer/home-page.tsx (verify structure)

## Expected Outcome
Both Hero and Menu sections centered at 1200px on desktop, symmetric margins, perfect visual alignment.
