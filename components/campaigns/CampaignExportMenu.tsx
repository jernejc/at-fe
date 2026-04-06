'use client';

import { CampaignExportDropdown } from './CampaignExportDropdown';

interface CampaignExportMenuProps {
  slug: string;
  /** Button variant — defaults to "outline". */
  variant?: 'outline' | 'secondary';
}

/** Dropdown menu with options to export campaign companies or contacts. */
export function CampaignExportMenu({ slug, variant = 'outline' }: CampaignExportMenuProps) {
  return <CampaignExportDropdown slug={slug} variant={variant} actions={['companies', 'contacts']} />;
}
