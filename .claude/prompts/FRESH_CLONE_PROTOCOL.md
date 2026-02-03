# ⚠️ CRITICAL: Fresh Clone Protocol - Cơm Ánh Dương

## Mục đích

Xoá hoàn toàn code cũ trên máy và lấy code mới từ GitHub để tránh:

- Push nhầm code cũ/sai lên repo
- Xung đột version giữa local vs remote
- Assets cũ (logo, hình ảnh) còn tồn tại

---

## 🔴 BƯỚC 1: Backup & Xoá sạch (BẮT BUỘC)

```bash
# Di chuyển ra ngoài thư mục project
cd ~

# Xoá hoàn toàn folder cũ (KHÔNG BACKUP - code đã có trên GitHub)
rm -rf ~/path/to/com-anh-duong-10x

# Hoặc nếu muốn backup trước (an toàn hơn):
mv ~/path/to/com-anh-duong-10x ~/path/to/com-anh-duong-10x.backup-$(date +%Y%m%d)
```

---

## 🟢 BƯỚC 2: Clone fresh từ GitHub

```bash
# Clone repo mới hoàn toàn
git clone https://github.com/PHIHOANG160314/COM-ANH-DUONG.git com-anh-duong-10x

# Di chuyển vào project
cd com-anh-duong-10x

# Verify đang ở đúng branch và commit mới nhất
git log -1 --oneline
# Expected: thấy commit mới nhất (b540921 hoặc sau)
```

---

## 🟡 BƯỚC 3: Cài đặt dependencies

```bash
cd react-app
npm install
```

---

## ✅ BƯỚC 4: Verify trước khi làm việc

```bash
# Build test để chắc chắn code hoạt động
npm run build

# Chạy dev server
npm run dev
```

---

## ⚠️ QUY TẮC VÀNG

1. **KHÔNG BAO GIỜ** `git push --force` - sẽ ghi đè code team
2. **LUÔN** `git pull` trước khi commit mới
3. **KIỂM TRA** `git status` trước mỗi commit
4. **HỎI** nếu không chắc chắn - đừng push code sai

---

## 📞 Liên hệ hỗ trợ

Nếu gặp vấn đề, liên hệ ngay:

- Anh Phi (Lead Dev): [số điện thoại]
- Slack: #com-anh-duong-dev

---

**Version**: 2026-02-03
**Certified by**: Antigravity IDE
