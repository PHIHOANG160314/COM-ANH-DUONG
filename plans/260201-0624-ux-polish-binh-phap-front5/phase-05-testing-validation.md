# Phase 5: Testing & Validation

## Context
- **Plan:** [Overview](./plan.md)

## Overview
Verify all changes against Binh Pháp "Front 5" criteria and ensure no regressions.

## Requirements
1.  **Build:** Project must build successfully.
2.  **Lint:** Zero lint errors (Tech Debt Front 1).
3.  **Functionality:** Zalo button works, Links work.
4.  **Responsiveness:** UI looks good on Mobile vs Desktop.

## Validation Steps
1.  **Automated Checks:**
    - Run `npm run type-check` (or tsc).
    - Run `npm run lint`.
    - Run `npm run build`.

2.  **Manual Verification:**
    - **Desktop:** Check Hover effects, Footer badges, Header Traffic Light.
    - **Mobile:** Check Zalo FAB position, Touch targets (drawer, buttons), Header responsiveness.

3.  **SOP Verification:**
    - Confirm "Traffic Light" logic in `OperatingHours` is visually distinct (Green/Orange/Red).

## Success Criteria
- [ ] All automated checks pass.
- [ ] Manual verification checklist complete.
- [ ] "Production Ready" status confirmed.

## Todo List
- [ ] Run validation suite.
- [ ] Fix any emerging issues.
