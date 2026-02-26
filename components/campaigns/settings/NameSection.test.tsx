import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NameSection } from './NameSection';

const defaultProps = {
  name: 'My Campaign',
  isSaving: false,
  onSave: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  defaultProps.onSave = vi.fn();
});

describe('NameSection', () => {
  it('renders the input prefilled with the campaign name', () => {
    render(<NameSection {...defaultProps} />);

    const input = screen.getByDisplayValue('My Campaign');
    expect(input).toBeInTheDocument();
  });

  it('renders section title and description', () => {
    render(<NameSection {...defaultProps} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Give your campaign a unique name')).toBeInTheDocument();
  });

  it('calls onSave when user changes name and blurs the input', async () => {
    const user = userEvent.setup();
    render(<NameSection {...defaultProps} />);

    const input = screen.getByDisplayValue('My Campaign');
    await user.clear(input);
    await user.type(input, 'New Name');
    await user.tab();

    expect(defaultProps.onSave).toHaveBeenCalledWith('New Name');
  });

  it('calls onSave when user changes name and presses Enter', async () => {
    const user = userEvent.setup();
    render(<NameSection {...defaultProps} />);

    const input = screen.getByDisplayValue('My Campaign');
    await user.clear(input);
    await user.type(input, 'Updated{Enter}');

    expect(defaultProps.onSave).toHaveBeenCalledWith('Updated');
  });

  it('does not call onSave when the name has not changed', async () => {
    const user = userEvent.setup();
    render(<NameSection {...defaultProps} />);

    const input = screen.getByDisplayValue('My Campaign');
    await user.click(input);
    await user.tab();

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('does not call onSave when the input is empty or whitespace', async () => {
    const user = userEvent.setup();
    render(<NameSection {...defaultProps} />);

    const input = screen.getByDisplayValue('My Campaign');
    await user.clear(input);
    await user.tab();

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('disables the input while saving', () => {
    render(<NameSection {...defaultProps} isSaving />);

    const input = screen.getByDisplayValue('My Campaign');
    expect(input).toBeDisabled();
  });
});
