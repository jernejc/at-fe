import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { PlaybookContactResponse } from '@/lib/schemas';

// Mock framer-motion for ExpandableCard animations
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

import { ContactsCard } from './ContactsCard';

function makeContact(overrides: Partial<PlaybookContactResponse> = {}): PlaybookContactResponse {
  return {
    id: 1,
    employee_id: null,
    name: 'Jane Doe',
    title: 'VP of Engineering',
    role_category: 'Engineering',
    value_prop: null,
    fit_score: 0.85,
    fit_urgency: null,
    fit_reasoning: null,
    linkedin_url: 'https://linkedin.com/in/janedoe',
    email: null,
    phone: null,
    priority_rank: 1,
    priority_reasoning: null,
    preferred_channel: null,
    channel_sequence: null,
    approach_notes: null,
    persona_type: null,
    persona_types: null,
    persona_confidence: null,
    committee_role: null,
    fit_assessment: null,
    outreach_templates: [],
    ...overrides,
  };
}

describe('ContactsCard', () => {
  it('renders nothing when contacts array is empty and not loading', () => {
    const { container } = render(<ContactsCard contacts={[]} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders skeleton when loading', () => {
    const { container } = render(<ContactsCard contacts={[]} loading={true} />);
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('renders contact names and titles', () => {
    const contacts = [
      makeContact({ id: 1, name: 'Jane Doe', title: 'VP Engineering' }),
      makeContact({ id: 2, name: 'John Smith', title: 'CTO' }),
    ];
    render(<ContactsCard contacts={contacts} loading={false} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('VP Engineering')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
  });

  it('shows total contact count', () => {
    const contacts = [
      makeContact({ id: 1 }),
      makeContact({ id: 2 }),
    ];
    render(<ContactsCard contacts={contacts} loading={false} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('sorts contacts by priority_rank ascending', () => {
    const contacts = [
      makeContact({ id: 1, name: 'Low Priority', priority_rank: 3 }),
      makeContact({ id: 2, name: 'High Priority', priority_rank: 1 }),
      makeContact({ id: 3, name: 'Mid Priority', priority_rank: 2 }),
    ];
    render(<ContactsCard contacts={contacts} loading={false} />);

    const names = screen.getAllByText(/Priority/).map((el) => el.textContent);
    expect(names).toEqual(['High Priority', 'Mid Priority', 'Low Priority']);
  });

  it('treats null priority_rank as lowest priority', () => {
    const contacts = [
      makeContact({ id: 1, name: 'No Rank', priority_rank: null }),
      makeContact({ id: 2, name: 'Ranked', priority_rank: 1 }),
    ];
    render(<ContactsCard contacts={contacts} loading={false} />);

    const names = screen.getAllByText(/Rank/).map((el) => el.textContent);
    expect(names).toEqual(['Ranked', 'No Rank']);
  });

  it('shows first 3 contacts in preview and rest in expandable section', async () => {
    const user = userEvent.setup();
    const contacts = Array.from({ length: 5 }, (_, i) =>
      makeContact({ id: i + 1, name: `Contact ${i + 1}`, priority_rank: i + 1 }),
    );
    const { container } = render(<ContactsCard contacts={contacts} loading={false} />);

    // First 3 visible immediately
    expect(screen.getByText('Contact 1')).toBeInTheDocument();
    expect(screen.getByText('Contact 2')).toBeInTheDocument();
    expect(screen.getByText('Contact 3')).toBeInTheDocument();

    // Expand the card to see rest
    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Contact 4')).toBeInTheDocument();
    expect(screen.getByText('Contact 5')).toBeInTheDocument();
  });

  it('does not render expandable section when 3 or fewer contacts', () => {
    const contacts = [
      makeContact({ id: 1 }),
      makeContact({ id: 2 }),
      makeContact({ id: 3 }),
    ];
    const { container } = render(<ContactsCard contacts={contacts} loading={false} />);
    expect(container.querySelector('[data-slot="expandable-card-footer"]')).not.toBeInTheDocument();
  });

  it('opens LinkedIn URL in new tab on contact click', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const contacts = [
      makeContact({ id: 1, name: 'Jane Doe', linkedin_url: 'https://linkedin.com/in/janedoe' }),
    ];
    render(<ContactsCard contacts={contacts} loading={false} />);

    await user.click(screen.getByText('Jane Doe'));

    expect(openSpy).toHaveBeenCalledWith(
      'https://linkedin.com/in/janedoe',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('does not call window.open when contact has no LinkedIn URL', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const contacts = [
      makeContact({ id: 1, name: 'No LinkedIn', linkedin_url: null }),
    ];
    render(<ContactsCard contacts={contacts} loading={false} />);

    await user.click(screen.getByText('No LinkedIn'));

    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
