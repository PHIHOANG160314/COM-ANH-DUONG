# Phase 3: Visual Polish & Compliance

## Context
Ensure the component looks professional, fits the SEA F&B aesthetic, and adheres to strict code quality standards (Binh Pháp).

## Overview
Apply animations, refine styling, ensure type safety, and add tests.

## Requirements
- **Animation**: Slide-up entrance, fade-in.
- **Styling**: Material Design 3 adaptation (rounded corners, appropriate elevation).
- **Code Quality**:
  - No `console.log` (use `Debug` util).
  - No `any` types.
  - No `TODO` comments.
  - 100% Type coverage.
- **Testing**: Unit tests for the trigger logic and rendering.

## Architecture
- **CSS/Sx**: Use MUI `sx` prop for styling and `Slide` transition.
- **Testing**: `vitest` + `react-testing-library`.

## Related Code Files
- `src/features/pwa/install-prompt.tsx`
- `src/features/pwa/install-prompt.test.tsx` (new)

## Implementation Steps
1.  **Styling**:
    - Ensure `Snackbar` is positioned correctly above bottom navigation.
    - Style the `Alert` to pop out (elevation).
    - Add animations (using MUI `TransitionComponent` or CSS).
2.  **Code Cleanup**:
    - Review all types.
    - Remove temporary logs.
    - Replace any `any` with interfaces.
3.  **Standalone Check**: Ensure prompt doesn't show if app is already running in `standalone` mode.
    - CSS media query: `(display-mode: standalone)`.
4.  **Testing**:
    - Mock `window.addEventListener` for `beforeinstallprompt`.
    - Mock timers for 30s delay.
    - Mock scroll events.
    - Test conditional rendering.

## Todo List
- [ ] Add `Slide` transition to Snackbar.
- [ ] Implement `display-mode: standalone` check.
- [ ] Run type check (`tsc --noEmit`).
- [ ] Write unit tests in `install-prompt.test.tsx`.
- [ ] Verify zero console logs and TODOs.

## Success Criteria
- Smooth animations.
- 100% Pass on Type check.
- Tests pass.
- No visual regressions.

## Risks
- Animation jank on low-end devices. *Mitigation: simple transforms.*

## Security
- None.

## Next Steps
- Deploy and monitor install rates.
