'use client';

import {
  ExpandableCard,
  ExpandableCardDetails,
  ExpandableCardHeader,
} from '@/components/ui/expandable-card';

/** ExpandableCard showcase with multiple variants. */
export function ExpandableCardSection() {
  return (
    <section id="expandable-cards" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Expandable Card</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Card with collapsible details section. Click to expand, use footer to collapse.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Basic expandable */}
        <ExpandableCard>
          <ExpandableCardHeader>
            <h3 className="font-medium">Basic Expandable</h3>
            <p className="text-sm text-muted-foreground">Click anywhere to expand</p>
          </ExpandableCardHeader>
          <ExpandableCardDetails>
            <p className="text-muted-foreground">
              This is the hidden details section. It animates open with a spring transition.
              Click &ldquo;Collapse&rdquo; in the footer to close.
            </p>
          </ExpandableCardDetails>
        </ExpandableCard>

        {/* Default expanded */}
        <ExpandableCard defaultExpanded>
          <ExpandableCardHeader>
            <h3 className="font-medium">Default Expanded</h3>
            <p className="text-sm text-muted-foreground">Starts open via defaultExpanded prop</p>
          </ExpandableCardHeader>
          <ExpandableCardDetails>
            <p className="text-muted-foreground">
              This card started expanded. Use the footer to collapse it.
            </p>
          </ExpandableCardDetails>
        </ExpandableCard>

        {/* No details — static card */}
        <ExpandableCard>
          <ExpandableCardHeader>
            <h3 className="font-medium">Static Card</h3>
            <p className="text-sm text-muted-foreground">No details section — no footer, no hover</p>
          </ExpandableCardHeader>
        </ExpandableCard>

        {/* Rich content */}
        <ExpandableCard>
          <ExpandableCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <span className="font-bold text-primary">A</span>
              </div>
              <div>
                <h3 className="font-medium">Rich Header</h3>
                <p className="text-xs text-muted-foreground">With icon and metadata</p>
              </div>
            </div>
          </ExpandableCardHeader>
          <ExpandableCardDetails>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Details can contain any content including lists, tables, or nested components.
              </p>
              <div className="flex gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs">Tag 1</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs">Tag 2</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs">Tag 3</span>
              </div>
            </div>
          </ExpandableCardDetails>
        </ExpandableCard>
      </div>
    </section>
  );
}
