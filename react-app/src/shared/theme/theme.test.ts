import { describe, it, expect } from 'vitest';
import theme from './theme';

describe('Material Design 3 Theme Typography', () => {
  it('should use Inter as the primary font family', () => {
    expect(theme.typography.fontFamily).toContain('Inter');
    expect(theme.typography.fontFamily).toContain('Roboto');
  });

  describe('Display styles', () => {
    it('h1 should match Display Large specs (57px)', () => {
      expect(theme.typography.h1.fontSize).toBe('3.5625rem');
      expect(theme.typography.h1.fontWeight).toBe(400);
      expect(theme.typography.h1.letterSpacing).toBe('-0.25px');
    });

    it('h2 should match Display Medium specs (45px)', () => {
      expect(theme.typography.h2.fontSize).toBe('2.8125rem');
      expect(theme.typography.h2.fontWeight).toBe(400);
    });

    it('h3 should match Display Small specs (36px)', () => {
      expect(theme.typography.h3.fontSize).toBe('2.25rem');
      expect(theme.typography.h3.fontWeight).toBe(400);
    });
  });

  describe('Headline styles', () => {
    it('h4 should match Headline Large specs (32px)', () => {
      expect(theme.typography.h4.fontSize).toBe('2rem');
      expect(theme.typography.h4.fontWeight).toBe(400);
    });

    it('h5 should match Headline Medium specs (28px)', () => {
      expect(theme.typography.h5.fontSize).toBe('1.75rem');
      expect(theme.typography.h5.fontWeight).toBe(400);
    });

    it('h6 should match Headline Small specs (24px)', () => {
      expect(theme.typography.h6.fontSize).toBe('1.5rem');
      expect(theme.typography.h6.fontWeight).toBe(400);
    });
  });

  describe('Title styles', () => {
    it('subtitle1 should match Title Large specs (22px)', () => {
      expect(theme.typography.subtitle1.fontSize).toBe('1.375rem');
      expect(theme.typography.subtitle1.fontWeight).toBe(400);
    });

    it('subtitle2 should match Title Medium specs (16px)', () => {
      expect(theme.typography.subtitle2.fontSize).toBe('1rem');
      expect(theme.typography.subtitle2.fontWeight).toBe(500);
      expect(theme.typography.subtitle2.letterSpacing).toBe('0.15px');
    });
  });

  describe('Body styles', () => {
    it('body1 should match Body Large specs (16px)', () => {
      expect(theme.typography.body1.fontSize).toBe('1rem');
      expect(theme.typography.body1.fontWeight).toBe(400);
      expect(theme.typography.body1.letterSpacing).toBe('0.5px');
    });

    it('body2 should match Body Medium specs (14px)', () => {
      expect(theme.typography.body2.fontSize).toBe('0.875rem');
      expect(theme.typography.body2.fontWeight).toBe(400);
      expect(theme.typography.body2.letterSpacing).toBe('0.25px');
    });
  });

  describe('Label styles', () => {
    it('button should match Label Large specs (14px)', () => {
      expect(theme.typography.button.fontSize).toBe('0.875rem');
      expect(theme.typography.button.fontWeight).toBe(500);
      expect(theme.typography.button.letterSpacing).toBe('0.1px');
      expect(theme.typography.button.textTransform).toBe('none');
    });

    it('caption should match Label Medium specs (12px)', () => {
      expect(theme.typography.caption.fontSize).toBe('0.75rem');
      expect(theme.typography.caption.fontWeight).toBe(500);
      expect(theme.typography.caption.letterSpacing).toBe('0.5px');
    });

    it('overline should match Label Small specs (11px)', () => {
      expect(theme.typography.overline.fontSize).toBe('0.6875rem');
      expect(theme.typography.overline.fontWeight).toBe(500);
      expect(theme.typography.overline.letterSpacing).toBe('0.5px');
      expect(theme.typography.overline.textTransform).toBe('uppercase');
    });
  });
});
