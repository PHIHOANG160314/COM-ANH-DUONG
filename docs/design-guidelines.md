# Cơm Ánh Dương - Design Guidelines & System (MUI v7 + Material Design 3)

## 1. Brand Identity
- **Philosophy**: "Delicious Food, Fast Service, Warm Atmosphere"
- **Visual Style**: Modern, Clean, Eco-friendly, Mobile-First
- **Primary Motif**: Gradient Greens (Freshness) + Amber/Gold (Warmth/Premium)

## 2. Color System (Material Design 3)
Based on HCT color space.

### Core Palette
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Dark Green | `#006400` | Main actions, active states, headers |
| **On Primary** | White | `#FFFFFF` | Text on primary |
| **Primary Container** | Pale Green | `#A8F0A0` | Low-emphasis active states |
| **Secondary** | Leaf Green | `#73C249` | Secondary actions, accents |
| **Secondary Container** | Lime Green | `#D0F0BD` | Selected states |
| **Tertiary** | Amber/Gold | `#FFB300` | Highlights, badges, premium features |
| **Error** | Red | `#BA1A1A` | Validation errors, urgent alerts |
| **Background** | Off-White | `#FCFDF6` | Page background |
| **Surface** | Low Green Tint | `#F0F1EA` | Cards, sheets, dialogs |

### Status Colors
- **Pending**: `#FFC107` (Amber 500)
- **Preparing**: `#2196F3` (Blue 500)
- **Ready**: `#FF9800` (Orange 500)
- **Completed**: `#4CAF50` (Green 500)
- **Cancelled**: `#9E9E9E` (Grey 500)

## 3. Typography (Google Fonts)
**Primary Font**: `Inter` (UI elements, body text)
**Headings Font**: `Roboto` or `Google Sans Text` (if available)

| Scale | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Display Large** | 57px | 400 | 64px | Hero sections, Landing page |
| **Headline Large** | 32px | 400 | 40px | Major page titles |
| **Headline Medium** | 28px | 400 | 36px | Section headers |
| **Title Medium** | 16px | 500 | 24px | Card titles, Subsections |
| **Body Large** | 16px | 400 | 24px | Primary content text |
| **Label Large** | 14px | 500 | 20px | Buttons, Tabs, Chips |

## 4. Spacing & Layout
- **Base Unit**: 4px
- **Grid**: 12 columns (Desktop), 8 columns (Tablet), 4 columns (Mobile)
- **Gaps**: 16px (Mobile), 24px (Tablet/Desktop)
- **Container Max-Widths**:
  - Mobile: 100%
  - Tablet: 600px - 840px
  - Desktop: 1200px

## 5. Shape System (Corner Radius)
- **Full**: `9999px` (Buttons, Chips, FABs)
- **Extra Large**: `28px` (Dialogs, Large Bottom Sheets)
- **Large**: `16px` (Cards, Navigation Drawers)
- **Medium**: `12px` (Small Cards, Images)
- **Small**: `8px` (Text Fields, Tooltips)

## 6. Components (MUI v7 Customization)

### Buttons
- **Filled**: Primary background, full rounded corners. Shadow on hover.
- **Outlined**: 1px border, Primary text.
- **Text**: Primary text, no border.

### Cards
- **Elevated**: Surface color + Shadow Level 1.
- **Outlined**: 1px border `outline-variant`.
- **Filled**: `surface-container-highest` background.

### Navigation
- **Bottom Navigation**: Used for Mobile views (Dashboard, Menu, Profile).
- **Navigation Rail**: Used for Tablet/Desktop (Admin, Kitchen).

### Text Fields
- **Outlined**: Default style. 16px padding.
- **Label**: Floating label behavior.

## 7. Iconography
- **System**: Material Symbols Outlined (Rounded variant preferred).
- **Size**: 24px (default), 20px (small), 32px (large).

## 8. Animations
- **Duration**: Short (200ms), Medium (300ms), Long (500ms).
- **Easing**: `emphasized` (cubic-bezier 0.2, 0, 0, 1) for distinct motions.
- **Transitions**: Fade in, Slide up (for bottom sheets), Scale (for FABs).

## 9. Accessibility (A11y)
- **Contrast**: Minimum 4.5:1 for text.
- **Touch Targets**: Minimum 44x44px.
- **Focus**: Visible focus rings (2px Primary).
- **Semantic HTML**: Proper use of `<main>`, `<nav>`, `<header>`, `<article>`.
- **ARIA**: Labels for icon-only buttons.

## 10. Trust & Conversion (SEA SOPs)
- **Trust Badges**: Display VSATTP, Fresh Food, Fast Delivery prominently on home/checkout.
- **COD Prominence**: Highlight Cash on Delivery with "Phổ biến" (Popular) badge and distinct border/background to reduce friction.
- **Support Visibility**: Floating Zalo Chat button always visible for instant support.
- **Operating Status**: Traffic light indicator (Green/Red) for Open/Closed status (10:00-22:00) in header.
