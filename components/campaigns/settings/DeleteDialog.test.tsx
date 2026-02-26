import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteDialog } from './DeleteDialog';

const defaultProps = {
  campaignName: 'Alpha Outreach',
  open: true,
  onOpenChange: vi.fn(),
  onConfirm: vi.fn(),
  loading: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  defaultProps.onOpenChange = vi.fn();
  defaultProps.onConfirm = vi.fn();
});

describe('DeleteDialog', () => {
  it('renders the dialog title and description when open', () => {
    render(<DeleteDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Delete Campaign' })).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.getByText('Alpha Outreach')).toBeInTheDocument();
  });

  it('renders the confirmation input with campaign name as placeholder', () => {
    render(<DeleteDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('Alpha Outreach');
    expect(input).toBeInTheDocument();
  });

  it('disables Delete Campaign button until name is typed correctly', () => {
    render(<DeleteDialog {...defaultProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Delete Campaign/i });
    expect(deleteBtn).toBeDisabled();
  });

  it('enables Delete Campaign button when the correct name is typed', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('Alpha Outreach');
    await user.type(input, 'Alpha Outreach');

    const deleteBtn = screen.getByRole('button', { name: /Delete Campaign/i });
    expect(deleteBtn).toBeEnabled();
  });

  it('calls onConfirm when Delete Campaign is clicked after typing the name', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('Alpha Outreach');
    await user.type(input, 'Alpha Outreach');
    await user.click(screen.getByRole('button', { name: /Delete Campaign/i }));

    expect(defaultProps.onConfirm).toHaveBeenCalledOnce();
  });

  it('keeps Delete Campaign disabled while loading', async () => {
    const user = userEvent.setup();
    render(<DeleteDialog {...defaultProps} loading />);

    const input = screen.getByPlaceholderText('Alpha Outreach');
    await user.type(input, 'Alpha Outreach');

    const deleteBtn = screen.getByRole('button', { name: /Delete Campaign/i });
    expect(deleteBtn).toBeDisabled();
  });

  it('does not render dialog content when closed', () => {
    render(<DeleteDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Delete Campaign')).not.toBeInTheDocument();
  });
});
