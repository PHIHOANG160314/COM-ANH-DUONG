import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrustBadges } from './trust-badges';
import '@testing-library/jest-dom';

describe('TrustBadges', () => {
  it('renders minimal variant correctly', () => {
    render(<TrustBadges variant="minimal" />);
    expect(screen.getByText('ATTP Đạt chuẩn')).toBeInTheDocument();
    expect(screen.getByText('Nguyên liệu tươi')).toBeInTheDocument();
    expect(screen.getByText('Bảo mật SSL')).toBeInTheDocument();
  });

  it('renders full variant correctly', () => {
    render(<TrustBadges variant="checkout" />);
    expect(screen.getByText('VSATTP')).toBeInTheDocument();
    expect(screen.getByText('Chứng nhận đạt chuẩn')).toBeInTheDocument();
    expect(screen.getByText('Tươi ngon')).toBeInTheDocument();
    expect(screen.getByText('100% Nguyên liệu sạch')).toBeInTheDocument();
    expect(screen.getByText('Giao nhanh')).toBeInTheDocument();
    expect(screen.getByText('Hoàn tiền')).toBeInTheDocument();
  });
});
