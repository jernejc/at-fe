import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders the label', () => {
    render(<ProductCard label="Widget Pro" score={73} isSelected={false} onClick={vi.fn()} />);
    expect(screen.getByText('Widget Pro')).toBeInTheDocument();
  });

  it('renders the None card without a score indicator', () => {
    const { container } = render(
      <ProductCard label="None" isSelected={false} onClick={vi.fn()} />,
    );
    expect(screen.getByText('None')).toBeInTheDocument();
    // No fit-score-indicator should be rendered
    expect(container.querySelector('[data-slot="fit-score-indicator"]')).toBeNull();
  });

  it('shows check icon when selected', () => {
    const { container } = render(
      <ProductCard label="None" isSelected onClick={vi.fn()} />,
    );
    // Check icon should be present (svg with lucide Check)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies selected styling when isSelected is true', () => {
    render(<ProductCard label="Widget" score={50} isSelected onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ProductCard label="Widget" score={73} isSelected={false} onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders FitScoreIndicator when score is provided', () => {
    const { container } = render(
      <ProductCard label="Widget" score={73} isSelected={false} onClick={vi.fn()} />,
    );
    // FitScoreIndicator renders a div with a pie chart
    expect(container.querySelectorAll('.rounded-full').length).toBeGreaterThan(0);
  });
});
