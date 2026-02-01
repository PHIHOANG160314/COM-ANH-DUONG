import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (savedMode) return savedMode;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set preference
      if (!localStorage.getItem('theme-mode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#4ade80', // Green accent
          },
          secondary: {
            main: '#10b981',
          },
          error: {
            main: '#ef4444',
          },
          warning: {
            main: '#f59e0b',
          },
          info: {
            main: '#3b82f6',
          },
          success: {
            main: '#4ade80',
          },
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#0a0a12',
                  paper: '#1a1a2e',
                },
                text: {
                  primary: '#ffffff',
                  secondary: 'rgba(255, 255, 255, 0.7)',
                },
              }
            : {
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                text: {
                  primary: 'rgba(0, 0, 0, 0.87)',
                  secondary: 'rgba(0, 0, 0, 0.6)',
                },
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
          h1: {
            fontSize: '3.5625rem',
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: '-0.25px',
          },
          h2: {
            fontSize: '2.8125rem',
            fontWeight: 400,
            lineHeight: 1.16,
            letterSpacing: 0,
          },
          h3: {
            fontSize: '2.25rem',
            fontWeight: 400,
            lineHeight: 1.22,
            letterSpacing: 0,
          },
          h4: {
            fontSize: '2rem',
            fontWeight: 400,
            lineHeight: 1.25,
            letterSpacing: 0,
          },
          h5: {
            fontSize: '1.75rem',
            fontWeight: 400,
            lineHeight: 1.29,
            letterSpacing: 0,
          },
          h6: {
            fontSize: '1.5rem',
            fontWeight: 400,
            lineHeight: 1.33,
            letterSpacing: 0,
          },
          subtitle1: {
            fontSize: '1.375rem',
            fontWeight: 400,
            lineHeight: 1.27,
            letterSpacing: 0,
          },
          subtitle2: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '0.15px',
          },
          body1: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.5px',
          },
          body2: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: '0.25px',
          },
          button: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.43,
            letterSpacing: '0.1px',
            textTransform: 'none',
          },
          caption: {
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 1.33,
            letterSpacing: '0.5px',
          },
          overline: {
            fontSize: '0.6875rem',
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
                textTransform: 'none',
                minHeight: 48, // Touch target
                transition: 'transform 0.15s ease-in-out',
                '&:active': {
                  transform: 'scale(0.95)', // Press animation
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
