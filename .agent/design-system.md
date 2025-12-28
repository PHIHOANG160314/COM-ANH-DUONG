# Ánh Dương F&B - Design System

> Brand guidelines and design tokens for consistent UI/UX

---

## 🎨 Color Palette

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#6366f1` | Buttons, links, highlights |
| `--primary-hover` | `#4f46e5` | Hover states |
| `--secondary` | `#10b981` | Success, confirm, online |
| `--accent` | `#f59e0b` | Badges, notifications |

### Background Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-dark` | `#0a0a12` | Main background |
| `--bg-surface` | `#1a1a2e` | Cards, modals |
| `--bg-elevated` | `#252540` | Elevated elements |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#ffffff` | Headings |
| `--text-secondary` | `#e0e0e0` | Body text |
| `--text-muted` | `#8888a0` | Captions, hints |

---

## 📝 Typography

### Fonts
- **Primary:** Inter (Vietnamese support)
- **Display:** Outfit (headings)
- **Fallback:** Roboto, system-ui

### Sizes
| Token | Size | Line Height |
|-------|------|-------------|
| `--text-xs` | 12px | 1.4 |
| `--text-sm` | 14px | 1.5 |
| `--text-base` | 16px | 1.6 |
| `--text-lg` | 18px | 1.6 |
| `--text-xl` | 20px | 1.5 |
| `--text-2xl` | 24px | 1.4 |
| `--text-3xl` | 30px | 1.3 |

---

## 📐 Spacing

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Pills, tags |
| `--radius-md` | 8px | Buttons |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals |
| `--radius-full` | 9999px | Avatars |

---

## ✨ Effects

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 6px rgba(0,0,0,0.4);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
```

### Glassmorphism
```css
background: rgba(26, 26, 46, 0.8);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## 🖼️ Brand Assets

- **Logo:** `/images/logo.png`
- **Icons:** Emoji-first, fallback to Lucide
- **Images:** WebP format, lazy loading

---

## 📱 Breakpoints

| Name | Width | Columns |
|------|-------|---------|
| Mobile | <768px | 1-2 |
| Tablet | 768-1024px | 2-3 |
| Desktop | >1024px | 3-4 |

---

## ✅ Accessibility

- WCAG 2.1 AA compliant
- Minimum contrast: 4.5:1
- Focus visible states
- Keyboard navigation
- Touch targets: 44x44px min
