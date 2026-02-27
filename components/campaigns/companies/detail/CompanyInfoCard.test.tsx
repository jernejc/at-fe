import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { CompanyRead } from '@/lib/schemas';

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

import { CompanyInfoCard } from './CompanyInfoCard';

function makeCompany(overrides: Partial<CompanyRead> = {}): CompanyRead {
  return {
    id: 1,
    domain: 'acme.com',
    name: 'Acme Corp',
    linkedin_id: null,
    description: 'A leading technology company specializing in cloud solutions.',
    industry: 'Technology',
    category: null,
    specialties: ['Cloud', 'AI', 'Security'],
    technologies: [],
    keywords: [],
    employee_count: 500,
    employee_count_range: '201-500',
    company_type: 'Private',
    founded_year: '2010',
    hq_address: null,
    hq_city: 'San Francisco',
    hq_state: 'CA',
    hq_country: 'US',
    hq_country_code: 'US',
    locations: [],
    website_url: 'https://acme.com',
    emails: [],
    phones: [],
    social_profiles: [],
    ticker: 'ACME',
    stock_exchange: null,
    revenue: '$50M',
    funding_rounds: [],
    rating_overall: null,
    rating_culture: null,
    rating_compensation: null,
    rating_work_life: null,
    rating_career: null,
    rating_management: null,
    reviews_count: null,
    reviews_url: null,
    has_pricing_page: null,
    has_free_trial: null,
    has_demo: null,
    has_api_docs: null,
    has_mobile_app: null,
    logo_url: null,
    logo_base64: null,
    meta_title: null,
    meta_description: null,
    followers_count: null,
    updates: [],
    coresignal_id: null,
    linkedin_source_id: null,
    data_sources: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('CompanyInfoCard', () => {
  it('renders "Company info" heading', () => {
    render(<CompanyInfoCard company={makeCompany()} />);
    expect(screen.getByText('Company info')).toBeInTheDocument();
  });

  it('renders company description', () => {
    render(<CompanyInfoCard company={makeCompany()} />);
    expect(screen.getByText('A leading technology company specializing in cloud solutions.')).toBeInTheDocument();
  });

  it('renders avatar fallback with first letter of company name', () => {
    render(<CompanyInfoCard company={makeCompany()} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows specialties as badges in expanded state', async () => {
    const user = userEvent.setup();
    const { container } = render(<CompanyInfoCard company={makeCompany()} />);

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Cloud')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('renders details grid cells in expanded state', async () => {
    const user = userEvent.setup();
    const { container } = render(<CompanyInfoCard company={makeCompany()} />);

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('201-500')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('ACME')).toBeInTheDocument();
  });

  it('shows em-dash for missing detail values', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CompanyInfoCard company={makeCompany({ industry: null, company_type: null })} />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    await screen.findByText('Industry');
    // em-dash (\u2014) should appear for missing values
    const cells = container.querySelectorAll('.grid > div');
    const industryCell = Array.from(cells).find((c) => c.textContent?.includes('Industry'));
    expect(industryCell?.textContent).toContain('\u2014');
  });

  it('formats headquarters location from city/state/country', async () => {
    const user = userEvent.setup();
    const { container } = render(<CompanyInfoCard company={makeCompany()} />);

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    await screen.findByText('Headquarters');
    expect(screen.getByText('San Francisco, CA, US')).toBeInTheDocument();
  });

  it('does not render expandable section when no extended data', () => {
    const { container } = render(
      <CompanyInfoCard
        company={makeCompany({
          specialties: [],
          industry: null,
          company_type: null,
          employee_count_range: null,
        })}
      />,
    );
    expect(container.querySelector('[data-slot="expandable-card-footer"]')).not.toBeInTheDocument();
  });
});
