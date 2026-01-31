# Binh Pháp Strategy Rules

## Core Philosophy

**Công Thành Phá Trận** - Total Victory through systematic execution.

## 6 Battle Fronts

### 🔴 Front 1: Tech Debt Elimination (始計 - Initial Calculations)

- Remove ALL `console.log/warn/error`
- Fix ALL `TODO/FIXME` comments
- Remove ALL `@ts-ignore`
- Goal: 0 tech debt items

### 🔴 Front 2: Type Safety 100% (作戰 - Waging War)

- Replace ALL `any` types with proper types
- Add interfaces where missing
- Strict null checks enabled
- Goal: 0 `any` types

### 🟡 Front 3: Performance (謀攻 - Attack by Stratagem)

- Code splitting with React.lazy
- Configure manualChunks in vite.config
- Image optimization to webp
- Goal: Build < 10s

### 🟡 Front 4: Security (軍形 - Military Disposition)

- Input validation with zod
- XSS prevention
- No secrets exposed
- Goal: 0 vulnerabilities

### 🟢 Front 5: UX Polish (兵勢 - Energy)

- Loading states on all async
- Error boundaries
- Empty states with illustrations
- Goal: Seamless UX

### 🟢 Front 6: Documentation (虛實 - Weaknesses and Strengths)

- README with deployment guide
- Inline code comments
- Updated SOPs
- Goal: Self-documenting

## Victory Criteria

```bash
# Must all return 0
grep -r "console\." src | wc -l  # Tech debt
grep -r "TODO\|FIXME" src | wc -l  # TODOs
grep -r ": any" src | wc -l  # Type safety
```

## 🚀 GO-LIVE Verification (MANDATORY)

Before ANY deployment, CC CLI MUST verify:

### CI/CD Checklist

```bash
# 1. Git status clean
git status --porcelain | wc -l  # Must be 0

# 2. Build passes
npm run build 2>&1 | tail -5  # Must show ✓

# 3. Tests pass
npm run test -- --run 2>&1 | tail -3  # Must show all passed

# 4. Vercel deployment (if applicable)
# Check https://vercel.com/dashboard for green status
```

### Vercel Verification

- [ ] Latest commit pushed to `origin/main`
- [ ] Vercel auto-deploy triggered
- [ ] Build status: ✅ Ready
- [ ] Preview URL accessible
- [ ] No console errors on production

### GitHub Actions

```bash
# Check latest workflow run
gh run list -L 1 --json status,conclusion 2>/dev/null || echo "Check GitHub manually"
```

### Production Health

- [ ] Homepage loads < 3s
- [ ] No 404 errors
- [ ] All API endpoints responding
- [ ] Mobile responsive verified

---

## Commit Convention

```
refactor: 10x bootstrap - [specific change]
```
