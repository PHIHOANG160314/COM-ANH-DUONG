# VNPay Payment Gateway Research 2026

**Date:** 2026-01-31
**Context:** Payment integration for Cơm Ánh Dương (React 19 + Supabase)

## 1. VNPay Overview
- **Position:** Leading digital payment gateway in Vietnam. Strongest presence in offline/online retail via **VNPay-QR**.
- **Methods:**
  - **VNPay-QR:** Scan via banking apps (Vietcombank, BIDV, Agribank, etc.) or e-wallets.
  - **Domestic Cards:** ATM cards (Napas).
  - **International Cards:** Visa, Mastercard, JCB.
- **Fees:** Typically **1.1% - 2.2%** per transaction + fixed fee (negotiable based on volume).
- **Requirements:** Business registration (GPKD), bank account, website with e-commerce compliance (BoIT).

## 2. Integration Architecture
### Flow (Redirect Model)
1. **Client (React):** User clicks "Pay" -> Calls Backend.
2. **Backend (Supabase Edge Function):** Generates secure URL with HMAC-SHA512 signature -> Returns to Client.
3. **Client:** Redirects user to VNPay Gateway.
4. **VNPay:** User pays -> Redirects user back to `vnp_ReturnUrl` (Client) AND calls `vnp_IpAddr` (IPN Webhook) to Backend.
5. **Backend (IPN):** Verifies signature, updates DB status (Pending -> Paid).

### Environments
- **Sandbox API:** `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- **Production API:** `https://pay.vnpay.vn/vpcpay.html`
- **Sandbox Credentials:**
  - TmnCode: `2BAD4889` (Example)
  - HashSecret: `2CB5D7260067645161476936353F8111` (Example)
  - Test Card: `9704198526191432198` (OTP: 123456)

## 3. Implementation Details

### React 19 + TypeScript Integration
Avoid heavy SDKs. Use a lightweight utility class or Supabase Edge Function to keep secrets secure.

**Recommended Package:** `vnpay` (simple wrapper) or **Manual Implementation** (preferred for TS control).

### Security Best Practices
- **Never expose `vnp_HashSecret` on the client.** URL generation MUST happen server-side (Supabase Edge Function).
- **HMAC-SHA512:** Required for `vnp_SecureHash`.
- **IPN Validation:** Always verify signature and check `vnp_ResponseCode === '00'` before delivering goods.
- **Idempotency:** Handle duplicate IPN callbacks safely.

## 4. Code Examples (TypeScript)

### A. Payment URL Generation (Server-Side)
```typescript
import crypto from 'crypto';
import querystring from 'qs';
import { format } from 'date-fns';

export function createPaymentUrl(orderId: string, amount: number, ipAddr: string) {
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = 'https://comanhduong.vn/payment-return';

  const date = new Date();
  const createDate = format(date, 'yyyyMMddHHmmss');
  const expireDate = format(new Date(date.getTime() + 15 * 60 * 1000), 'yyyyMMddHHmmss');

  const vnp_Params: any = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Payment for order ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // VND * 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  // Sort keys alphabetically (CRITICAL for signature)
  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey!);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  sortedParams['vnp_SecureHash'] = signed;
  return `${vnpUrl}?${querystring.stringify(sortedParams, { encode: false })}`;
}

function sortObject(obj: any) {
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => sorted[key] = obj[key]);
  return sorted;
}
```

### B. IPN Handler (Supabase Edge Function)
```typescript
export async function handleIpn(req: Request) {
  const url = new URL(req.url);
  const vnp_Params = Object.fromEntries(url.searchParams);
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const secretKey = process.env.VNP_HASH_SECRET;
  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });

  const hmac = crypto.createHmac('sha512', secretKey!);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    if (vnp_Params['vnp_ResponseCode'] === '00') {
      // TODO: Update Order Status in Database => PAID
      return { RspCode: '00', Message: 'Confirm Success' };
    }
  } else {
    return { RspCode: '97', Message: 'Invalid Signature' };
  }
}
```

## 5. Sources
- [VNPay Developer Docs](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/)
- [VNPay Sandbox Testing](https://sandbox.vnpayment.vn/apis/vnpay-demo/)
- [NPM: vnpay](https://www.npmjs.com/package/vnpay)

## Unresolved Questions
- Specific Merchant ID (`vnp_TmnCode`) and Secret from client contract?
- Production domain for whitelist?
