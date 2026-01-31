/**
 * Debug utility for development logging
 * Automatically disabled in production builds
 */

const isDev = import.meta.env.DEV;

export const Debug = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args);
    }
  },
};
