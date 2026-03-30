import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PartnerAssignmentSummary } from '@/lib/schemas';

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

import { AssignmentCard } from './AssignmentCard';

function makePartner(overrides: Partial<PartnerAssignmentSummary> = {}): PartnerAssignmentSummary {
  return {
    id: 1,
    partner_id: 10,
    partner_name: 'Brio Tech',
    partner_slug: 'brio-tech',
    partner_description: null,
    partner_website: null,
    partner_type: 'technology',
    partner_logo_url: null,
    partner_capacity: null,
    partner_industries: [],
    partner_status: 'active',
    assigned_count: 5,
    role_in_campaign: null,
    assigned_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultProps = {
  partnerName: 'Brio Tech',
  partnerLogoUrl: null as string | null,
  status: 'in_progress',
  partners: [makePartner(), makePartner({ partner_id: 20, partner_name: 'Alpha Corp' })],
  reassigning: false,
  onReassign: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AssignmentCard', () => {
  it('renders partner name', () => {
    render(<AssignmentCard {...defaultProps} />);
    expect(screen.getByText('Brio Tech')).toBeInTheDocument();
  });

  it('shows "Unassigned" when partnerName is null', () => {
    render(<AssignmentCard {...defaultProps} partnerName={null} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('renders the status badge with formatted text', () => {
    render(<AssignmentCard {...defaultProps} status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('formats closed_won status correctly', () => {
    render(<AssignmentCard {...defaultProps} status="closed_won" />);
    expect(screen.getByText('Closed Won')).toBeInTheDocument();
  });

  it('formats unknown status as Unworked', () => {
    render(<AssignmentCard {...defaultProps} status="some_unknown" />);
    expect(screen.getByText('Unworked')).toBeInTheDocument();
  });

  it('shows "Reassigning..." text while reassigning', () => {
    render(<AssignmentCard {...defaultProps} reassigning={true} />);
    expect(screen.getByText('Reassigning...')).toBeInTheDocument();
  });

  it('disables reassign button when reassigning is true', () => {
    render(<AssignmentCard {...defaultProps} reassigning={true} />);
    const button = screen.getByText('Reassigning...').closest('button');
    expect(button).toBeDisabled();
  });

  it('disables reassign button when partners list is empty', () => {
    render(<AssignmentCard {...defaultProps} partners={[]} />);
    const button = screen.getByText('Reassign').closest('button');
    expect(button).toBeDisabled();
  });

  it('renders the reassign button when not reassigning', () => {
    render(<AssignmentCard {...defaultProps} />);
    expect(screen.getByText('Reassign')).toBeInTheDocument();
  });

  it('calls onReassign with partner_id when partner is selected from dropdown', async () => {
    const user = userEvent.setup();
    const onReassign = vi.fn();
    render(<AssignmentCard {...defaultProps} onReassign={onReassign} />);

    // Open the dropdown menu
    await user.click(screen.getByText('Reassign'));

    // base-ui portals render to document.body — find the item there
    const alphaItem = await screen.findByText('Alpha Corp');
    await user.click(alphaItem);

    expect(onReassign).toHaveBeenCalledWith(20);
  });
});
