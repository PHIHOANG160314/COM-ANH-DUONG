import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ZaloChatFab } from './zalo-chat-fab';
import '@testing-library/jest-dom';

describe('ZaloChatFab', () => {
  it('renders with default props', () => {
    render(<ZaloChatFab />);
    expect(screen.getByText('Chat hỗ trợ')).toBeInTheDocument();
    const link = screen.getByLabelText('Chat Zalo');
    expect(link).toHaveAttribute('href', 'https://zalo.me/0987654321');
  });

  it('renders with custom props', () => {
    render(<ZaloChatFab phoneNumber="0123456789" label="Tư vấn ngay" />);
    expect(screen.getByText('Tư vấn ngay')).toBeInTheDocument();
    const link = screen.getByLabelText('Chat Zalo');
    expect(link).toHaveAttribute('href', 'https://zalo.me/0123456789');
  });
});
