# Research Report: MUI v6 & Material Design 3 for Restaurant POS (2026)

**Date:** 2026-01-30
**Context:** Cơm Ánh Dương POS System
**Framework:** React 19, MUI v6 (Material UI)

## 1. MUI v6 & MD3 Features
MUI v6 is the standard for Material Design 3 (Material You) in 2026, removing the need for legacy adapters.

*   **Native CSS Variables:** `CssVarsProvider` is now default, enabling instant theme switching and granular token updates without React context overhead.
*   **MD3 Components:** All components (Button, Card, Chip, Dialog) default to MD3 specs (larger touch targets, flat surfaces, rounded corners).
*   **Color System:** Full support for tonal palettes (Primary, Secondary, Tertiary, Error, Neutral) and dynamic color generation from seed colors.

**Setup Example:**
```tsx
import { CssVarsProvider, extendTheme } from '@mui/material/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#6750A4' }, // MD3 Purple
        secondary: { main: '#625B71' },
      },
    },
  },
  shape: { borderRadius: 16 }, // MD3 default
});

export default function App() {
  return <CssVarsProvider theme={theme}><Component /></CssVarsProvider>;
}
```

## 2. POS-Specific Theme Customization
Restaurant POS interfaces require high information density but distinct touch targets.

*   **Touch Targets:** Override `MuiButton` and `MuiIconButton` to minimum 48x48px for kitchen/staff screens.
*   **Elevation:** Use tonal elevation (surface colors) instead of shadows for reduced visual noise on bright screens.
*   **Typography:** Increase `fontWeight` for line items (orders) to `600` for readability at a glance.

**Theme Override:**
```tsx
components: {
  MuiButton: {
    styleOverrides: {
      root: { minHeight: 48, borderRadius: '24px' }, // Stadium shape
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: 'var(--mui-palette-surface-container)',
        boxShadow: 'none', // MD3 Flat style
      },
    },
  },
}
```

## 3. Component Selection for Ordering
*   **Menu Items:** `Card` (Outlined variant) with `CardCover` for images.
*   **Cart/Order Summary:** `Drawer` (Persistent on Desktop, BottomSheet/Swipeable on Mobile).
*   **Modifiers:** `Chip` (Filter variant) for selection (e.g., "No Onion", "Extra Spicy").
*   **Navigation:** `NavigationRail` (Tablet/Desktop) vs `NavigationBar` (Mobile).

## 4. Responsive Patterns (Grid v2)
Use MUI `Grid2` (stable in v6) for layout stability.

*   **Mobile (Portrait):** Single column. Bottom Navigation.
*   **Tablet (Landscape):** 2-pane (Menu 70% | Cart 30%). Vertical Navigation Rail.
*   **Desktop:** 3-pane (Categories | Menu Grid | Persistent Cart).

```tsx
import Grid from '@mui/material/Grid2';

<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 8 }}> <MenuGrid /> </Grid>
  <Grid size={{ xs: 0, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
    <CartSidebar />
  </Grid>
</Grid>
```

## 5. Accessibility (a11y)
*   **Contrast:** Ensure 4.5:1 ratio for menu text. Use MUI's `getContrastText`.
*   **Screen Readers:** Label icon-only buttons (e.g., `<IconButton aria-label="Add to cart">`).
*   **Focus:** Maintain visible focus rings for keyboard navigation (crucial for stationary POS terminals).

## Unresolved Questions
1.  Do we need offline-first dynamic color generation (client-side seed extraction from menu images)?
2.  Should we stick to default MD3 font (Roboto) or use a custom brand font (likely impacting performance)?

## Sources
*   [MUI v6 Documentation](https://mui.com/material-ui/getting-started/)
*   [Material Design 3 Specs](https://m3.material.io/)
