import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Mock framer-motion so AnimatePresence exit animations complete synchronously in jsdom
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.ComponentProps<'div'>) => {
        const rest = Object.fromEntries(
          Object.entries(props).filter(([k]) => !['initial', 'animate', 'exit', 'transition'].includes(k)),
        );
        return <div {...rest}>{children}</div>;
      },
    },
  };
});

import {
  ExpandableCard,
  ExpandableCardDetails,
  ExpandableCardHeader,
} from './expandable-card';

/** Helper to render an expandable card with header + details. */
function renderExpandable(props: React.ComponentProps<typeof ExpandableCard> = {}) {
  return render(
    <ExpandableCard {...props}>
      <ExpandableCardHeader>Header content</ExpandableCardHeader>
      <ExpandableCardDetails>Details content</ExpandableCardDetails>
    </ExpandableCard>,
  );
}

/** Helper to render a static card (no details). */
function renderStatic() {
  return render(
    <ExpandableCard>
      <ExpandableCardHeader>Static header</ExpandableCardHeader>
    </ExpandableCard>,
  );
}

describe('ExpandableCard', () => {
  it('renders header content', () => {
    renderExpandable();
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('does not render a footer when there is no details section', () => {
    const { container } = renderStatic();
    expect(container.querySelector('[data-slot="expandable-card-footer"]')).not.toBeInTheDocument();
  });

  it('renders a footer when details section is present', () => {
    const { container } = renderExpandable();
    expect(container.querySelector('[data-slot="expandable-card-footer"]')).toBeInTheDocument();
  });

  it('hides details content by default', () => {
    renderExpandable();
    expect(screen.queryByText('Details content')).not.toBeInTheDocument();
  });

  it('expands details when clicking the card', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    await user.click(card);

    expect(await screen.findByText('Details content')).toBeInTheDocument();
  });

  it('expands details when clicking the footer chevron', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const footer = container.querySelector('[data-slot="expandable-card-footer"]') as HTMLElement;

    await user.click(footer);

    expect(await screen.findByText('Details content')).toBeInTheDocument();
  });

  it('does not collapse when clicking the card body while expanded', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    // Expand first
    await user.click(card);
    expect(await screen.findByText('Details content')).toBeInTheDocument();

    // Click the header area (not the footer) — should NOT collapse
    await user.click(screen.getByText('Header content'));

    expect(screen.getByText('Details content')).toBeInTheDocument();
  });

  it('collapses when clicking the collapse button in footer', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    // Expand
    await user.click(card);
    expect(await screen.findByText('Details content')).toBeInTheDocument();

    // Click Collapse
    await user.click(screen.getByText('Collapse'));

    expect(screen.queryByText('Details content')).not.toBeInTheDocument();
  });

  it('shows "Collapse" text in footer when expanded', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    await user.click(card);

    expect(await screen.findByText('Collapse')).toBeInTheDocument();
  });

  it('has cursor-pointer class when collapsed with details', () => {
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('removes cursor-pointer when expanded', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    await user.click(card);
    await screen.findByText('Details content');

    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('starts expanded when defaultExpanded is true', () => {
    renderExpandable({ defaultExpanded: true });
    expect(screen.getByText('Details content')).toBeInTheDocument();
  });

  it('calls onExpandedChange when expanding', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderExpandable({ onExpandedChange: onChange });
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    await user.click(card);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onExpandedChange when collapsing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderExpandable({ defaultExpanded: true, onExpandedChange: onChange });
    const footer = container.querySelector('[data-slot="expandable-card-footer"]') as HTMLElement;

    await user.click(footer);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('supports controlled expanded state', () => {
    const { rerender } = render(
      <ExpandableCard expanded={true}>
        <ExpandableCardHeader>Header</ExpandableCardHeader>
        <ExpandableCardDetails>Controlled details</ExpandableCardDetails>
      </ExpandableCard>,
    );

    expect(screen.getByText('Controlled details')).toBeInTheDocument();

    rerender(
      <ExpandableCard expanded={false}>
        <ExpandableCardHeader>Header</ExpandableCardHeader>
        <ExpandableCardDetails>Controlled details</ExpandableCardDetails>
      </ExpandableCard>,
    );

    expect(screen.queryByText('Controlled details')).not.toBeInTheDocument();
  });

  it('applies custom className to the root', () => {
    const { container } = renderExpandable({ className: 'my-custom-class' });
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    expect(card).toHaveClass('my-custom-class');
  });

  it('sets data-expanded attribute when expanded', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    expect(card).not.toHaveAttribute('data-expanded');

    await user.click(card);
    await screen.findByText('Details content');

    expect(card).toHaveAttribute('data-expanded', 'true');
  });

  it('sets aria-expanded attribute when collapsible', async () => {
    const user = userEvent.setup();
    const { container } = renderExpandable();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;

    expect(card).toHaveAttribute('aria-expanded', 'false');

    await user.click(card);
    await screen.findByText('Details content');

    expect(card).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not set aria-expanded on a static card', () => {
    const { container } = renderStatic();
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    expect(card).not.toHaveAttribute('aria-expanded');
  });
});
