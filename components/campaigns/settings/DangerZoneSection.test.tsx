import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DangerZoneSection } from './DangerZoneSection';

const defaultProps = {
  campaignName: 'Alpha Outreach',
  isDeleting: false,
  onDelete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  defaultProps.onDelete = vi.fn();
});

describe('DangerZoneSection', () => {
  it('renders section title and description', () => {
    render(<DangerZoneSection {...defaultProps} />);

    expect(screen.getByText('Delete campaign')).toBeInTheDocument();
    expect(screen.getByText('Permanently delete this campaign and all its data')).toBeInTheDocument();
  });

  it('renders a Delete button', () => {
    render(<DangerZoneSection {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('opens the delete dialog when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DangerZoneSection {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('heading', { name: 'Delete Campaign' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Alpha Outreach')).toBeInTheDocument();
  });

  it('calls onDelete when the dialog is confirmed', async () => {
    const user = userEvent.setup();
    render(<DangerZoneSection {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const input = screen.getByPlaceholderText('Alpha Outreach');
    await user.type(input, 'Alpha Outreach');
    await user.click(screen.getByRole('button', { name: /Delete Campaign/i }));

    expect(defaultProps.onDelete).toHaveBeenCalledOnce();
  });
});
