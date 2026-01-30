# Phase 2: Payment Strategies Implementation

**Overview**
Implement the core logic for generating payment URLs and verifying signatures for VNPay and MoMo using the Strategy Pattern.

**Requirements**
- Standard interface for all payment providers.
- Correct URL generation according to provider documentation.
- Secure signature verification for incoming webhooks.

**Architecture**
- **Pattern:** Strategy Pattern.
- **Location:** Shared logic within Supabase Edge Functions (`_shared/payment-strategies/`).

**Related Code Files**
- `supabase/functions/_shared/payment-interface.ts`
- `supabase/functions/_shared/vnpay-strategy.ts`
- `supabase/functions/_shared/momo-strategy.ts`

**Implementation Steps**

1.  **Define Interface**
    - Create `IPaymentStrategy`:
      - `createPaymentUrl(orderId, amount, ipAddr): Promise<string>`
      - `verifyReturnUrl(params): boolean`
      - `verifyIpn(params): boolean`

2.  **VNPay Strategy**
    - Implement `createPaymentUrl`:
      - Sort parameters alphabetically.
      - Create HMAC-SHA512 signature.
      - Construct final URL.
    - Implement `verifyIpn`:
      - Re-calculate checksum of received data.
      - Compare with received `vnp_SecureHash`.

3.  **MoMo Strategy**
    - Implement `createPaymentUrl`:
      - Construct JSON body.
      - Create HMAC-SHA256 signature.
      - Call MoMo API endpoint to get payUrl.
    - Implement `verifyIpn`:
      - Verify signature matches.

**Success Criteria**
- Unit tests pass for signature generation (matching Sandbox examples).
- Can generate valid URLs that redirect to provider payment pages.
