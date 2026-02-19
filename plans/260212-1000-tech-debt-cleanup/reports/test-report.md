# Test Report

> com-anh-duong-10x@0.0.0 test
> vitest --run


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90m/Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x[39m

[90mstdout[2m | .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-assets.test.cjs
[22m[39m
============================================================
Dashboard Assets Tests
============================================================

 [31m❯[39m .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-renderer.test.cjs [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-assets.test.cjs [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m .claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/error-handling.test.js [2m([22m[2m0 test[22m[2m)[22m
 [32m✓[39m src/features/cart/model/cart-store.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 6[2mms[22m[39m
 [32m✓[39m src/shared/theme/theme.test.ts [2m([22m[2m14 tests[22m[2m)[22m[32m 25[2mms[22m[39m
 [31m❯[39m src/features/menu/api/use-menu.test.tsx [2m([22m[2m6 tests[22m[2m | [22m[31m1 failed[39m[2m)[22m[32m 214[2mms[22m[39m
[31m       [31m×[31m returns real data when Supabase succeeds[39m[32m 41[2mms[22m[39m
       [32m✓[39m returns demo data when Supabase returns an error[32m 2[2mms[22m[39m
       [32m✓[39m returns empty array when no daily menu is set for today[32m 53[2mms[22m[39m
       [32m✓[39m returns empty array when daily_menus query fails[32m 60[2mms[22m[39m
       [32m✓[39m returns real data when daily_menus and menu_items succeed[32m 55[2mms[22m[39m
       [32m✓[39m returns demo data when Supabase returns an error[32m 1[2mms[22m[39m
▶ parseSelector
  ▶ CSS Selectors
    ✔ should detect simple CSS selectors (5.391458ms)
    ✔ should detect class selectors (0.275292ms)
    ✔ should detect ID selectors (0.191375ms)
    ✔ should detect attribute selectors (0.979833ms)
    ✔ should detect complex CSS selectors (0.2215ms)
  ✔ CSS Selectors (8.832333ms)
  ▶ XPath Selectors
    ✔ should detect absolute XPath (0.391208ms)
    ✔ should detect relative XPath (0.2035ms)
    ✔ should detect XPath with text matching (0.161833ms)
    ✔ should detect XPath with contains (0.187667ms)
    ✔ should detect XPath with attributes (0.200708ms)
    ✔ should detect grouped XPath (0.179667ms)
  ✔ XPath Selectors (1.771167ms)
  ▶ Security Validation
    ✔ should block javascript: injection (0.801334ms)
    ✔ should block <script tag injection (0.464583ms)
    ✔ should block onerror= injection (0.299667ms)
    ✔ should block onload= injection (0.18125ms)
    ✔ should block onclick= injection (0.323541ms)
    ✔ should block eval( injection (0.40275ms)
    ✔ should block Function( injection (0.341333ms)
    ✔ should block constructor( injection (0.23025ms)
    ✔ should be case-insensitive for security checks (0.234917ms)
    ✔ should block extremely long selectors (DoS prevention) (0.209125ms)
  ✔ Security Validation (4.125209ms)
  ▶ Edge Cases
    ✔ should throw on empty string (0.235917ms)
    ✔ should throw on null (0.127333ms)
    ✔ should throw on undefined (0.120125ms)
    ✔ should throw on non-string input (0.242708ms)
    ✔ should handle selectors with special characters (0.117875ms)
    ✔ should allow safe XPath with parentheses (0.10625ms)
  ✔ Edge Cases (1.2145ms)
  ▶ Real-World Examples
    ✔ should handle common button selector (0.171542ms)
    ✔ should handle complex form selector (0.106125ms)
    ✔ should handle descendant selector (0.096334ms)
    ✔ should handle nth-child equivalent (0.114791ms)
  ✔ Real-World Examples (0.657041ms)
✔ parseSelector (17.992292ms)
 [31m❯[39m .claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/selector.test.js [2m([22m[2m0 test[22m[2m)[22m
[90mstdout[2m | .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/scripts/tests/server.test.cjs
[22m[39m
--- Port Finder Tests ---
  ✓ DEFAULT_PORT is 3456
  ✓ isPortAvailable returns boolean
  ✓ findAvailablePort returns number

--- Process Manager Tests ---
  ✓ writePidFile and readPidFile work correctly
  ✓ findRunningInstances returns array

--- HTTP Server Tests ---
  ✓ getMimeType returns correct types
  ✓ MIME_TYPES has common extensions

--- Security Tests ---
  ✓ isPathSafe blocks path traversal
  ✓ isPathSafe allows valid paths
  ✓ sanitizeErrorMessage removes paths

--- Markdown Renderer Tests ---
  ✗ resolveImages converts relative paths
    Error: Should include base path: expected to include "/base/path"
  ✓ resolveImages preserves absolute URLs
  ✗ resolveImages handles reference-style definitions
    Error: Should resolve relative path: expected to include "/base/path/screenshots/step1.png"
  ✗ resolveImages handles reference-style with titles
    Error: Should resolve path with title: expected to include "/file/project/images/logo.png"
  ✗ resolveImages handles inline images with titles
    Error: Should resolve inline with title: expected to include "/file/base/image.png"
  ✓ addHeadingIds adds id attributes
  ✓ addHeadingIds handles duplicates
  ✓ generateTOC extracts headings
  ✓ renderTOCHtml generates list
  ✓ renderTOCHtml handles empty array

--- Plan Navigator Tests ---
  ✓ detectPlan identifies plan directory
  ✓ detectPlan returns false for non-plan
  ✓ parsePlanTable extracts phases
  ✓ getNavigationContext returns correct structure
  ✓ generateNavSidebar returns HTML
  ✓ generateNavSidebar returns empty for non-plan

--- Test Results ---
Passed: 22
Failed: 4
Total: 26

 [31m❯[39m .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/scripts/tests/server.test.cjs [2m([22m[2m0 test[22m[2m)[22m
 [31m❯[39m src/features/menu/components/menu-showcase.test.tsx [2m([22m[2m3 tests[22m[2m | [22m[31m2 failed[39m[2m)[22m[33m 563[2mms[22m[39m
[31m     [31m×[31m renders all main sections[39m[33m 504[2mms[22m[39m
     [32m✓[39m renders loading state correctly[32m 25[2mms[22m[39m
[31m     [31m×[31m renders featured products when data is loaded[39m[32m 32[2mms[22m[39m
 [32m✓[39m src/shared/ui/app-card.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[33m 377[2mms[22m[39m
 [32m✓[39m src/features/payment/components/payment-method-selector.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[32m 275[2mms[22m[39m
 [32m✓[39m src/shared/ui/zalo-chat-fab.test.tsx [2m([22m[2m2 tests[22m[2m)[22m[32m 209[2mms[22m[39m
 [32m✓[39m src/pages/customer/order-success-page.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[33m 340[2mms[22m[39m
 [32m✓[39m src/features/pwa/install-prompt.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[33m 535[2mms[22m[39m
     [33m[2m✓[22m[39m does not show initially (waits for time threshold) [33m 364[2mms[22m[39m
 [32m✓[39m src/pages/customer/payment-result-page.test.tsx [2m([22m[2m2 tests[22m[2m)[22m[32m 294[2mms[22m[39m
 [32m✓[39m src/shared/layouts/main-layout.test.tsx [2m([22m[2m7 tests[22m[2m)[22m[33m 634[2mms[22m[39m
 [32m✓[39m src/pages/customer/checkout-page.test.tsx [2m([22m[2m5 tests[22m[2m)[22m[33m 1276[2mms[22m[39m
     [33m[2m✓[22m[39m renders checkout form with items [33m 485[2mms[22m[39m
 [32m✓[39m src/shared/utils/store-hours.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 23[2mms[22m[39m
 [32m✓[39m .claude/claudekit-engineer/.claude/skills/sequential-thinking/tests/process-thought.test.js [2m([22m[2m11 tests[22m[2m)[22m[32m 13[2mms[22m[39m
 [32m✓[39m src/shared/lib/formatters.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 26[2mms[22m[39m
[90mstdout[2m | .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/http-server.test.cjs
[22m[39m
============================================================
HTTP Server Tests
============================================================

 [32m✓[39m .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/http-server.test.cjs [2m([22m[2m32 tests[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m .claude/claudekit-engineer/.claude/skills/sequential-thinking/tests/format-thought.test.js [2m([22m[2m10 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m src/shared/ui/operating-hours.test.tsx [2m([22m[2m6 tests[22m[2m)[22m[32m 83[2mms[22m[39m
 [32m✓[39m src/shared/ui/trust-badges.test.tsx [2m([22m[2m2 tests[22m[2m)[22m[32m 64[2mms[22m[39m
 [32m✓[39m src/shared/ui/footer-compliance.test.tsx [2m([22m[2m2 tests[22m[2m)[22m[32m 51[2mms[22m[39m

[31m⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Suites 5 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-assets.test.cjs[2m [ .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-assets.test.cjs ][22m
[31m[1mReferenceError[22m: before is not defined[39m
[36m [2m❯[22m ../../.claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-assets.test.cjs:[2m18:3[22m[39m
    [90m 16| [39m  [35mlet[39m htmlContent[33m;[39m
    [90m 17| [39m
    [90m 18| [39m  [34mbefore[39m(() [33m=>[39m {
    [90m   | [39m  [31m^[39m
    [90m 19| [39m    assert(fs.existsSync(templatePath), `Template file not found: ${te…
    [90m 20| [39m    htmlContent [33m=[39m fs[33m.[39m[34mreadFileSync[39m(templatePath[33m,[39m [32m'utf8'[39m)[33m;[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯[22m[39m

[41m[1m FAIL [22m[49m .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-renderer.test.cjs[2m [ .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-renderer.test.cjs ][22m
[31m[1mError[22m: Cannot find module '../scripts/lib/dashboard-renderer.cjs'
Require stack:
- /Users/macbookprom1/mekong-cli/.claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-renderer.test.cjs[39m
[36m [2m❯[22m ../../.claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/tests/dashboard-renderer.test.cjs:[2m17:5[22m[39m
    [90m 15| [39m  escapeHtml[33m,[39m
    [90m 16| [39m  formatDate
    [90m 17| [39m} [33m=[39m [34mrequire[39m([32m'../scripts/lib/dashboard-renderer.cjs'[39m)[33m;[39m
    [90m   | [39m    [31m^[39m
    [90m 18| [39m
    [90m 19| [39m[34mdescribe[39m([32m'escapeHtml'[39m[33m,[39m () [33m=>[39m {

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯[22m[39m

[41m[1m FAIL [22m[49m .claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/error-handling.test.js[2m [ .claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/error-handling.test.js ][22m
[31m[1mError[22m: No test suite found in file /Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/.claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/error-handling.test.js[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯[22m[39m

[41m[1m FAIL [22m[49m .claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/selector.test.js[2m [ .claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/selector.test.js ][22m
[31m[1mError[22m: No test suite found in file /Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x/.claude/claudekit-engineer/.claude/skills/chrome-devtools/scripts/__tests__/selector.test.js[39m
[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯[22m[39m

[41m[1m FAIL [22m[49m .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/scripts/tests/server.test.cjs[2m [ .claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/scripts/tests/server.test.cjs ][22m
[31m[1mError[22m: process.exit unexpectedly called with "1"[39m
[36m [2m❯[22m ../../.claude/claudekit-engineer/.claude/skills/markdown-novel-viewer/scripts/tests/server.test.cjs:[2m280:11[22m[39m
    [90m278| [39m
    [90m279| [39m[35mif[39m (failed [33m>[39m [34m0[39m) {
    [90m280| [39m  process[33m.[39m[34mexit[39m([34m1[39m)[33m;[39m
    [90m   | [39m          [31m^[39m
    [90m281| [39m}
    [90m282| [39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯[22m[39m


[31m⎯⎯⎯⎯⎯⎯⎯[39m[1m[41m Failed Tests 3 [49m[22m[31m⎯⎯⎯⎯⎯⎯⎯[39m

[41m[1m FAIL [22m[49m src/features/menu/api/use-menu.test.tsx[2m > [22museMenu Hooks[2m > [22museAllMenuItems[2m > [22mreturns real data when Supabase succeeds
[31m[1mAssertionError[22m: expected [ { id: 1, …(11) }, { id: 2, …(11) } ] to deeply equal [ Array(1) ][39m

[32m- Expected[39m
[31m+ Received[39m

[2m  [[22m
[2m    {[22m
[2m      "categories": {[22m
[32m-       "id": "c1",[39m
[31m+       "created_at": "2026-02-12T03:04:00.537Z",[39m
[31m+       "icon": "🍚",[39m
[31m+       "id": "homemade",[39m
[31m+       "is_active": true,[39m
[31m+       "name": "Món Nhà",[39m
[31m+       "order": 1,[39m
[31m+       "parent_id": "food",[39m
[2m      },[22m
[32m-     "category_id": "c1",[39m
[32m-     "id": 101,[39m
[32m-     "name": "Real Food",[39m
[31m+     "category_id": "homemade",[39m
[31m+     "created_at": "2026-02-12T03:04:00.537Z",[39m
[31m+     "description": "",[39m
[31m+     "id": 1,[39m
[31m+     "image_url": null,[39m
[31m+     "is_active": true,[39m
[31m+     "is_sold_out": false,[39m
[31m+     "name": "Sườn non ram mặn",[39m
[31m+     "price": 35000,[39m
[31m+     "stock_quantity": 40,[39m
[31m+     "updated_at": "2026-02-12T03:04:00.537Z",[39m
[31m+   },[39m
[31m+   {[39m
[31m+     "categories": {[39m
[31m+       "created_at": "2026-02-12T03:04:00.537Z",[39m
[31m+       "icon": "🍚",[39m
[31m+       "id": "rice",[39m
[31m+       "is_active": true,[39m
[31m+       "name": "Cơm",[39m
[31m+       "order": 2,[39m
[31m+       "parent_id": "food",[39m
[31m+     },[39m
[31m+     "category_id": "rice",[39m
[31m+     "created_at": "2026-02-12T03:04:00.537Z",[39m
[31m+     "description": "",[39m
[31m+     "id": 2,[39m
[31m+     "image_url": null,[39m
[31m+     "is_active": true,[39m
[31m+     "is_sold_out": false,[39m
[31m+     "name": "Cá kho tộ",[39m
[31m+     "price": 40000,[39m
[31m+     "stock_quantity": 20,[39m
[31m+     "updated_at": "2026-02-12T03:04:00.537Z",[39m
[2m    },[22m
[2m  ][22m

[36m [2m❯[22m src/features/menu/api/use-menu.test.tsx:[2m90:35[22m[39m
    [90m 88| [39m      [35mawait[39m [34mwaitFor[39m(() [33m=>[39m [34mexpect[39m(result[33m.[39mcurrent[33m.[39misSuccess)[33m.[39m[34mtoBe[39m([35mtrue[39m))[33m;[39m
    [90m 89| [39m
    [90m 90| [39m      [34mexpect[39m(result[33m.[39mcurrent[33m.[39mdata)[33m.[39m[34mtoEqual[39m(realData)[33m;[39m
    [90m   | [39m                                  [31m^[39m
    [90m 91| [39m    })[33m;[39m
    [90m 92| [39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯[22m[39m

[41m[1m FAIL [22m[49m src/features/menu/components/menu-showcase.test.tsx[2m > [22mMenuShowcase[2m > [22mrenders all main sections
[31m[1mTestingLibraryElementError[22m[39m: Unable to find an element with the text: /Phường Sa Đéc, Tỉnh Đồng Tháp/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mclass[39m=[32m"MuiBox-root css-vooagt"[39m
    [36m>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiBox-root css-1sjxqrk"[39m
      [36m>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiBox-root css-hclxk9"[39m
        [36m>[39m
          [36m<h1[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-ims299-MuiTypography-root"[39m
          [36m>[39m
            [0mCơm Ánh Dương[0m
          [36m</h1>[39m
          [36m<h4[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-1qset8s-MuiTypography-root"[39m
          [36m>[39m
            [0mHương Vị Quê Hương[0m
          [36m</h4>[39m
          [36m<p[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-body1 css-1ijsk7x-MuiTypography-root"[39m
          [36m>[39m
            [0mCơm nhà mẹ nấu - Giao nhanh trong 30 phút tại Phường Sa Đéc[0m
          [36m</p>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiContainer-root MuiContainer-maxWidthLg css-es0c4e-MuiContainer-root"[39m
      [36m>[39m
        [36m<h2[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-fkcyma-MuiTypography-root"[39m
        [36m>[39m
          [0mDanh Mục Món Ăn[0m
        [36m</h2>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiGrid-root MuiGrid-container MuiGrid-direction-xs-row MuiGrid-spacing-xs-4 css-kqg16c-MuiGrid-root"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🍚[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mCơm[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🍖[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mMón Chính[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🥤[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mĐồ Uống[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🍰[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mTráng Miệng[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 css-y2klca-MuiPaper-root"[39m
        [33mstyle[39m=[32m"--Paper-shadow: none;"[39m
      [36m>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiBox-root css-j32qel"[39m
        [36m>[39m
          [36m<h2[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-3bvfgh-MuiTypography-root"[39m
          [36m>[39m
            [0m🎉 Ưu Đãi Hôm Nay[0m
          [36m</h2>[39m
          [36m<h6[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-1jc2nrq-MuiTypography-root"[39m
          [36m>[39m
            [0mGiảm 20% cho đơn đầu tiên - Mã: SADEC20[0m
          [36m</h6>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiContainer-root MuiContainer-maxWidthLg css-604joz-MuiContainer-root"[39m
      [36m>[39m
        [36m<h2[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-1fa4exb-MuiTypography-root"[39m
        [36m>[39m
          [0mThực Đơn Chi Tiết[0m
        [36m</h2>[39m
        [36m<div[39m
          [33mdata-testid[39m=[32m"menu-grid"[39m
        [36m>[39m
          [0mMenuGrid Mock[0m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiContainer-root MuiContainer-maxWidthLg css-hkqiyd-MuiContainer-root"[39m
      [36m>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiBox-root css-cxu4j7"[39m
        [36m>[39m
          [36m<button[39m
            [33mclass[39m=[32m"MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedSecondary MuiButton-sizeLarge MuiButton-containedSizeLarge MuiButton-colorSecondary MuiButton-root MuiButton-contained MuiButton-containedSecondary MuiButton-sizeLarge MuiButton-containedSizeLarge MuiButton-colorSecondary css-1a3c6ob-MuiButtonBase-root-MuiButton-root"[39m
            [33mtabindex[39m=[32m"0"[39m
            [33mtype[39m=[32m"button"[39m
          [36m>[39m
            [0mĐặt Cơm Ngay[0m
          [36m</button>[39m
          [36m<p[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-body1 css-k16oju-MuiTypography-root"[39m
          [36m>[39m
            [0mGiao nhanh 30 phút • Freeship &gt;50k[0m
          [36m</p>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 css-18hjgv2-MuiPaper-root"[39m
        [33mstyle[39m=[32m"--Paper-shadow: none;"[39m
      [36m>[39m
        [36m<p[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-body1 css-4leci6-MuiTypography-root"[39m
        [36m>[39m
          [0m📞 [0m
          [0m0947 717 315[0m
          [0m • 📍 [0m
          [0m581C Hùng Vương, Tân Phú Đông[0m
        [36m</p>[39m
        [36m<p[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-body2 css-1wle3ir-MuiTypography-root"[39m
        [36m>[39m
          [0m⏰ [0m
          [0m8:00 - 22:00 hàng ngày[0m
        [36m</p>[39m
        [36m<p[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-body2 css-1wle3ir-MuiTypography-root"[39m
        [36m>[39m
          [0m© 2026 Cơm Ánh Dương - Hương vị quê hương[0m
        [36m</p>[39m
      [36m</div>[39m
    [36m</div>[39m
  [36m</div>[39m
[36m</body>[39m
[90m [2m❯[22m Object.getElementError ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:[2m37:19[22m[39m
[90m [2m❯[22m ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:[2m76:38[22m[39m
[90m [2m❯[22m ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:[2m52:17[22m[39m
[90m [2m❯[22m ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:[2m95:19[22m[39m
[36m [2m❯[22m src/features/menu/components/menu-showcase.test.tsx:[2m99:19[22m[39m
    [90m 97| [39m
    [90m 98| [39m    [90m// Footer[39m
    [90m 99| [39m    expect(screen.getByText(/Phường Sa Đéc, Tỉnh Đồng Tháp/i)).toBeInT…
    [90m   | [39m                  [31m^[39m
    [90m100| [39m  })[33m;[39m
    [90m101| [39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯[22m[39m

[41m[1m FAIL [22m[49m src/features/menu/components/menu-showcase.test.tsx[2m > [22mMenuShowcase[2m > [22mrenders featured products when data is loaded
[31m[1mTestingLibraryElementError[22m[39m: Unable to find an element with the text: Test Product 1. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mclass[39m=[32m"MuiBox-root css-vooagt"[39m
    [36m>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiBox-root css-1sjxqrk"[39m
      [36m>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiBox-root css-hclxk9"[39m
        [36m>[39m
          [36m<h1[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-ims299-MuiTypography-root"[39m
          [36m>[39m
            [0mCơm Ánh Dương[0m
          [36m</h1>[39m
          [36m<h4[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-1qset8s-MuiTypography-root"[39m
          [36m>[39m
            [0mHương Vị Quê Hương[0m
          [36m</h4>[39m
          [36m<p[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-body1 css-1ijsk7x-MuiTypography-root"[39m
          [36m>[39m
            [0mCơm nhà mẹ nấu - Giao nhanh trong 30 phút tại Phường Sa Đéc[0m
          [36m</p>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiContainer-root MuiContainer-maxWidthLg css-es0c4e-MuiContainer-root"[39m
      [36m>[39m
        [36m<h2[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-fkcyma-MuiTypography-root"[39m
        [36m>[39m
          [0mDanh Mục Món Ăn[0m
        [36m</h2>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiGrid-root MuiGrid-container MuiGrid-direction-xs-row MuiGrid-spacing-xs-4 css-kqg16c-MuiGrid-root"[39m
        [36m>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🍚[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mCơm[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🍖[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mMón Chính[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🥤[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mĐồ Uống[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mclass[39m=[32m"MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-12 MuiGrid-grid-sm-6 MuiGrid-grid-md-3 css-17hq2y0-MuiGrid-root"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiCard-root css-tkwfic-MuiPaper-root-MuiCard-root"[39m
              [33mstyle[39m=[32m"--Paper-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);"[39m
            [36m>[39m
              [36m<button[39m
                [33mclass[39m=[32m"MuiButtonBase-root MuiCardActionArea-root css-1ft22bl-MuiButtonBase-root-MuiCardActionArea-root"[39m
                [33mtabindex[39m=[32m"0"[39m
                [33mtype[39m=[32m"button"[39m
              [36m>[39m
                [36m<div[39m
                  [33mclass[39m=[32m"MuiCardContent-root css-ahu0kq-MuiCardContent-root"[39m
                [36m>[39m
                  [36m<h1[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h1 css-52l8fl-MuiTypography-root"[39m
                  [36m>[39m
                    [0m🍰[0m
                  [36m</h1>[39m
                  [36m<div[39m
                    [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-h9fkkg-MuiTypography-root"[39m
                  [36m>[39m
                    [0mTráng Miệng[0m
                  [36m</div>[39m
                [36m</div>[39m
                [36m<span[39m
                  [33mclass[39m=[32m"MuiCardActionArea-focusHighlight css-1h5un5t-MuiCardActionArea-focusHighlight"[39m
                [36m/>[39m
              [36m</button>[39m
            [36m</div>[39m
          [36m</div>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 css-y2klca-MuiPaper-root"[39m
        [33mstyle[39m=[32m"--Paper-shadow: none;"[39m
      [36m>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiBox-root css-j32qel"[39m
        [36m>[39m
          [36m<h2[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-3bvfgh-MuiTypography-root"[39m
          [36m>[39m
            [0m🎉 Ưu Đãi Hôm Nay[0m
          [36m</h2>[39m
          [36m<h6[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-h6 css-1jc2nrq-MuiTypography-root"[39m
          [36m>[39m
            [0mGiảm 20% cho đơn đầu tiên - Mã: SADEC20[0m
          [36m</h6>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiContainer-root MuiContainer-maxWidthLg css-604joz-MuiContainer-root"[39m
      [36m>[39m
        [36m<h2[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-h4 css-1fa4exb-MuiTypography-root"[39m
        [36m>[39m
          [0mThực Đơn Chi Tiết[0m
        [36m</h2>[39m
        [36m<div[39m
          [33mdata-testid[39m=[32m"menu-grid"[39m
        [36m>[39m
          [0mMenuGrid Mock[0m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiContainer-root MuiContainer-maxWidthLg css-hkqiyd-MuiContainer-root"[39m
      [36m>[39m
        [36m<div[39m
          [33mclass[39m=[32m"MuiBox-root css-cxu4j7"[39m
        [36m>[39m
          [36m<button[39m
            [33mclass[39m=[32m"MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedSecondary MuiButton-sizeLarge MuiButton-containedSizeLarge MuiButton-colorSecondary MuiButton-root MuiButton-contained MuiButton-containedSecondary MuiButton-sizeLarge MuiButton-containedSizeLarge MuiButton-colorSecondary css-1a3c6ob-MuiButtonBase-root-MuiButton-root"[39m
            [33mtabindex[39m=[32m"0"[39m
            [33mtype[39m=[32m"button"[39m
          [36m>[39m
            [0mĐặt Cơm Ngay[0m
          [36m</button>[39m
          [36m<p[39m
            [33mclass[39m=[32m"MuiTypography-root MuiTypography-body1 css-k16oju-MuiTypography-root"[39m
          [36m>[39m
            [0mGiao nhanh 30 phút • Freeship &gt;50k[0m
          [36m</p>[39m
        [36m</div>[39m
      [36m</div>[39m
      [36m<div[39m
        [33mclass[39m=[32m"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 css-18hjgv2-MuiPaper-root"[39m
        [33mstyle[39m=[32m"--Paper-shadow: none;"[39m
      [36m>[39m
        [36m<p[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-body1 css-4leci6-MuiTypography-root"[39m
        [36m>[39m
          [0m📞 [0m
          [0m0947 717 315[0m
          [0m • 📍 [0m
          [0m581C Hùng Vương, Tân Phú Đông[0m
        [36m</p>[39m
        [36m<p[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-body2 css-1wle3ir-MuiTypography-root"[39m
        [36m>[39m
          [0m⏰ [0m
          [0m8:00 - 22:00 hàng ngày[0m
        [36m</p>[39m
        [36m<p[39m
          [33mclass[39m=[32m"MuiTypography-root MuiTypography-body2 css-1wle3ir-MuiTypography-root"[39m
        [36m>[39m
          [0m© 2026 Cơm Ánh Dương - Hương vị quê hương[0m
        [36m</p>[39m
      [36m</div>[39m
    [36m</div>[39m
  [36m</div>[39m
[36m</body>[39m
[90m [2m❯[22m Object.getElementError ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:[2m37:19[22m[39m
[90m [2m❯[22m ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:[2m76:38[22m[39m
[90m [2m❯[22m ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:[2m52:17[22m[39m
[90m [2m❯[22m ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:[2m95:19[22m[39m
[36m [2m❯[22m src/features/menu/components/menu-showcase.test.tsx:[2m150:19[22m[39m
    [90m148| [39m    [34mrender[39m([33m<[39m[33mMenuShowcase[39m [33m/[39m[33m>[39m)[33m;[39m
    [90m149| [39m
    [90m150| [39m    [34mexpect[39m(screen[33m.[39m[34mgetByText[39m([32m'Test Product 1'[39m))[33m.[39m[34mtoBeInTheDocument[39m()[33m;[39m
    [90m   | [39m                  [31m^[39m
    [90m151| [39m    // Match flexible currency format (either 50.000đ or 50,000đ or si…
    [90m152| [39m    [34mexpect[39m(screen[33m.[39m[34mgetByText[39m([36m/50[.,]000/[39m))[33m.[39m[34mtoBeInTheDocument[39m()[33m;[39m

[31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯[22m[39m


[2m Test Files [22m [1m[31m7 failed[39m[22m[2m | [22m[1m[32m18 passed[39m[22m[90m (25)[39m
[2m      Tests [22m [1m[31m3 failed[39m[22m[2m | [22m[1m[32m138 passed[39m[22m[90m (141)[39m
[2m   Start at [22m 10:03:59
[2m   Duration [22m 14.35s[2m (transform 1.28s, setup 2.00s, import 58.09s, tests 5.02s, environment 17.83s)[22m

npm error Lifecycle script `test` failed with error:
npm error code 1
npm error path /Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x
npm error workspace com-anh-duong-10x@0.0.0
npm error location /Users/macbookprom1/mekong-cli/apps/com-anh-duong-10x
npm error command failed
npm error command sh -c vitest --run
Tests failed
