---
description: Dọn rác và tối ưu bộ nhớ đệm cho project Cơm Ánh Dương
---

# Workflow: Vệ Sinh Máy

Thực hiện dọn dẹp rác và tối ưu cache cho dự án.

## Các bước thực hiện

### 1. Xóa Log Files cũ
// turbo
```powershell
Remove-Item -Path "logs/proxy.log", "logs/proxy-error.log", "logs/proxy-out.log" -ErrorAction SilentlyContinue -Force
Write-Host "✅ Đã xóa log files"
```

### 2. Tối ưu Node Modules
// turbo
```powershell
npm prune
npm dedupe
Write-Host "✅ Đã tối ưu node_modules"
```

### 3. Git Garbage Collection
// turbo
```powershell
git gc --aggressive --prune=now
git reflog expire --expire=now --all
Write-Host "✅ Đã tối ưu git repository"
```

### 4. Clear Cache Trình Duyệt (Thông báo)
Thông báo cho user clear cache trình duyệt thủ công nếu cần.

### 5. Cập nhật Service Worker Cache Version
Tăng `CACHE_VERSION` trong file `sw.js` lên version mới để force refresh cache:
```javascript
const CACHE_VERSION = 'v8.0'; // Tăng từ version hiện tại
```

### 6. Báo cáo dung lượng sau cleanup
// turbo
```powershell
$before = 16.5  # MB ước tính
$nodeModules = (Get-ChildItem -Path "node_modules" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$git = (Get-ChildItem -Path ".git" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$logs = (Get-ChildItem -Path "logs" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1KB
Write-Host "📊 Kết quả sau cleanup:"
Write-Host "  node_modules: $([math]::Round($nodeModules, 2)) MB"
Write-Host "  .git: $([math]::Round($git, 2)) MB"
Write-Host "  logs: $([math]::Round($logs, 2)) KB"
Write-Host "✨ Vệ sinh máy hoàn tất!"
```

## Lưu ý
- Workflow này an toàn để chạy định kỳ (hàng tuần)
- Không ảnh hưởng đến code hoặc data
- Các bước có `// turbo` sẽ tự động chạy không cần xác nhận
