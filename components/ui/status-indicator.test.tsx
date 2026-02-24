import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { getStatusDotColor, StatusIndicator } from './status-indicator';
import { TooltipProvider } from '@/components/ui/tooltip';

function renderWithTooltip(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('getStatusDotColor', () => {
  it('returns emerald-500 for active status', () => {
    expect(getStatusDotColor('active')).toBe('bg-emerald-500');
  });

  it('returns emerald-500 for published status', () => {
    expect(getStatusDotColor('published')).toBe('bg-emerald-500');
  });

  it('returns slate-400 for draft status', () => {
    expect(getStatusDotColor('draft')).toBe('bg-slate-400');
  });

  it('returns emerald-700 for completed status', () => {
    expect(getStatusDotColor('completed')).toContain('bg-emerald-700');
  });

  it('returns amber-500 for archived status', () => {
    expect(getStatusDotColor('archived')).toBe('bg-amber-500');
  });

  it('returns slate-400 for unknown status', () => {
    expect(getStatusDotColor('something-else')).toBe('bg-slate-400');
  });

  it('is case-insensitive', () => {
    expect(getStatusDotColor('Active')).toBe('bg-emerald-500');
    expect(getStatusDotColor('DRAFT')).toBe('bg-slate-400');
  });
});

describe('StatusIndicator', () => {
  it('renders a dot element', () => {
    renderWithTooltip(<StatusIndicator status="active" />);
    const dot = screen.getByRole('button');
    expect(dot).toBeInTheDocument();
  });

  it('applies default size of 8px', () => {
    renderWithTooltip(<StatusIndicator status="active" />);
    const dot = screen.getByRole('button');
    expect(dot).toHaveStyle({ width: '8px', height: '8px' });
  });

  it('applies custom size', () => {
    renderWithTooltip(<StatusIndicator status="active" size={12} />);
    const dot = screen.getByRole('button');
    expect(dot).toHaveStyle({ width: '12px', height: '12px' });
  });

  it('applies additional className', () => {
    renderWithTooltip(<StatusIndicator status="active" className="ml-2" />);
    const dot = screen.getByRole('button');
    expect(dot.className).toContain('ml-2');
  });

  it('includes the correct color class for the status', () => {
    renderWithTooltip(<StatusIndicator status="draft" />);
    const dot = screen.getByRole('button');
    expect(dot.className).toContain('bg-slate-400');
  });
});
