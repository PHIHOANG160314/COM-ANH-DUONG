---
description: Create production-ready UI/UX designs with various modes
---

# /design - UI/UX Designer Agent

Create professional interfaces with responsive design, WCAG 2.1 AA compliance, and Vietnamese font support.

## Commands

| Command | Speed | Use Case |
|---------|-------|----------|
| `/design:fast [prompt]` | 60-120s | Quick mockups |
| `/design:good [prompt]` | 3-5min | Production-ready |
| `/design:3d [prompt]` | 5-8min | Three.js 3D scenes |
| `/design:screenshot [path]` | 2-4min | Clone from image |
| `/design:describe [path]` | 30s | Extract design tokens |

---

## Design Principles

1. **Vietnamese First**: Use Google Fonts with diacritics (Inter, Roboto, Noto Sans)
2. **Dark Theme Default**: Modern dark UI with glassmorphism
3. **CRO Optimized**: Above-fold CTAs, social proof, trust signals
4. **Responsive**: Mobile-first with proper breakpoints
5. **Performance**: Target Lighthouse 90+, LCP <2.5s

---

## Style Guide Reference

When designing for Ánh Dương F&B:

### Colors
```css
--primary: #6366f1;      /* Indigo */
--secondary: #10b981;    /* Emerald */
--accent: #f59e0b;       /* Amber */
--background: #0a0a12;   /* Dark navy */
--surface: #1a1a2e;      /* Card background */
--text: #ffffff;
--text-muted: #8888a0;
```

### Typography
```css
--font-primary: 'Inter', 'Roboto', sans-serif;
--font-display: 'Outfit', sans-serif;
```

### Spacing
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

---

## Example Prompts

### Landing Page
```
/design:good [create restaurant landing page with hero image, menu preview, customer reviews, location map, online ordering CTA]
```

### Dashboard
```
/design:good [create dark-themed admin dashboard with order stats, revenue chart, recent orders table, low stock alerts]
```

### Mobile Menu
```
/design:fast [create mobile-first food ordering menu with categories, item cards, cart summary, checkout button]
```

---

## Output Structure

```
css/
├── design-system.css     # CSS tokens & utilities
├── components.css        # Reusable components
└── [page-name].css       # Page-specific styles

js/
└── [interactions].js     # UI interactions if needed
```
