import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CampaignCompanyDetailSkeleton } from './CampaignCompanyDetailSkeleton';

describe('CampaignCompanyDetailSkeleton', () => {
  it('renders skeleton elements without errors', () => {
    const { container } = render(<CampaignCompanyDetailSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders three card sections', () => {
    const { container } = render(<CampaignCompanyDetailSkeleton />);
    const cards = container.querySelectorAll('.bg-card');
    expect(cards).toHaveLength(3);
  });
});
