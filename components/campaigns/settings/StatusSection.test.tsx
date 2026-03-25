import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusSection } from './StatusSection';

const mockHandlePublish = vi.fn();
const mockHandleUnpublish = vi.fn();

vi.mock('@/components/providers/CampaignDetailProvider', () => ({
  useCampaignDetail: () => ({
    handlePublish: mockHandlePublish,
    handleUnpublish: mockHandleUnpublish,
    isPublishing: false,
    isUnpublishing: false,
    overview: null,
  }),
}));

vi.mock('../detail/PublishDialog', () => ({
  PublishDialog: ({ mode, open, onConfirm, loading }: any) => {
    if (!open) return null;
    return (
      <div data-testid="publish-dialog" data-mode={mode}>
        <span>{mode === 'publish' ? 'Publish Campaign' : 'Unpublish Campaign'}</span>
        <button onClick={onConfirm} disabled={loading}>
          Confirm
        </button>
      </div>
    );
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StatusSection — draft status', () => {
  it('renders Publish button when campaign is draft', () => {
    render(<StatusSection status="draft" />);

    expect(screen.getByText('Publish')).toBeInTheDocument();
  });

  it('shows draft description', () => {
    render(<StatusSection status="draft" />);

    expect(screen.getByText('Campaign is in draft mode')).toBeInTheDocument();
  });

  it('calls handlePublish after confirming the dialog', async () => {
    const user = userEvent.setup();
    render(<StatusSection status="draft" />);

    await user.click(screen.getByText('Publish'));
    expect(screen.getByTestId('publish-dialog')).toBeInTheDocument();
    await user.click(screen.getByText('Confirm'));
    expect(mockHandlePublish).toHaveBeenCalledOnce();
  });
});

describe('StatusSection — published status', () => {
  it('renders Unpublish button when campaign is published', () => {
    render(<StatusSection status="published" />);

    expect(screen.getByText('Unpublish')).toBeInTheDocument();
  });

  it('shows published description', () => {
    render(<StatusSection status="published" />);

    expect(screen.getByText('Campaign is live and visible to partners')).toBeInTheDocument();
  });

  it('calls handleUnpublish after confirming the dialog', async () => {
    const user = userEvent.setup();
    render(<StatusSection status="published" />);

    await user.click(screen.getByText('Unpublish'));
    expect(screen.getByTestId('publish-dialog')).toBeInTheDocument();
    await user.click(screen.getByText('Confirm'));
    expect(mockHandleUnpublish).toHaveBeenCalledOnce();
  });
});
