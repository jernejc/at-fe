import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IconSection } from './IconSection';

const defaultProps = {
  icon: 'gem',
  isSaving: false,
  onSave: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  defaultProps.onSave = vi.fn();
});

describe('IconSection', () => {
  it('renders section title and description', () => {
    render(<IconSection {...defaultProps} />);

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('It will help identify your campaign')).toBeInTheDocument();
  });

  it('renders the trigger button', () => {
    render(<IconSection {...defaultProps} />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
  });

  it('disables trigger when saving', () => {
    render(<IconSection {...defaultProps} isSaving />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });

  it('opens icon grid popover when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<IconSection {...defaultProps} />);

    await user.click(screen.getByRole('button'));

    // Should show icon buttons in the popover (each has a title attribute)
    expect(screen.getByTitle('bird')).toBeInTheDocument();
    expect(screen.getByTitle('cat')).toBeInTheDocument();
    expect(screen.getByTitle('pizza')).toBeInTheDocument();
  });

  it('calls onSave with the selected icon name', async () => {
    const user = userEvent.setup();
    render(<IconSection {...defaultProps} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByTitle('cat'));

    expect(defaultProps.onSave).toHaveBeenCalledWith('cat');
  });
});
