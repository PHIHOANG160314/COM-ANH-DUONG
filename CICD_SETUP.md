# 🚀 CI/CD Setup Guide

## Bước 1: Tạo Repository trên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm remote
git remote add origin https://github.com/YOUR_USERNAME/fb-master.git

# Commit và push
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

## Bước 2: Lấy Vercel Credentials

### 2.1 Lấy VERCEL_TOKEN
1. Truy cập: https://vercel.com/account/tokens
2. Click **Create Token**
3. Đặt tên: `github-actions`
4. Copy token

### 2.2 Lấy VERCEL_ORG_ID và VERCEL_PROJECT_ID
```bash
# Trong thư mục project, chạy:
vercel link

# Sau khi link xong, xem file .vercel/project.json
cat .vercel/project.json
```

Nội dung file sẽ có dạng:
```json
{
  "orgId": "xxx",      // <- VERCEL_ORG_ID
  "projectId": "yyy"   // <- VERCEL_PROJECT_ID
}
```

## Bước 3: Thêm Secrets vào GitHub

1. Vào GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** và thêm 3 secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | Token từ bước 2.1 |
| `VERCEL_ORG_ID` | orgId từ bước 2.2 |
| `VERCEL_PROJECT_ID` | projectId từ bước 2.2 |

## Bước 4: Push Code

```bash
git add .
git commit -m "Add CI/CD workflow"
git push
```

## ✅ Workflow sẽ tự động:

1. **Khi push lên `main`/`master`**:
   - Build project
   - Deploy lên Vercel (Production)

2. **Khi tạo Pull Request**:
   - Build project  
   - Deploy Preview URL để test

---

## 📊 Xem kết quả

- GitHub: `Actions` tab trong repo
- Vercel: https://vercel.com/dashboard

## 🔧 Troubleshooting

| Lỗi | Giải pháp |
|-----|----------|
| `VERCEL_TOKEN undefined` | Kiểm tra lại secrets trong GitHub |
| `Project not found` | Chạy `vercel link` lại |
| `Permission denied` | Đảm bảo token có đủ quyền |
