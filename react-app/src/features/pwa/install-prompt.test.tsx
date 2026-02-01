import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { InstallPrompt } from './install-prompt';
import * as platformUtils from '@/shared/utils/platform';

// Mock dependencies
vi.mock('@/shared/hooks/use-scroll-threshold', () => ({
  useScrollThreshold: vi.fn(),
}));

// Mock Debug to avoid console noise
vi.mock('@/shared/utils/debug', () => ({
  Debug: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

import { useScrollThreshold } from '@/shared/hooks/use-scroll-threshold';

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();

    // Default mocks
    (useScrollThreshold as Mock).mockReturnValue(true); // Default to scrolled
    vi.spyOn(platformUtils, 'isIOS').mockReturnValue(false);
    vi.spyOn(platformUtils, 'isStandalone').mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not show initially (waits for time threshold)', () => {
    render(<InstallPrompt />);

    // Dispatch event
    const event = new Event('beforeinstallprompt');
    Object.assign(event, { prompt: vi.fn(), userChoice: Promise.resolve({ outcome: 'accepted' }) });

    act(() => {
      window.dispatchEvent(event);
    });

    // Should not be visible yet (timer not done)
    expect(screen.queryByText(/Cài đặt ứng dụng/i)).not.toBeInTheDocument();

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Should be visible now
    expect(screen.getByText(/Cài đặt ứng dụng/i)).toBeInTheDocument();
  });

  it('does not show if scroll threshold not met', () => {
    (useScrollThreshold as Mock).mockReturnValue(false);

    render(<InstallPrompt />);

    // Dispatch event
    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    // Advance time
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.queryByText(/Cài đặt ứng dụng/i)).not.toBeInTheDocument();
  });

  it('shows on iOS without beforeinstallprompt event', async () => {
    vi.spyOn(platformUtils, 'isIOS').mockReturnValue(true);

    render(<InstallPrompt />);

    // Advance time
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Should see the Snackbar prompt first
    const installButton = screen.getByText('Cài đặt');
    expect(installButton).toBeInTheDocument();

    // Click install to show instructions modal
    act(() => {
      installButton.click();
    });

    // Now expecting the modal content
    expect(screen.getByText(/Cài đặt ứng dụng web/i)).toBeInTheDocument();
  });

  it('does not show on iOS if standalone', () => {
    vi.spyOn(platformUtils, 'isIOS').mockReturnValue(true);
    vi.spyOn(platformUtils, 'isStandalone').mockReturnValue(true);

    render(<InstallPrompt />);

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.queryByText(/Cài đặt ứng dụng web/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cài đặt/i)).not.toBeInTheDocument();
  });

  it('respects dismissal persistence', () => {
    // Set dismissed in storage
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());

    render(<InstallPrompt />);

    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.queryByText(/Cài đặt ứng dụng/i)).not.toBeInTheDocument();
  });

  it('dismisses and saves to storage when closed', () => {
    render(<InstallPrompt />);

    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    const alert = screen.getByText(/Cài đặt ứng dụng/i);
    expect(alert).toBeInTheDocument();

    // Close button has aria-label="close"
    const closeBtn = screen.getByLabelText(/close/i);

    act(() => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByText(/Cài đặt ứng dụng/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('pwa_prompt_dismissed_at')).toBeTruthy();
  });
});
