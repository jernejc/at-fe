import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrendIndicator } from './trend-indicator';

describe('TrendIndicator', () => {
  it('returns nothing when change is zero', () => {
    const { container } = render(<TrendIndicator change={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows a positive label with + prefix for positive change', () => {
    render(<TrendIndicator change={5} />);
    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('shows a negative label for negative change', () => {
    render(<TrendIndicator change={-3} />);
    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('renders the TrendingUp icon above the label for positive change', () => {
    const { container } = render(<TrendIndicator change={7} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Icon should come before the label in the DOM
    const children = container.querySelector('div')!.children;
    expect(children[0].tagName.toLowerCase()).toBe('svg');
    expect(children[1].textContent).toBe('+7');
  });

  it('renders the TrendingDown icon below the label for negative change', () => {
    const { container } = render(<TrendIndicator change={-2} />);
    const children = container.querySelector('div')!.children;
    expect(children[0].textContent).toBe('-2');
    expect(children[1].tagName.toLowerCase()).toBe('svg');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TrendIndicator change={1} className="custom-class" />
    );
    expect(container.firstElementChild).toHaveClass('custom-class');
  });
});
