# Task: Implement Dynamic "About Us" Section & Content Update

## Objective
Convert the static "About Us" image on the Landing Page (`index.html`) into a Dynamic Image Carousel managed via the Admin Dashboard. Also, rewrite the "About Us" content to be more engaging.

## Requirements

### 1. Data Layer (`js/data.js`)
- Implement a storage mechanism for "About Us" settings (CMS Config).
- Data structure example:
  ```javascript
  const AboutUsConfig = {
      autoPlay: true,
      interval: 3000,
      images: [
          'logo.jpg', // Default
          // Add 1-2 demo images if available or placeholders
      ],
      activeImageIndex: 0
  };
  ```
- Save/Load this config from `localStorage` (key: `cad_cms_config`).

### 2. Admin Interface (`admin.html` & `js/admin.js`)
- **Location:** Integrate into the **"Tin tức" (News)** tab/section.
- **UI Element:** Add a "Quản lý Giới thiệu" card/panel.
- **Features:**
  - **Toggle Switch:** Enable/Disable Auto-play Carousel.
  - **Image Manager:**
    - List current images.
    - Add new image (URL input or File upload simulator).
    - Delete image.
    - "Set as Active" (Radio button) - Only enabled when Auto-play is OFF.
  - **Save Button:** Persist changes to `localStorage`.

### 3. Landing Page (`index.html` & `js/landing.js`)
- **Structure:** Replace the static `<img class="about-img">` with a Carousel container.
- **Logic:**
  - Fetch config on load.
  - If `autoPlay` is ON: Cycle through images every `interval` ms.
  - If `autoPlay` is OFF: Display only the `activeImageIndex` image.
  - Add simple CSS transitions (fade or slide).

### 4. Content Rewrite (`index.html`)
- **Title:** Change "Câu Chuyện Ánh Dương" to "**Cơm Ngon Tròn Vị - Gắn Kết Yêu Thương**".
- **Text:** Rewrite the introduction paragraph to be warmer and more professional.
  - *Draft:* "Tại Cơm Ánh Dương, chúng tôi chắt chiu từng hạt ngọc trời, lựa chọn những nguyên liệu tươi ngon nhất từ vùng đất Sa Đéc trù phú. Mỗi bữa ăn không chỉ là sự no đủ, mà còn là hương vị của ký ức, của sự sum vầy và tận tâm như chính cơm mẹ nấu."
- **Highlighted Features:** Ensure lists (Fresh ingredients, Expert chefs...) are preserved but styled nicely.

## Execution
- Modify `js/data.js` first.
- Then implement Admin UI in `admin.html`.
- Finally update `index.html` and `js/landing.js`.
- Verify by checking Admin controls and Client display.
