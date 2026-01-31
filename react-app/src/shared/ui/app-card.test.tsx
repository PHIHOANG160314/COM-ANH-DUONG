import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppCard } from './app-card';
import { Button } from '@mui/material';

describe('AppCard', () => {
  it('renders children content', () => {
    render(
      <AppCard>
        <div>Test Content</div>
      </AppCard>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders title and subheader', () => {
    render(
      <AppCard
        title="Card Title"
        subheader="Card Subheader"
      >
        <div>Content</div>
      </AppCard>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subheader')).toBeInTheDocument();
  });

  it('renders action element', () => {
    render(
      <AppCard
        action={<Button>Action</Button>}
      >
        <div>Content</div>
      </AppCard>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <AppCard
        footer={<div>Footer Content</div>}
      >
        <div>Content</div>
      </AppCard>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies custom styling for hover effects', () => {
    const { container } = render(
      <AppCard>
        <div>Content</div>
      </AppCard>
    );
    // Verify base styles that enable the hover effect
    const card = container.firstChild;

    // Check individual style properties to avoid serialization issues
    expect(card).toHaveStyle('height: 100%');
    expect(card).toHaveStyle('display: flex');
    expect(card).toHaveStyle('flex-direction: column');
    // For complex values like transition, regex match might be safer or exact string match if we know the browser behavior
    // but splitting checks is usually robust enough
    const style = window.getComputedStyle(card as Element);
    expect(style.transition).toContain('transform 0.2s ease-in-out');
    expect(style.transition).toContain('box-shadow 0.2s ease-in-out');
  });
});
