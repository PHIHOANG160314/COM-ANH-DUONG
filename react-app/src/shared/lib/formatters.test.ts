import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateTime } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats number to VND currency', () => {
      expect(formatCurrency(10000)).toBe('10.000 ₫');
      expect(formatCurrency(0)).toBe('0 ₫');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      expect(formatDate(date)).toBe('01/01/2023');
    });

    it('returns empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('formats date time correctly', () => {
      const date = new Date('2023-01-01T10:30:00.000Z');
      // Note: This depends on local time zone of the runner, so we might need to be careful.
      // However, for simple unit test checks, we can check basic formatting structure
      // or mock the timezone if needed. For now, let's just check it returns a string.
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it('returns empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });
  });
});
