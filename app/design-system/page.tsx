'use client';

import { Separator } from '@/components/ui/separator';
import { TypographySection } from './_sections/typography-section';
import { ColorSection } from './_sections/color-section';
import { ButtonSection } from './_sections/button-section';
import { BadgeSection } from './_sections/badge-section';
import { InputSection } from './_sections/input-section';
import { CardSection } from './_sections/card-section';
import { ExpandableCardSection } from './_sections/expandable-card-section';
import { DataDisplaySection } from './_sections/data-display-section';
import { OverlaySection } from './_sections/overlay-section';
import { CustomSection } from './_sections/custom-section';
import { CampaignInputSection } from './_sections/campaign-input-section';
import { RangeFilterSection } from './_sections/range-filter-section';
import { NotificationSection } from './_sections/notification-section';

const navItems = [
  { id: 'typography', label: 'Typography' },
  { id: 'colors', label: 'Colors' },
  { id: 'buttons', label: 'Button' },
  { id: 'badges', label: 'Badge' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'cards', label: 'Card' },
  { id: 'expandable-cards', label: 'Expandable Card' },
  { id: 'data-display', label: 'Data Display' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'custom', label: 'Custom' },
  { id: 'campaign-input', label: 'Campaign Input' },
  { id: 'range-filter', label: 'Range Filter' },
  { id: 'notifications', label: 'Notifications' },
];

/** Internal design system showcase page. */
export default function DesignSystemPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar TOC */}
      <nav className="hidden lg:flex w-52 shrink-0 flex-col gap-1 border-r-[0.5px] border-border-d p-4 overflow-y-auto">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Design System
        </h2>
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Design System
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Component reference and visual guide for LookAcross Account
              Intelligence.
            </p>
          </div>

          <Separator />
          <TypographySection />
          <Separator />
          <ColorSection />
          <Separator />
          <ButtonSection />
          <Separator />
          <BadgeSection />
          <Separator />
          <InputSection />
          <Separator />
          <CardSection />
          <Separator />
          <ExpandableCardSection />
          <Separator />
          <DataDisplaySection />
          <Separator />
          <OverlaySection />
          <Separator />
          <CustomSection />
          <Separator />
          <CampaignInputSection />
          <Separator />
          <RangeFilterSection />
          <Separator />
          <NotificationSection />
        </div>
      </main>
    </div>
  );
}
