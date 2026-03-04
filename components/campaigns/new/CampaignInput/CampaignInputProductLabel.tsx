'use client';

import { cn } from '@/lib/utils';

interface CampaignInputProductLabelProps {
  productName: string | null;
  isProductGridOpen: boolean;
  onToggle: () => void;
}

/** Clickable product name label below the input field. */
export function CampaignInputProductLabel({
  productName,
  isProductGridOpen,
  onToggle,
}: CampaignInputProductLabelProps) {
  const label = productName ?? 'Select a product for the campaign';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'block w-full text-left pl-12 pr-4 pb-3 text-xs font-medium text-primary',
        'hover:underline cursor-pointer',
        isProductGridOpen && 'underline'
      )}
    >
      {label}
    </button>
  );
}
