import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SelectToggle } from './select-toggle';

describe('SelectToggle', () => {
  it('renders unchecked state with no icon', () => {
    const { container } = render(<SelectToggle checked={false} onChange={vi.fn()} />);
    const button = container.firstElementChild as HTMLElement;
    expect(button).toHaveAttribute('role', 'checkbox');
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(button.querySelector('svg')).toBeNull();
  });

  it('renders checked state with check icon', () => {
    const { container } = render(<SelectToggle checked={true} onChange={vi.fn()} />);
    const button = container.firstElementChild as HTMLElement;
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('renders indeterminate state with minus icon and mixed aria', () => {
    const { container } = render(
      <SelectToggle checked={false} indeterminate={true} onChange={vi.fn()} />,
    );
    const button = container.firstElementChild as HTMLElement;
    expect(button).toHaveAttribute('aria-checked', 'mixed');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('prefers indeterminate over checked for display', () => {
    const { container } = render(
      <SelectToggle checked={true} indeterminate={true} onChange={vi.fn()} />,
    );
    const button = container.firstElementChild as HTMLElement;
    expect(button).toHaveAttribute('aria-checked', 'mixed');
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<SelectToggle checked={false} onChange={onChange} />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('applies active styles when checked', () => {
    const { container } = render(<SelectToggle checked={true} onChange={vi.fn()} />);
    const button = container.firstElementChild as HTMLElement;
    expect(button.className).toContain('bg-primary');
  });

  it('does not apply active styles when unchecked', () => {
    const { container } = render(<SelectToggle checked={false} onChange={vi.fn()} />);
    const button = container.firstElementChild as HTMLElement;
    expect(button.className).not.toContain('bg-primary');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SelectToggle checked={false} onChange={vi.fn()} className="mt-4" />,
    );
    const button = container.firstElementChild as HTMLElement;
    expect(button.className).toContain('mt-4');
  });
});
