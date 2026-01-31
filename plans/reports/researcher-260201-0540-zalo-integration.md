# Research Report: Zalo Chat Widget Integration

**Date:** 2026-02-01
**Topic:** Zalo Chat Widget Integration for React Web Apps

## 1. Zalo Official Chat Widget SDK

The official integration uses the "Zalo Social Plugin" SDK.

### Core Components
- **Script URL:** `https://sp.zalo.me/plugins/sdk.js`
- **Container:** A generic HTML element (usually `div`) with class `zalo-chat-widget`.
- **Attributes:**
  - `data-oaid`: The Official Account ID (Required).
  - `data-welcome-message`: Initial greeting text.
  - `data-autopopup`: `0` (off) or `1` (on).
  - `data-width`, `data-height`: Dimensions of the chat window.

### React Integration Pattern

Use a custom hook or component to inject the script only once.

```tsx
// components/ZaloChatWidget.tsx
import { useEffect } from 'react';

declare global {
  interface Window {
    ZaloSocialSDK?: any;
  }
}

interface ZaloChatWidgetProps {
  oaid: string;
  welcomeMessage?: string;
}

export const ZaloChatWidget = ({ oaid, welcomeMessage }: ZaloChatWidgetProps) => {
  useEffect(() => {
    // Prevent duplicate script injection
    if (document.getElementById('zalo-sdk-script')) return;

    const script = document.createElement('script');
    script.id = 'zalo-sdk-script';
    script.src = 'https://sp.zalo.me/plugins/sdk.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Optional: Cleanup if needed, though usually SDKs persist
    };
  }, []);

  return (
    <div
      className="zalo-chat-widget"
      data-oaid={oaid}
      data-welcome-message={welcomeMessage || "Xin chào! Chúng tôi có thể giúp gì cho bạn?"}
      data-autopopup="0"
      data-width="350"
      data-height="420"
      style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}
    />
  );
};
```

## 2. Zalo OA (Official Account) Requirements

To use the widget, you MUST have a valid Zalo Official Account.

- **Status:** Account must be active. "Verified" (Yellow/Blue tick) is recommended to avoid "Stranger" messaging restrictions.
- **Configuration:**
  - Enable "Interact with anonymous users" in OA settings if you want guests to chat without following first.
  - Get the **OA ID** from the OA management dashboard (needed for `data-oaid`).

## 3. Fallback Strategies (Zalo vs WhatsApp)

The official widget can be heavy (~300KB+) or blocked by ad blockers. A "Speed Dial" pattern is often better for performance.

### Strategy: Unified Floating Action Button (FAB)
Instead of loading the full iframe widget, render a lightweight FAB that links to deep links.

| Platform | Deep Link Format | Behavior |
|----------|------------------|----------|
| **Zalo** | `https://zalo.me/<OA_ID>` or `https://zalo.me/<PHONE>` | Opens Zalo App (Mobile) or Web Chat (Desktop) |
| **WhatsApp** | `https://wa.me/<PHONE>` | Opens WhatsApp |

### Implementation Example (Lightweight Fallback)

```tsx
// components/ContactFloatingButton.tsx
export const ContactFloatingButton = () => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {/* WhatsApp */}
      <a
        href="https://wa.me/84901234567"
        target="_blank"
        rel="noreferrer"
        className="bg-green-500 p-3 rounded-full shadow-lg hover:scale-110 transition"
      >
        <img src="/icons/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" />
      </a>

      {/* Zalo Fallback (Direct Link) */}
      <a
        href="https://zalo.me/1234567890" // OA ID or Phone
        target="_blank"
        rel="noreferrer"
        className="bg-blue-500 p-3 rounded-full shadow-lg hover:scale-110 transition"
      >
        <img src="/icons/zalo.svg" alt="Zalo" className="w-6 h-6" />
      </a>
    </div>
  );
};
```

## 4. Recommendation

1.  **Primary:** Use the **Lightweight Fallback** (Direct Links) for the public-facing store (`com-anh-duong-10x`). It performs better, requires no heavy scripts, and works universally.
2.  **Secondary:** Use the **Official Widget** only if you need automated greetings or chatbots directly inside the web context without leaving the tab.

## Unresolved Questions
- Does the client have a Verified Zalo OA ID? (Required for reliable messaging)
- Do they need chatbot automation (Official Widget required) or just direct contact (Deep links sufficient)?
