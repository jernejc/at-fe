import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DetailSidePanel } from './DetailSidePanel';

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

import { useIsMobile } from '@/hooks/useIsMobile';
const mockUseIsMobile = vi.mocked(useIsMobile);

function renderPanel(open = false, onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <DetailSidePanel open={open} onClose={onClose} detail={<p>Detail content</p>}>
        <p>Main content</p>
      </DetailSidePanel>,
    ),
  };
}

describe('DetailSidePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
    document.body.style.overflow = '';
  });

  it('renders children', () => {
    renderPanel();
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders detail content', () => {
    renderPanel(true);
    expect(screen.getByText('Detail content')).toBeInTheDocument();
  });

  it('applies pointer-events-none when closed', () => {
    renderPanel(false);
    const panel = screen.getByText('Detail content').closest('.fixed');
    expect(panel?.className).toContain('pointer-events-none');
  });

  it('removes pointer-events-none when open', () => {
    renderPanel(true);
    const panel = screen.getByText('Detail content').closest('.fixed.bg-background');
    expect(panel?.className).not.toContain('pointer-events-none');
  });

  it('applies translate-x-0 translate-y-0 when open', () => {
    renderPanel(true);
    const panel = screen.getByText('Detail content').closest('.fixed.bg-background');
    expect(panel?.className).toContain('translate-x-0');
    expect(panel?.className).toContain('translate-y-0');
  });

  it('applies translate-x-full when closed on desktop', () => {
    renderPanel(false);
    const panel = screen.getByText('Detail content').closest('.fixed.bg-background');
    expect(panel?.className).toContain('md:translate-x-full');
  });

  it('renders close button', () => {
    renderPanel(true);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderPanel(true);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed while open', () => {
    const onClose = vi.fn();
    renderPanel(true, onClose);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose on Escape when closed', () => {
    const onClose = vi.fn();
    renderPanel(false, onClose);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  describe('mobile', () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it('locks body scroll when open on mobile', () => {
      renderPanel(true);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('does not lock body scroll when closed on mobile', () => {
      renderPanel(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body scroll on unmount', () => {
      const { unmount } = renderPanel(true);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { onClose, container } = renderPanel(true);

      const backdrop = container.querySelector('.fixed.inset-0') as HTMLElement;
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('desktop', () => {
    it('does not lock body scroll when open', () => {
      mockUseIsMobile.mockReturnValue(false);
      renderPanel(true);
      expect(document.body.style.overflow).toBe('');
    });
  });
});
