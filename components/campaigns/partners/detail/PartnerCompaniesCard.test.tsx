import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PartnerCompaniesCard } from './PartnerCompaniesCard';
import type { CompanyRowData } from '@/lib/schemas';
import type { PartnerAssignmentSummary } from '@/lib/schemas/partner';

function makeCompany(overrides: Partial<CompanyRowData> = {}): CompanyRowData {
  return {
    id: 1,
    name: 'Acme Corp',
    domain: 'acme.com',
    status: 'default',
    fit_score: 0.8,
    hq_country: 'US',
    employee_count: 500,
    ...overrides,
  };
}

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
    in_progress_count: 0,
    completed_count: 0,
    task_completion_pct: 0,
    role_in_campaign: null,
    assigned_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultCompanies = [
  makeCompany({ id: 1, name: 'Acme Corp', domain: 'acme.com' }),
  makeCompany({ id: 2, name: 'Beta Inc', domain: 'beta.io' }),
  makeCompany({ id: 3, name: 'Gamma Ltd', domain: 'gamma.dev' }),
];

const currentPartner = makePartner({ partner_id: 10, partner_name: 'Brio Tech' });
const otherPartner = makePartner({ id: 2, partner_id: 20, partner_name: 'Acme Partners' });

const defaultProps = {
  companies: defaultCompanies,
  loading: false,
  currentPartnerId: 10,
  allPartners: [currentPartner, otherPartner],
  reassigning: false,
  onReassign: vi.fn(),
};

describe('PartnerCompaniesCard', () => {
  it('renders company count badge', () => {
    render(<PartnerCompaniesCard {...defaultProps} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    const { container } = render(<PartnerCompaniesCard {...defaultProps} loading={true} />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('does not show count badge when loading', () => {
    render(<PartnerCompaniesCard {...defaultProps} loading={true} />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('shows empty state when no companies', () => {
    render(<PartnerCompaniesCard {...defaultProps} companies={[]} />);
    expect(screen.getByText('No companies assigned to this partner.')).toBeInTheDocument();
  });

  it('renders company rows for each company', () => {
    render(<PartnerCompaniesCard {...defaultProps} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
    expect(screen.getByText('Gamma Ltd')).toBeInTheDocument();
  });

  it('shows Reassign button when other partners exist', () => {
    render(<PartnerCompaniesCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Reassign' })).toBeInTheDocument();
  });

  it('hides Reassign button when no other partners exist', () => {
    render(<PartnerCompaniesCard {...defaultProps} allPartners={[currentPartner]} />);
    expect(screen.queryByRole('button', { name: 'Reassign' })).not.toBeInTheDocument();
  });

  it('disables Reassign button when no companies', () => {
    render(<PartnerCompaniesCard {...defaultProps} companies={[]} />);
    const btn = screen.getByRole('button', { name: 'Reassign' });
    expect(btn).toBeDisabled();
  });

  describe('edit mode', () => {
    it('entering edit mode shows select-all and cancel', async () => {
      const user = userEvent.setup();
      render(<PartnerCompaniesCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Reassign' }));

      expect(screen.getByText('Select all')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('shows selected count in edit mode', async () => {
      const user = userEvent.setup();
      render(<PartnerCompaniesCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Reassign' }));

      expect(screen.getByText('0 selected')).toBeInTheDocument();
    });

    it('exiting edit mode via Cancel returns to normal view', async () => {
      const user = userEvent.setup();
      render(<PartnerCompaniesCard {...defaultProps} />);

      // Enter edit mode
      await user.click(screen.getByRole('button', { name: 'Reassign' }));
      expect(screen.getByText('Select all')).toBeInTheDocument();

      // Exit edit mode
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByText('Select all')).not.toBeInTheDocument();
    });
  });
});
