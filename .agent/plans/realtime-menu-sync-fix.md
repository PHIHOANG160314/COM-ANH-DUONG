# 📋 Implementation Plan: Menu Realtime Sync Fix

> **Ngày tạo:** 29/01/2026  
> **Trạng thái:** 🟡 Chờ duyệt  
> **Độ ưu tiên:** 🔴 Cao (Bug hiển thị)

---

## 📌 Vấn đề hiện tại

### Mô tả bug:
- **Trang Admin (Menu Hôm Nay):** Chỉ hiển thị 2 món (Cà Phê Đen Đá, Cà Phê Sữa Đá)
- **Trang Customer:** Đang hiển thị 4 món (thêm Bạc Xỉu, Trà Đào)
- **Yêu cầu:** Menu Customer phải sync realtime theo Menu Hôm Nay từ Admin

### Nguyên nhân đã xác định:
1. **Customer page load data từ `window.menuItems` (data.js) trước** → Chứa TẤT CẢ món
2. **DailyMenuService.getConfig()** lấy config từ Supabase nhưng có thể bị **cached cũ trong localStorage**
3. **Supabase Realtime subscription có filter theo ngày hôm nay** (`active_date=eq.${today}`) nhưng nếu row chưa tồn tại cho ngày mới, Customer không nhận được update
4. **Không có fallback khi Supabase chưa có row** → Customer tiếp tục dùng localStorage cũ

---

## 🔍 Phân tích Code hiện tại

### File: `js/customer-app.js`
```javascript
// Line 91-137: init() function
async init() {
    // 1. Load ALL menu items from data.js
    this.menuData = [...window.menuItems];
    this.originalMenuData = [...window.menuItems];
    
    // 2. Try to get daily menu from Supabase
    if (typeof DailyMenuService !== 'undefined') {
        const result = await DailyMenuService.getConfig();
        if (result.success && result.data && result.data.active_items) {
            // Save to localStorage
            localStorage.setItem('daily_menu_config', JSON.stringify(localConfig));
        }
    }
    
    // 3. Apply filter
    this.filterDailyMenu(); // ← Dựa vào localStorage
}
```

### File: `js/supabase-client.js` (DailyMenuService)
```javascript
// Line 1362-1390: getConfig()
async getConfig() {
    const supabase = await getSupabase();
    if (!supabase) {
        // Fallback to localStorage ← VẤN ĐỀ: localStorage có thể cũ!
        const local = localStorage.getItem('daily_menu_config');
        return createSuccessResponse({ active_items: config.activeItems || [] });
    }
    
    // Query Supabase for today
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('daily_menu_config')
        .select('*')
        .eq('active_date', today)
        .single();
    
    if (error && error.code === 'PGRST116') {
        // No row found → return empty ← ĐÚNG nhưng không clear localStorage!
        return createSuccessResponse({ active_items: [] });
    }
}
```

---

## ✅ Giải pháp đề xuất

### Fix 1: Clear localStorage cũ khi load config từ Supabase

**File:** `js/supabase-client.js` - `DailyMenuService.getConfig()`

```javascript
async getConfig() {
    return withRetry(async () => {
        const supabase = await getSupabase();
        
        // Clear stale localStorage on new day
        const today = new Date().toISOString().split('T')[0];
        const local = localStorage.getItem('daily_menu_config');
        if (local) {
            try {
                const cached = JSON.parse(local);
                // Check if cached date is different from today
                if (cached.lastUpdated) {
                    const cachedDate = cached.lastUpdated.split('T')[0];
                    if (cachedDate !== today) {
                        console.log('📅 Clearing stale daily menu cache from', cachedDate);
                        localStorage.removeItem('daily_menu_config');
                    }
                }
            } catch (e) {}
        }
        
        if (!supabase) {
            // Fallback to localStorage only if still exists
            const local = localStorage.getItem('daily_menu_config');
            if (local) {
                try {
                    const config = JSON.parse(local);
                    return createSuccessResponse({ active_items: config.activeItems || [] });
                } catch (e) {}
            }
            return createSuccessResponse({ active_items: [] });
        }
        
        // ... rest of the code
    }, 'DailyMenuService.getConfig');
}
```

### Fix 2: Sync localStorage ngay khi nhận được empty từ Supabase

**File:** `js/customer-app.js` - `init()`

```javascript
// Load daily menu config from Supabase
if (typeof DailyMenuService !== 'undefined') {
    console.log('🔄 Customer: Fetching daily menu from Supabase...');
    try {
        const result = await DailyMenuService.getConfig();
        console.log('✅ Customer: Daily menu loaded:', result);
        
        // ALWAYS sync to localStorage, even if empty!
        const localConfig = {
            active: true,
            activeItems: result.success && result.data?.active_items 
                ? result.data.active_items 
                : [],  // ← Empty array if no data
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('daily_menu_config', JSON.stringify(localConfig));
        console.log('💾 Customer: Synced config to localStorage, items:', localConfig.activeItems.length);
        
    } catch (e) {
        console.warn('Customer: Could not load daily menu from Supabase:', e);
    }
}
```

### Fix 3: Force refresh khi Admin update Menu Hôm Nay

**File:** `js/daily-menu-manager.js` - `saveConfig()`

Đã có BroadcastChannel và Supabase Realtime, nhưng cần đảm bảo Customer subscribe đúng cách.

---

## 📂 Files cần sửa

| File | Thay đổi | Độ phức tạp |
|------|----------|-------------|
| `js/supabase-client.js` | Clear stale localStorage cache | 🟢 Thấp |
| `js/customer-app.js` | Always sync localStorage from Supabase | 🟢 Thấp |

---

## 🧪 Kế hoạch test

1. **Test 1:** Mở Admin → Xóa tất cả Menu Hôm Nay → Mở Customer → Phải hiển thị "Hôm nay không có món bán"
2. **Test 2:** Thêm 2 món vào Menu Hôm Nay → Customer phải update realtime chỉ có 2 món
3. **Test 3:** Thêm tiếp 3 món → Customer update ngay lập tức
4. **Test 4:** Reload Customer page → Vẫn hiển thị đúng 5 món

---

## ⏱️ Timeline ước tính

| Task | Thời gian |
|------|-----------|
| Fix code | 15 phút |
| Test local | 10 phút |
| Deploy & verify | 5 phút |
| **Tổng** | **30 phút** |

---

## ✍️ Quyết định cần từ anh

- [ ] **Duyệt plan** → Tôi sẽ tiến hành fix ngay
- [ ] **Yêu cầu thêm thông tin**
- [ ] **Thay đổi approach**

---

**Ghi chú:** Đây là bug logic đơn giản, không liên quan đến UI/CSS. Sau khi fix, menu Customer sẽ luôn sync chính xác với Menu Hôm Nay từ Admin, kể cả khi menu rỗng.
