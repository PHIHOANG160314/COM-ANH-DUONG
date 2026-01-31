import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#006400', // Dark Green
    },
    secondary: {
      main: '#73C249', // Light Green
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#FFB300', // Amber/Yellow (Tertiary)
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    // Material Design 3 Typography Scale
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',

    // Display styles
    h1: {
      // Display Large
      fontSize: '3.5625rem', // 57px
      fontWeight: 400,
      lineHeight: 1.12,
      letterSpacing: '-0.25px',
    },
    h2: {
      // Display Medium
      fontSize: '2.8125rem', // 45px
      fontWeight: 400,
      lineHeight: 1.16,
      letterSpacing: 0,
    },
    h3: {
      // Display Small
      fontSize: '2.25rem', // 36px
      fontWeight: 400,
      lineHeight: 1.22,
      letterSpacing: 0,
    },

    // Headline styles
    h4: {
      // Headline Large
      fontSize: '2rem', // 32px
      fontWeight: 400,
      lineHeight: 1.25,
      letterSpacing: 0,
    },
    h5: {
      // Headline Medium
      fontSize: '1.75rem', // 28px
      fontWeight: 400,
      lineHeight: 1.29,
      letterSpacing: 0,
    },
    h6: {
      // Headline Small
      fontSize: '1.5rem', // 24px
      fontWeight: 400,
      lineHeight: 1.33,
      letterSpacing: 0,
    },

    // Title styles
    subtitle1: {
      // Title Large
      fontSize: '1.375rem', // 22px
      fontWeight: 400,
      lineHeight: 1.27,
      letterSpacing: 0,
    },
    subtitle2: {
      // Title Medium
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.15px',
    },

    // Body styles
    body1: {
      // Body Large
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.5px',
    },
    body2: {
      // Body Medium
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.25px',
    },

    // Label styles
    button: {
      // Label Large
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: '0.1px',
      textTransform: 'none',
    },
    caption: {
      // Label Medium
      fontSize: '0.75rem', // 12px
      fontWeight: 500,
      lineHeight: 1.33,
      letterSpacing: '0.5px',
    },
    overline: {
      // Label Small
      fontSize: '0.6875rem', // 11px
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase buttons
        },
      },
    },
  },
});

export default theme;
