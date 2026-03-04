'use client';

import { cn } from '@/lib/utils';
import type { ResultsTab } from '../useNewCampaignFlow.types';

interface MobileTabSelectorProps {
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
}

const tabs: { value: ResultsTab; label: string }[] = [
  { value: 'metrics', label: 'Metrics' },
  { value: 'companies', label: 'Companies' },
];

/** Tab bar shown on mobile to switch between filters and company list. */
export function MobileTabSelector({ activeTab, onTabChange }: MobileTabSelectorProps) {
  return (
    <div className="flex border-b border-border lg:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium text-center transition-colors',
            activeTab === tab.value
              ? 'text-foreground border-b-2 border-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
