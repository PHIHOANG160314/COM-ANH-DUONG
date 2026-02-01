# Phase 1: Smart Triggers & Localization

## Context
Currently, the PWA prompt shows immediately when `beforeinstallprompt` fires. We need to make this less intrusive and more likely to convert by waiting for user engagement signals.

## Overview
Implement logic to only show the prompt when the user has shown interest (Time + Scroll) and hasn't previously dismissed it.

## Requirements
- **Trigger Logic**: Show ONLY if:
  - `beforeinstallprompt` event has fired (Android/Desktop)
  - User has been active for > 30 seconds
  - User has scrolled > 50% of the page
- **Persistence**: If user dismisses, do not show again for X days (e.g., 7 days) or ever (depending on UX preference - Plan: 7 days).
- **Localization**: Use Vietnamese text.

## Architecture
- **State Management**: React `useState` for trigger conditions.
- **Hooks**: Custom `useSmartPrompt` hook to encapsulate logic.
- **Storage**: `localStorage` to save `pwa_prompt_dismissed_at`.

## Related Code Files
- `src/features/pwa/install-prompt.tsx`

## Implementation Steps
1.  **Create Hook**: `usePwaInstallPrompt` in `src/features/pwa/hooks/use-pwa-install-prompt.ts` (or inline if small).
    - Handle `beforeinstallprompt` event.
    - Handle `install` method.
2.  **Add Timer**: `useEffect` to set a flag `timeThresholdMet` after 30s.
3.  **Add Scroll Listener**: `useEffect` to listen to window scroll.
    - Calculate scroll percentage.
    - Set `scrollThresholdMet` when > 50%.
    - Use throttling to avoid performance issues.
4.  **Check LocalStorage**: Before showing, check `pwa_prompt_dismissed_at`.
5.  **Update Component**:
    - Use the new triggers.
    - Update text to: "Cài đặt ứng dụng Cơm Ánh Dương để đặt món nhanh hơn!"

## Todo List
- [ ] Create `useScrollThreshold` hook (or utils).
- [ ] Implement `beforeinstallprompt` capture with persistence check.
- [ ] Combine triggers: `eventFired && timeMet && scrollMet && !isDismissed`.
- [ ] Update `InstallPrompt` to use new logic.
- [ ] Update localized text.

## Success Criteria
- Prompt does NOT appear immediately on load.
- Prompt appears after 30s AND scrolling down.
- Prompt does NOT appear if previously dismissed.

## Risks
- Users on short pages might never reach 50% scroll (handle by checking if page height is small?). *Mitigation: If page is not scrollable, ignore scroll requirement.*

## Security
- No sensitive data handling.
- XSS prevention via React default escaping.

## Next Steps
- Phase 2: iOS Detection.
