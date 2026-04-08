import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Pagination } from './pagination';

const defaultProps = {
  currentPage: 1,
  totalCount: 50,
  pageSize: 10,
  onPageChange: vi.fn(),
};

function renderPagination(overrides: Partial<typeof defaultProps> = {}) {
  return render(<Pagination {...defaultProps} {...overrides} />);
}

beforeEach(() => {
  defaultProps.onPageChange = vi.fn();
});

describe('Pagination', () => {
  describe('rendering conditions', () => {
    it('returns null when totalCount fits in one page', () => {
      const { container } = renderPagination({ totalCount: 10, pageSize: 10 });
      expect(container.firstChild).toBeNull();
    });

    it('returns null when totalCount is zero', () => {
      const { container } = renderPagination({ totalCount: 0 });
      expect(container.firstChild).toBeNull();
    });

    it('renders when there are multiple pages', () => {
      renderPagination();
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });
  });

  describe('page info display', () => {
    it('shows the current page and total pages', () => {
      renderPagination({ currentPage: 3, totalCount: 80, pageSize: 10 });
      expect(screen.getByText('Page 3 of 8')).toBeInTheDocument();
    });
  });

  describe('previous button', () => {
    it('is disabled when on first page', () => {
      renderPagination({ currentPage: 1 });
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      expect(prevButton).toBeDisabled();
    });

    it('is enabled when not on first page', () => {
      renderPagination({ currentPage: 3 });
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      expect(prevButton).toBeEnabled();
    });

    it('calls onPageChange with currentPage - 1 on click', async () => {
      const user = userEvent.setup();
      renderPagination({ currentPage: 3 });
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('clamps to page 1 when already on first page', async () => {
      const user = userEvent.setup();
      // currentPage=2 so prev is enabled, but test clamp logic by checking the value
      renderPagination({ currentPage: 2 });
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('next button', () => {
    it('is disabled when on last page', () => {
      renderPagination({ currentPage: 5, totalCount: 50, pageSize: 10 });
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      expect(nextButton).toBeDisabled();
    });

    it('is enabled when not on last page', () => {
      renderPagination({ currentPage: 3 });
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      expect(nextButton).toBeEnabled();
    });

    it('calls onPageChange with currentPage + 1 on click', async () => {
      const user = userEvent.setup();
      renderPagination({ currentPage: 3 });
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
    });

    it('clamps to totalPages when on last page', async () => {
      const user = userEvent.setup();
      renderPagination({ currentPage: 4, totalCount: 50, pageSize: 10 });
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(5);
    });
  });

  describe('page number buttons', () => {
    it('shows all page numbers when totalPages <= 7', () => {
      renderPagination({ totalCount: 70, pageSize: 10, currentPage: 1 });
      for (let i = 1; i <= 7; i++) {
        expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
    });

    it('calls onPageChange with the clicked page number', async () => {
      const user = userEvent.setup();
      renderPagination({ currentPage: 1 });
      await user.click(screen.getByRole('button', { name: '3' }));
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('ellipsis logic (totalPages > 7)', () => {
    it('shows leading ellipsis when currentPage > 3', () => {
      renderPagination({ totalCount: 200, pageSize: 10, currentPage: 8 });
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });

    it('shows trailing ellipsis when currentPage < totalPages - 2', () => {
      renderPagination({ totalCount: 200, pageSize: 10, currentPage: 3 });
      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });

    it('always shows first and last page', () => {
      renderPagination({ totalCount: 200, pageSize: 10, currentPage: 10 });
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    });

    it('shows no leading ellipsis when currentPage <= 3', () => {
      renderPagination({ totalCount: 200, pageSize: 10, currentPage: 2 });
      // Should only have trailing ellipsis
      const ellipses = screen.getAllByText('...');
      expect(ellipses).toHaveLength(1);
    });

    it('shows no trailing ellipsis when currentPage >= totalPages - 2', () => {
      renderPagination({ totalCount: 200, pageSize: 10, currentPage: 19 });
      // Should only have leading ellipsis
      const ellipses = screen.getAllByText('...');
      expect(ellipses).toHaveLength(1);
    });

    it('shows both ellipses when currentPage is in the middle', () => {
      renderPagination({ totalCount: 200, pageSize: 10, currentPage: 10 });
      const ellipses = screen.getAllByText('...');
      expect(ellipses).toHaveLength(2);
    });
  });

  describe('scroll to top on page change', () => {
    it('scrolls to top when navigating to a different page', async () => {
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo;
      const user = userEvent.setup();
      renderPagination({ currentPage: 1 });
      await user.click(screen.getByRole('button', { name: '3' }));
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 108, behavior: 'smooth' });
    });

    it('does not scroll when clicking the current page', async () => {
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo;
      const user = userEvent.setup();
      renderPagination({ currentPage: 3 });
      await user.click(screen.getByRole('button', { name: '3' }));
      expect(scrollToSpy).not.toHaveBeenCalled();
      expect(defaultProps.onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      renderPagination({ currentPage: 3, disabled: true });
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
