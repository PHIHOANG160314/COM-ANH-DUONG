# UI/UX Design Report: Design System & Wireframes

## Overview
We have established a comprehensive Design System based on **Material Design 3 (Material You)** tailored for Cơm Ánh Dương's F&B operations. The design prioritizes mobile-first experiences for customers and staff, while offering high-density interfaces for kitchen and admin roles.

## Design System (`docs/design-guidelines.md`)

### Brand Identity
- **Primary Color:** Dark Green (`#006400`) - Represents freshness and nature.
- **Secondary Color:** Leaf Green (`#73C249`) - Used for accents and secondary actions.
- **Tertiary Color:** Amber/Gold (`#FFB300`) - Used for premium features, membership badges, and highlights.
- **Typography:** `Inter` (UI/Body) and `Roboto` (Headings).

### Key Decisions
1.  **Mobile-First Approach**: The Customer, Staff, and Shipper apps are designed primarily for mobile viewports, utilizing bottom navigation bars and touch-friendly targets (min 44px).
2.  **Dark Mode Strategy**: The Kitchen Display System defaults to a high-contrast Dark Mode to reduce eye strain in low-light kitchen environments and improve readability from a distance.
3.  **Component Library**: Selected **MUI v6** as the implementation library to ensure strict adherence to Material Design 3 standards, accessibility (WCAG 2.1 AA), and responsive behavior.

## Wireframes
HTML/CSS wireframes have been generated to visualize layout and hierarchy without distraction.

| Page | File Path | Key Features |
|------|-----------|--------------|
| **Customer Ordering** | `docs/wireframes/customer-ordering.html` | Hero promo, category pills, bottom nav, cart badge. |
| **Kitchen Display** | `docs/wireframes/kitchen-display.html` | Dark mode, status columns (Kanban), timer badges, high contrast. |
| **Staff POS** | `docs/wireframes/staff-pos.html` | Split screen (Menu + Cart), table selector, quick payment actions. |
| **Shipper Delivery** | `docs/wireframes/shipper-delivery.html` | Order list with map integration, status toggle, COD highlights. |
| **Admin Dashboard** | `docs/wireframes/admin-dashboard.html` | Sidebar nav, data grid, key metrics cards, revenue charts. |
| **Landing Page** | `docs/wireframes/landing-page.html` | Hero section, value propositions, featured menu items, footer. |

## Implementation Guidelines for Developers

### 1. Theming (MUI v6)
Use the `createTheme` API to inject the color tokens defined in `design-guidelines.md`.
```typescript
// Example Theme Config
const theme = createTheme({
  palette: {
    primary: { main: '#006400' },
    secondary: { main: '#73C249' },
    // ...
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  }
});
```

### 2. Layout Structure
- **Customer/Staff:** Use `BottomNavigation` for main routing.
- **Admin/Kitchen:** Use `Drawer` (Sidebar) or `AppBar` for navigation.
- **Grid System:** Use MUI `Grid2` component for responsive layouts.

### 3. Accessibility (A11y)
- Ensure all interactive elements have `aria-label` if they are icon-only.
- Maintain sufficient color contrast (check `design-guidelines.md`).
- Support dynamic font scaling.

## Next Steps
1.  Initialize the React project with MUI v6.
2.  Setup the Theme Provider with the defined tokens.
3.  Begin component implementation starting with the **Customer Ordering** flow.

## Unresolved Questions
- **Kitchen Sound Alerts:** Specific sound files for new orders need to be sourced/defined.
- **Map Provider:** Google Maps vs. OpenStreetMap implementation details for the Shipper app need technical decision (currently wireframed as generic map).
