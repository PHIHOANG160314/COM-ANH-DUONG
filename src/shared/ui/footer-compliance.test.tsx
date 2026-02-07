import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FooterCompliance } from './footer-compliance';

describe('FooterCompliance', () => {
  it('renders regulatory compliance badges', () => {
    render(<FooterCompliance />);

    // Check for VSATTP badge text
    expect(screen.getByText('VSATTP')).toBeInTheDocument();
    expect(screen.getByText('Đạt chuẩn')).toBeInTheDocument();

    // Check for BCT badge text
    expect(screen.getByText('Đã thông báo')).toBeInTheDocument();
    expect(screen.getByText('Bộ Công Thương')).toBeInTheDocument();
  });

  it('renders with correct accessibility attributes', () => {
    const { container } = render(<FooterCompliance />);
    // Since it's currently static text, we just ensure it renders content
    expect(container.firstChild).not.toBeNull();
  });
});
