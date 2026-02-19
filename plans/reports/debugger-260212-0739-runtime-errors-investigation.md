# Runtime Errors Investigation — com-anh-duong-10x

**Date:** 2026-02-12 | **Mode:** Auto | **Scope:** 5 file/mission

## Tổng Quan

Phân tích toàn bộ `src/` cho runtime errors, unhandled rejections, console warnings. Tìm thấy **42+ vấn đề** tiềm ẩn, fix **5 file nghiêm trọng nhất**.

## 5 File Đã Fix

### 1. `src/shared/ui/lazy-page.tsx` — LazyErrorBoundary (+40 lines)
- **Vấn đề:** LazyPage chỉ wrap `Suspense`, không có ErrorBoundary. Nếu chunk load fail (mạng yếu, deploy cache miss), toàn app crash trắng.
- **Fix:** Thêm `LazyErrorBoundary` class component bọc ngoài Suspense. Hiện "Không thể tải trang" + nút "Tải lại" thay vì crash.

### 2. `src/features/checkout/hooks/use-checkout.ts` — Supabase Silent Failures (+5 lines)
- **Vấn đề:** 2 query Supabase (line 88: `menu_items` price check, line 117: `customers` lookup) không destructure `error`. Nếu query fail → `currentPrices = undefined` → skip price validation → user trả giá cũ.
- **Fix:** Destructure `error` cả 2 query. `pricesError` → throw (abort checkout). `customerError` → Debug.error (non-blocking, guest checkout vẫn hoạt động).

### 3. `src/pages/customer/payment-result-page.tsx` — Unhandled Async (+3 lines)
- **Vấn đề:** `checkPaymentStatus()` async gọi trong useEffect không có `.catch()`. Nếu throw → Unhandled Promise Rejection trong browser console.
- **Fix:** Thêm `.catch()` → set status='failed' + thông báo lỗi user-friendly.

### 4. `src/features/orders/context/order-notification-provider.tsx` — 3 Issues (+13 lines)
- **Vấn đề 1:** `Notification.requestPermission().then()` thiếu `.catch()` → unhandled rejection trên browsers từ chối permission.
- **Vấn đề 2:** `new Audio()` tạo nhưng không cleanup khi unmount → memory leak.
- **Vấn đề 3:** `JSON.parse(localStorage)` có thể throw nếu data corrupt → crash toàn provider.
- **Fix:** Thêm `.catch(() => {})`, cleanup function (`audio.pause(); audio.src = ''`), try-catch quanh JSON.parse.

### 5. `src/features/profile/api/address-api.ts` — Error Swallowing (+4 lines)
- **Vấn đề:** 2 query `customers` (line 11 getAddresses, line 31 addAddress) không destructure error → Supabase fail im lặng, function trả `[]` hoặc throw generic error.
- **Fix:** Destructure `customerError` cả 2 locations.

## Build Status

- **TypeScript:** Clean (0 new errors)
- **Pre-existing build failures:** Zod v4/hookform type mismatch, unused vars — không liên quan đến fix này

## Vấn Đề Còn Lại (Không Fix Lần Này)

| Vấn Đề | File | Severity |
|---------|------|----------|
| `use-bestseller.ts:176` — menuItems.find() có thể undefined | bestseller hook | Medium |
| `use-analytics.ts:26` — Promise.all all-or-nothing | analytics hook | Low |
| `use-loyalty.ts:17` — Promise.all all-or-nothing | loyalty hook | Low |
| Auth provider empty catch blocks (line 40, 46) | auth-provider.tsx | Low |
| Zod v4 / hookform resolver type mismatch | use-checkout.ts | High (build) |
| `err` unused in audio play catch | notification provider | Low (TS6133) |

## Diff Stats

```
5 files changed, 65 insertions(+), 19 deletions(-)
```
