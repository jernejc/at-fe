import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CompanyRow, CompanyRowSkeleton } from './CompanyRow';
import type { CompanyRowData } from '@/lib/schemas';

/** Minimal valid company fixture. */
function makeCompany(overrides: Partial<CompanyRowData> = {}): CompanyRowData {
  return {
    id: 1,
    name: 'Acme Corp',
    domain: 'acme.com',
    status: 'default',
    ...overrides,
  };
}

function renderRow(props: Partial<React.ComponentProps<typeof CompanyRow>> = {}) {
  const company = props.company ?? makeCompany();
  return render(<CompanyRow company={company} {...props} />);
}

describe('CompanyRow', () => {
  it('renders the company name', () => {
    renderRow({ company: makeCompany({ name: 'Recursion' }) });
    expect(screen.getByText('Recursion')).toBeInTheDocument();
  });

  it('renders the domain', () => {
    renderRow({ company: makeCompany({ domain: 'recursion.com' }) });
    expect(screen.getByText('recursion.com')).toBeInTheDocument();
  });

  it('shows normalised fit score (0-1 → 0-100)', () => {
    renderRow({ company: makeCompany({ fit_score: 0.9 }) });
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('hides fit score when null', () => {
    renderRow({ company: makeCompany({ fit_score: null }) });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('displays location when provided', () => {
    renderRow({ company: makeCompany({ hq_country: 'United States' }) });
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('hides location when not provided', () => {
    renderRow({ company: makeCompany({ hq_country: undefined }) });
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
  });

  it('displays formatted employee count', () => {
    renderRow({ company: makeCompany({ employee_count: 8000 }) });
    expect(screen.getByText('8.0K')).toBeInTheDocument();
  });

  it('hides employee count when null', () => {
    renderRow({ company: makeCompany({ employee_count: null }) });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows formatted revenue when provided', () => {
    renderRow({ company: makeCompany({ revenue: 15000 }) });
    expect(screen.getByText('$15.0K')).toBeInTheDocument();
  });

  it('shows dash when revenue is null', () => {
    renderRow({ company: makeCompany({ revenue: null }) });
    expect(screen.getByText('\u2013')).toBeInTheDocument();
  });

  it('shows partner name when provided', () => {
    renderRow({ company: makeCompany({ partner_name: 'Brio Tech' }) });
    expect(screen.getByText('Brio Tech')).toBeInTheDocument();
  });

  it('shows "Unassigned" when partner is absent', () => {
    renderRow({ company: makeCompany({ partner_name: undefined }) });
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('renders partner avatar fallback with first letter', () => {
    renderRow({ company: makeCompany({ partner_name: 'Brio Tech' }) });
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders company avatar fallback with first letter', () => {
    renderRow({ company: makeCompany({ name: 'Notion' }) });
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  it('calls onClick with company data when clicked', () => {
    const handleClick = vi.fn();
    const company = makeCompany({ name: 'Click Me' });
    renderRow({ company, onClick: handleClick });

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledOnce();
    expect(handleClick).toHaveBeenCalledWith(company);
  });

  it('does not throw when clicked without onClick handler', () => {
    renderRow();
    expect(() => fireEvent.click(screen.getByText('Acme Corp'))).not.toThrow();
  });

  it('renders status indicator with correct aria-label', () => {
    renderRow({ company: makeCompany({ status: 'closed_won' }) });
    expect(screen.getByLabelText('Company status: closed won')).toBeInTheDocument();
  });
});

describe('CompanyRowSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CompanyRowSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains animated pulse placeholders', () => {
    const { container } = render(<CompanyRowSkeleton />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });
});
