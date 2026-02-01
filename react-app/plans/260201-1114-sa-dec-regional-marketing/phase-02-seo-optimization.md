---
title: "Phase 2: Local SEO Meta Tags"
description: "Optimize index.html for Sa Đéc local search"
status: completed
priority: P2
effort: 30m
branch: main
tags: [seo, meta-tags, json-ld]
created: 2026-02-01
---

# Phase 2: Local SEO Meta Tags

## Overview
Update `index.html` with location-specific meta tags and structured data to improve visibility for searches related to "Cơm Sa Đéc", "Đặt cơm Đồng Tháp".

## Requirements
- Update `<title>` tag.
- Update `<meta name="description">`.
- Add Open Graph tags (`og:title`, `og:description`, `og:image`).
- Add JSON-LD for `LocalBusiness` / `Restaurant`.

## Related Files
- `index.html`

## Implementation Steps

1.  **Update Basic Meta Tags**
    -   Title: "Cơm Ánh Dương | Cơm Trưa Văn Phòng Sa Đéc - Đồng Tháp"
    -   Description: "Đặt cơm trưa văn phòng ngon tại Sa Đéc, Đồng Tháp. Đặc sản vùng đất Sen Hồng, giao hàng nhanh tận nơi. Thực đơn đa dạng, chuẩn vị miền Tây."

2.  **Add Open Graph Tags**
    -   `og:title`: "Cơm Ánh Dương - Hương vị Sa Đéc"
    -   `og:description`: "Cơm ngon, giao nhanh tại Sa Đéc. Thử ngay các món đặc sản miền Tây!"
    -   `og:type`: "restaurant"
    -   `og:locale`: "vi_VN"

3.  **Add JSON-LD Structured Data**
    -   Type: `Restaurant`
    -   Name: "Cơm Ánh Dương"
    -   Address: Sa Đéc, Đồng Tháp
    -   PriceRange: "$$"
    -   ServesCuisine: "Vietnamese"

## Todo List
- [x] Update `<title>`
- [x] Update `<meta name="description">`
- [x] Add Open Graph tags
- [x] Add JSON-LD script block

## Success Criteria
- Google snippet preview shows Sa Đéc context.
- Structured data passes validation (can use schema.org validator if available, otherwise manual check).
