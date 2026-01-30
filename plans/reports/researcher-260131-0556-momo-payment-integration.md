# Research Report: MoMo E-Wallet Integration for Cơm Ánh Dương

**Date:** 2026-01-31
**Subject:** MoMo Payment Integration Research for React 19 + Supabase POS
**Context:** Mobile-first payment solution for Vietnamese restaurant market.

## 1. MoMo Overview & Market Position
- **Status:** Dominant e-wallet in Vietnam with >30 million users (2026 estimate).
- **Relevance:** Essential for "Cơm Ánh Dương" due to high penetration in the F&B sector.
- **Fees:** Typically **2.0% - 2.5%** per transaction for merchants (varies by volume/contract).
- **Merchant Onboarding:**
  - Requires Business Registration License (GPKD) for corporate accounts.
  - "Personal Merchant" option available for individuals (limits apply).
  - Portal: [business.momo.vn](https://business.momo.vn)

## 2. Integration Options for POS

### A. QR Code (Dynamic) - Best for Desktop/POS Screens
- **Flow:** Server generates a unique QR code per order -> Staff/Customer screen displays it -> Customer scans with MoMo app.
- **Pros:** Reliable for in-store usage.
- **Cons:** Requires customer to have a second device if ordering on mobile (unless using deep link).

### B. App-to-App / Deep Link - Best for Mobile Web (Shipper/Customer)
- **Flow:** User clicks "Pay with MoMo" on mobile web -> System redirects to `momo://` deep link -> Opens MoMo app -> User confirms -> Redirects back to "Cơm Ánh Dương".
- **Technical:** API response includes both `payUrl` (web QR) and `deeplink` (mobile app).
- **Recommendation:** Implement **responsive logic**:
  - **Desktop:** Show QR Code (`payUrl`).
  - **Mobile:** Auto-redirect or "Open App" button (`deeplink`).

## 3. Technical Implementation (Supabase + React)

### Architecture
- **Client (React 19):** Initiates payment request, polls for status or listens to Realtime subscription.
- **Backend (Supabase Edge Function):** Securely signs requests, calls MoMo API, handles IPN callbacks.
- **Database:** Stores `transaction_id`, `order_id`, `signature`, and payment status.

### Key API: `payment/create`
- **Endpoint:** `https://test-payment.momo.vn/v2/gateway/api/create` (Sandbox)
- **Method:** POST
- **Key Payload Fields:**
  - `partnerCode`: Merchant ID.
  - `accessKey`: API Access Key.
  - `requestId`: Unique request ID.
  - `amount`: Transaction amount (VND).
  - `orderId`: Your system's order ID.
  - `notifyUrl`: Your Supabase Edge Function URL for IPN (Webhook).
  - `returnUrl`: Frontend URL to redirect after payment.
  - `signature`: HMAC SHA256 signature.

### Signature Generation (Node.js/Deno Example)
**Critical:** MUST be done server-side (Supabase Edge Function) to protect `secretKey`.

```typescript
// Supabase Edge Function (Deno)
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

function generateSignature(rawSignature: string, secretKey: string) {
  // rawSignature format: accessKey=...&amount=...&extraData=...&ipnUrl=...&orderId=...&orderInfo=...&partnerCode=...&redirectUrl=...&requestId=...&requestType=...
  return hmac("sha256", secretKey, rawSignature, "utf8", "hex");
}
```

### IPN (Instant Payment Notification) Handling
- **Role:** MoMo calls this URL to confirm payment (success/failure).
- **Logic:**
  1. Receive POST request from MoMo.
  2. **Verify Signature:** Re-calculate signature using payload + `secretKey` to ensure authenticity.
  3. If valid: Update Order status in Supabase Database (e.g., `UPDATE orders SET status = 'paid'`).
  4. Respond with status `204` (No Content) or JSON `{"message": "Success"}` to acknowledge.

## 4. Mobile Optimization (React 19)
- **User Agent Detection:** Use `navigator.userAgent` to detect mobile.
- **Deep Link Handling:**
  ```typescript
  if (isMobile) {
     window.location.href = response.deeplink; // Opens MoMo App
  } else {
     setShowQRCode(response.payUrl); // Show QR for scanning
  }
  ```
- **Return URL:** Ensure `returnUrl` handles the callback params (e.g., `?resultCode=0`) to show "Success" UI immediately while waiting for backend confirmation.

## 5. Security & Compliance
- **Never expose `secretKey`** in React frontend code.
- **Signature Verification:** Always verify the signature of incoming IPN requests.
- **Idempotency:** Handle duplicate IPN callbacks (MoMo may retry). Check if order is already processed before updating.
- **HTTPS:** `notifyUrl` must be HTTPS (Supabase provides this by default).

## 6. Unresolved Questions
- Does the client have an existing MoMo Merchant account? (Need PartnerCode/AccessKey).
- Is "Mini App" integration (running *inside* MoMo) required, or just payment gateway? (Assuming Gateway for now).

## Sources
- [MoMo Developer Documentation](https://developers.momo.vn/)
- [MoMo Payment Gateway API](https://developers.momo.vn/v3/docs/payment/api/wallet/onestep)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
