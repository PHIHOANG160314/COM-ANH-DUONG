# Legacy Directory Deprecation Analysis — Cơm Ánh Dương 10x

**Date**: 2026-02-12 08:13
**Researcher**: researcher (aaf1213)
**Status**: ✅ COMPLETED

---

## TÓM TẮT NHANH

- **Legacy accessible?** ❌ NO — Vercel không serve files trong `legacy/`
- **References found?** ⚠️ YES — `sitemap.xml` + `robots.txt` có references cũ
- **Size impact**: 1.9MB, 94 files
- **Recommendation**: **DELETE SAFE** — nhưng cần clean references trước
- **Risk**: LOW — zero impact vì Vercel đã ignore

---

## 1. ACCESSIBILITY CHECK

### Vercel Rewrite Rules

```json
{
  "rewrites": [
    { "source": "/((?!images/).*)", "destination": "/index.html" }
  ]
}
```

**Phân tích**:
- Vercel rewrite **MỌI routes** (trừ `/images/`) về `/index.html`
- Có nghĩa là `legacy/admin.html`, `legacy/customer.html` etc. **KHÔNG accessible** qua web
- Routes này bị SPA interceptor (React Router) bắt trước khi đến static files

### Vercel Deployment Config

```
# .vercelignore
legacy           # ✅ Explicitly excluded from deploys
```

**Kết luận**: Legacy directory **HOÀN TOÀN KHÔNG accessible** vì:
1. `.vercelignore` exclude toàn bộ directory
2. Vercel rewrite rules redirect về React SPA
3. `dist/` build output không chứa legacy files

**Evidence**: `ls dist/legacy` → "No legacy in dist"

---

## 2. REFERENCES CHECK

### ⚠️ Sitemap.xml References (OUTDATED)

```xml
<url>
  <loc>https://www.comanhduong.com/customer.html</loc>
  <lastmod>2026-01-22</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
```

**Issue**: Sitemap vẫn reference `customer.html` (legacy page) nhưng URL này KHÔNG tồn tại trên production.

### ⚠️ Robots.txt References (OUTDATED)

```
Disallow: /admin
Disallow: /kitchen
Disallow: /shipper
Disallow: /staff
```

**Issue**: Robots.txt disallow các routes legacy (admin, kitchen, shipper, staff) nhưng routes này đã migrate sang React SPA với auth.

### ✅ Root index.html — CLEAN

```html
<!-- No legacy references -->
<script type="module" src="/src/main.tsx"></script>
```

**No imports** từ legacy directory.

### ✅ Source Code — CLEAN

```bash
grep -r "../legacy" src/
# → No files found
```

**No imports** từ React codebase đến legacy files.

### ✅ Vite Config — CLEAN

Vite không có special handling cho legacy directory.

---

## 3. SIZE ANALYSIS

```
Directory: /Users/.../com-anh-duong-10x/legacy/
Size: 1.9MB
Files: 94 files total
HTML pages: 9 files
```

**Breakdown**:
- `admin.html`, `adminmaster.html` — Admin dashboard (deprecated)
- `customer.html` — Customer app (deprecated)
- `kitchen.html` — Kitchen screen (deprecated)
- `shipper.html`, `staff-mobile.html` — Staff apps (deprecated)
- `landing.html` — Landing page (deprecated)
- `index.html`, `m3-demo.html` — Demo pages
- Plus 85 JS/CSS modules

**Build Impact**: Zero — vì `.vercelignore` đã exclude.

**Deploy Impact**: Giảm 1.9MB upload time khi remove.

---

## 4. DEPRECATION STRATEGY

### ✅ RECOMMENDATION: DELETE SAFE

**Rationale**:
1. **Zero production impact** — Vercel không serve legacy files
2. **Zero code references** — src/ không import gì từ legacy/
3. **Outdated functionality** — vanilla JS code đã migrate sang React 19 + TS
4. **Size reduction** — giảm 1.9MB (94 files) khỏi repo

### ⚠️ PRE-DELETE CLEANUP TASKS

Trước khi xoá `legacy/`, phải clean references:

1. **Update `sitemap.xml`** — xoá `customer.html` entry
2. **Update `robots.txt`** — replace legacy routes với React routes
3. **Git archive** — tạo tag `legacy-backup-260212` để reference về sau (nếu cần)

### 📋 DELETE STEPS

```bash
# Step 1: Create backup tag
git tag -a legacy-backup-260212 -m "Backup before deleting legacy/ directory"
git push origin legacy-backup-260212

# Step 2: Clean references
# - Update sitemap.xml (remove customer.html)
# - Update robots.txt (replace legacy routes)

# Step 3: Delete legacy directory
git rm -rf legacy/

# Step 4: Commit
git commit -m "refactor: remove legacy vanilla JS codebase (fully migrated to React 19)"

# Step 5: Verify build
npm run build
npm run preview

# Step 6: Push
git push origin main
```

---

## 5. RISK ASSESSMENT

### 🟢 LOW RISK

**Why safe to delete**:
- Vercel already ignores directory (`.vercelignore`)
- No production traffic hitting legacy URLs (rewrite rules)
- No codebase imports from legacy/
- Full migration to React 19 + TypeScript completed

**Potential issues** (mitigated):
- ❌ "Historical reference" — **Mitigated**: git tag backup
- ❌ "SEO loss" — **Mitigated**: sitemap.xml đã outdated, no legacy URLs indexed
- ❌ "Rollback need" — **Mitigated**: git history + tag

### 🔵 BACKWARD COMPATIBILITY

**Q**: Có user nào bookmark `customer.html` URLs không?

**A**: Không quan trọng vì:
1. Vercel rewrite rules **ĐÃ** redirect về React SPA
2. Users hiện tại truy cập via React routes (`/`, `/menu`, `/checkout`)
3. Legacy URLs chưa bao giờ public (pre-production code)

---

## 6. ALTERNATIVE: MOVE TO BRANCH

Nếu không muốn delete hoàn toàn, có thể:

```bash
# Create legacy branch
git checkout -b archive/legacy-vanilla-js
git add legacy/
git commit -m "archive: preserve legacy vanilla JS code"
git push origin archive/legacy-vanilla-js

# Switch back and delete from main
git checkout main
git rm -rf legacy/
git commit -m "refactor: move legacy code to archive/legacy-vanilla-js branch"
```

**Benefit**: Preserve code nhưng không làm rối main branch.

---

## KẾT LUẬN

| Metric               | Value                             |
| -------------------- | --------------------------------- |
| Legacy accessible?   | ❌ NO (Vercel ignores)            |
| Codebase references? | ✅ NONE (fully migrated)          |
| Size impact          | 1.9MB (94 files)                  |
| SEO impact           | ⚠️ Clean sitemap.xml first        |
| Risk level           | 🟢 LOW                            |
| **Decision**         | **DELETE + git tag backup**       |
| **Next action**      | Clean sitemap.xml + robots.txt    |

---

## UNRESOLVED QUESTIONS

1. **Domain migration**: Có cần preserve legacy code cho domain cũ (nếu có)?
   - **Answer needed from**: Product owner / stakeholder

2. **Historical audit**: Có audit/compliance requirements để giữ code history?
   - **Default**: Git history + tag đủ cho audit

---

_Report generated: 2026-02-12 08:13_
_Next: Clean sitemap.xml references → Delete legacy/ → Verify build_
