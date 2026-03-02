import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PartnerRow, PartnerRowSkeleton, type PartnerRowData } from './PartnerRow';

function makePartner(overrides: Partial<PartnerRowData> = {}): PartnerRowData {
  return {
    id: 1,
    partnerId: 10,
    name: 'Brio Tech',
    slug: 'brio-tech',
    description: 'A technology partner',
    logoUrl: null,
    type: 'technology',
    industries: ['SaaS', 'FinTech'],
    capacity: 20,
    status: 'active',
    assignedCount: 5,
    inProgressCount: 2,
    completedCount: 1,
    taskCompletionPct: 40,
    ...overrides,
  };
}

function renderRow(props: Partial<React.ComponentProps<typeof PartnerRow>> = {}) {
  const partner = props.partner ?? makePartner();
  return render(<PartnerRow partner={partner} {...props} />);
}

describe('PartnerRow', () => {
  it('renders the partner name', () => {
    renderRow({ partner: makePartner({ name: 'Acme Partners' }) });
    expect(screen.getByText('Acme Partners')).toBeInTheDocument();
  });

  it('renders partner industries', () => {
    renderRow({ partner: makePartner({ industries: ['Cloud', 'AI'] }) });
    expect(screen.getByText('Cloud, AI')).toBeInTheDocument();
  });

  it('does not render industries when list is empty', () => {
    renderRow({ partner: makePartner({ industries: [] }) });
    expect(screen.queryByText(',')).not.toBeInTheDocument();
  });

  it('renders avatar fallback with first letter', () => {
    renderRow({ partner: makePartner({ name: 'Notion', logoUrl: null }) });
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  it('renders avatar fallback even when logoUrl is provided (jsdom does not fire onLoad)', () => {
    // In jsdom AvatarImage never fires onLoad, so the fallback is always shown.
    // This test verifies the component renders without errors when logoUrl is set.
    renderRow({ partner: makePartner({ logoUrl: 'https://example.com/logo.png', name: 'Brio' }) });
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('calls onClick with partner data when clicked', () => {
    const handleClick = vi.fn();
    const partner = makePartner({ name: 'Click Me' });
    renderRow({ partner, onClick: handleClick });

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledOnce();
    expect(handleClick).toHaveBeenCalledWith(partner);
  });

  it('does not throw when clicked without onClick handler', () => {
    renderRow();
    expect(() => fireEvent.click(screen.getByText('Brio Tech'))).not.toThrow();
  });

  describe('isActive', () => {
    it('applies active styles when true', () => {
      const { container } = renderRow({ onClick: vi.fn(), isActive: true });
      const row = container.firstElementChild as HTMLElement;
      expect(row.className).toContain('bg-card');
      expect(row.className).toContain('rounded-xl');
    });

    it('does not apply active styles when false', () => {
      const { container } = renderRow({ onClick: vi.fn(), isActive: false });
      const row = container.firstElementChild as HTMLElement;
      expect(row.className).not.toMatch(/(?<!\S)bg-card(?!\S)/);
    });
  });

  describe('keyboard interaction', () => {
    it('has tabIndex 0 when onClick is provided', () => {
      const { container } = renderRow({ onClick: vi.fn() });
      const row = container.firstElementChild as HTMLElement;
      expect(row).toHaveAttribute('tabindex', '0');
    });

    it('has no tabIndex when onClick is absent', () => {
      const { container } = renderRow();
      const row = container.firstElementChild as HTMLElement;
      expect(row).not.toHaveAttribute('tabindex');
    });

    it('triggers onClick on Enter key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = renderRow({ onClick });
      const row = container.firstElementChild as HTMLElement;

      row.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('triggers onClick on Space key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = renderRow({ onClick });
      const row = container.firstElementChild as HTMLElement;

      row.focus();
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not trigger onClick on other keys', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = renderRow({ onClick });
      const row = container.firstElementChild as HTMLElement;

      row.focus();
      await user.keyboard('{ArrowDown}');
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('ref', () => {
    it('attaches the ref to the root element', () => {
      const ref = vi.fn();
      renderRow({ ref });
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });
});

describe('PartnerRowSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<PartnerRowSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains animated pulse placeholders', () => {
    const { container } = render(<PartnerRowSkeleton />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });
});
