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

## Commit Convention

```
refactor: 10x bootstrap - [specific change]
```
