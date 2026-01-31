# SEA F&B UX Best Practices: Conversion & Trust

**Date**: 2026-02-01
**Context**: Optimization for Vietnamese market (Com Anh Duong)
**Focus**: COD, Trust, Ops Hours, Zalo

## 1. Cash on Delivery (COD) Prominence
COD remains the dominant payment method (~70-80% of e-commerce/food orders) in Vietnam. Frictionless COD is critical for conversion.

*   **Default Selection**: COD should be the **default selected option** for first-time users. Don't force digital payment on first order.
*   **Visual Hierarchy**:
    *   **Badge**: Apply a "Phổ biến" (Popular) or "Khuyên dùng" (Recommended) tag next to the COD option.
    *   **Color**: Use green (success/safe) accents for the cash icon.
*   **Microcopy**: Use "Thanh toán khi nhận hàng" (Pay on delivery).
    *   *Trust reassurance*: "Chỉ thanh toán khi đã nhận món" (Only pay when food is received).
*   **Checkout Flow**: If COD is selected, the "Place Order" button should be prominent and labeled clearly (e.g., "Đặt đơn - Trả tiền mặt").

## 2. Trust Signals (Vietnam Specific)
Vietnamese consumers are wary of hygiene and quality.

*   **VSATTP Certification**: Display the "Vệ sinh an toàn thực phẩm" (Food Safety & Hygiene) badge prominently in the footer or near the "Add to Cart" button. This is a specific local trust anchor.
*   **Physical Presence**: Show the exact address and a "Real Photo" of the storefront if possible. "Quán có thật" (Real shop) perception reduces anxiety.
*   **Social Proof**:
    *   **"Đã bán" Counter**: Show "1.2k+ đã bán" (Sold 1.2k+) on items. High volume = fresh ingredients.
    *   **Recent Activity**: "5 khách vừa đặt" (5 customers just ordered) ticker.
*   **Guarantee**: "Hoàn tiền nếu món lỗi" (Refund if dish is defective) policy visible near checkout.

## 3. Operating Hours Display
Clear status prevents frustration and abandoned carts due to "closed" surprises.

*   **Status Indicators (Traffic Light System)**:
    *   🟢 **Open**: Green dot + "Đang mở cửa" (Open Now).
    *   🟡 **Closing Soon**: Yellow dot + "Sắp đóng cửa (15p)" (Closing in 15m).
    *   🔴 **Closed**: Gray dot + "Đã đóng cửa - Mở lại lúc 07:00" (Closed - Opens at 07:00).
*   **Cut-off Logic**:
    *   Display "Nhận đơn cuối: 21:30" (Last order: 21:30) distinct from closing time.
    *   **Disabled UI**: When closed, gray out the "Order" button immediately and replace with "Pre-order for Tomorrow" (Đặt trước cho ngày mai) if supported.

## 4. Zalo Integration
Zalo is the de-facto communication channel, preferred over generic chat widgets.

*   **Placement**: Floating Action Button (FAB) at **bottom right**, above any "Back to Top" button.
*   **Iconography**: Use the official Zalo blue icon. Familiarity breeds trust.
*   **Behavior**:
    *   **Mobile**: Deep link directly to the Zalo app (`https://zalo.me/PHONE_NUMBER` or OA ID).
    *   **Desktop**: Open QR code modal for scanning or Zalo Web chat.
*   **Contextual CTA**: Instead of just "Chat", use "Chat hỗ trợ" (Chat Support) or "Đặt tiệc/Sỉ" (Bulk/Party Orders) to drive high-value interactions.

## Unresolved Questions
1. Do we have the official VSATTP certification number/image for Com Anh Duong?
2. Is there a Zalo Official Account (OA) set up, or are we using a personal number?
3. Does the kitchen have a hard cut-off time different from the store closing time?

## Sources
*   [GrabFood/ShopeeFood UI Patterns](https://food.grab.com/vn/en/)
*   [Vietnam E-commerce Payment Trends 2025](https://www.statista.com/topics/6007/e-commerce-in-vietnam/)
*   [Zalo Official Account Guidelines](https://oa.zalo.me/home)
