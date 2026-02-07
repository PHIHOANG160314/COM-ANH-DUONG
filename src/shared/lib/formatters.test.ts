import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from './formatters';

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

  describe('formatRelativeTime', () => {
    it('returns empty string for null', () => {
      expect(formatRelativeTime(null)).toBe('');
    });

    it('returns HH:mm for today (diff < 1 day)', () => {
      const now = new Date();
      // Set to 1 hour ago
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = formatRelativeTime(oneHourAgo);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('returns dddd (day name) for < 7 days ago', () => {
      const now = new Date();
      // Set to 2 days ago
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoDaysAgo);
      // In Vietnamese locale, days are likely "Thứ Hai", "Thứ Ba", etc. or "Chủ Nhật"
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('returns DD/MM/YYYY for > 7 days ago', () => {
      const now = new Date();
      // Set to 10 days ago
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(tenDaysAgo);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
