# Phase 2: iOS Support & Custom UI

## Context
iOS Safari does not support the `beforeinstallprompt` event. We must manually detect iOS and show a custom set of instructions to "Add to Home Screen".

## Overview
Implement User Agent detection for iOS and create a modal/dialog guiding the user to install the PWA manually.

## Requirements
- **Detection**: Identify iOS devices (iPhone, iPad, iPod).
- **Trigger**: Same smart triggers as Phase 1 (30s + 50% scroll).
- **UI**:
  - Modal/Dialog for instructions.
  - Step 1: Tap the "Share" icon (display icon).
  - Step 2: Scroll down/Select "Add to Home Screen" (Thêm vào Màn hình chính).
  - Step 3: Confirm "Add" (Thêm).
- **Localization**: All text in Vietnamese.

## Architecture
- **Detection Utility**: `src/shared/utils/platform.ts` (isIOS).
- **Component**: `IosInstallModal` component.
- **Integration**: `InstallPrompt` renders `IosInstallModal` if `isIOS` is true and triggers are met.

## Related Code Files
- `src/features/pwa/install-prompt.tsx`
- `src/features/pwa/ios-install-modal.tsx` (new)
- `src/shared/utils/platform.ts` (create/update)

## Implementation Steps
1.  **Platform Detection**: Implement `isIOS()` helper checking `navigator.userAgent` (and `navigator.maxTouchPoints` for iPads).
2.  **Create Modal Component**: `IosInstallModal`.
    - Use MUI `Dialog` or `Modal`.
    - Include icons (Share icon, Plus icon).
    - Styling to match iOS system UI look or App theme.
3.  **Integrate Logic**:
    - Update `InstallPrompt` to check `isIOS()`.
    - If iOS, skip `beforeinstallprompt` dependency.
    - Rely solely on Time + Scroll + Persistence triggers.
4.  **Instructions Content**:
    - Title: "Cài đặt ứng dụng web"
    - Body:
        1. Nhấn vào nút chia sẻ <ShareIcon />
        2. Chọn "Thêm vào MH chính" <AddIcon />
        3. Nhấn "Thêm" ở góc trên cùng

## Todo List
- [ ] Implement `isIOS` utility.
- [ ] Create `IosInstallModal` component with MUI.
- [ ] Add SVG icons for Safari Share and Add to Home Screen.
- [ ] Update `InstallPrompt` to handle iOS flow.
- [ ] Verify localized text.

## Success Criteria
- iOS users see the custom instruction modal after triggers.
- Android/Desktop users see the standard native prompt (via button).
- Dismissal works for iOS modal (persisted).

## Risks
- User Agent strings change. *Mitigation: Use feature detection where possible, but iOS PWA install is specific to Safari UI.*
- PWA might already be installed (standalone mode). *Mitigation: Check `window.navigator.standalone` or `display-mode: standalone`.*

## Security
- Standard UI security.

## Next Steps
- Phase 3: Visual Polish & Testing.
