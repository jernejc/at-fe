'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Technology } from '@/lib/schemas';
import { SearchField } from '@/components/ui/search-field';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  useTechStackList,
  getRecencyBucket,
  getWeightClass,
  type TechSortMode,
} from './useTechStackList';

interface TechStackListProps {
  technologies: Technology[];
}

const GRID_CLASS =
  'grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] -mt-px -ml-px';

/**
 * Shared "Tech Stack" section: title above a bordered table container with a
 * header row (sort tabs + search) and a scrollable body that renders an
 * auto-fit grid of keywords with grid lines between cells.
 */
export function TechStackList({ technologies }: TechStackListProps) {
  const { search, setSearch, sort, setSort, filteredCount, flat, groups } =
    useTechStackList(technologies);

  return (
    <section>
      <h3 className="text-base font-medium text-foreground mb-3">Tech Stack</h3>

      <div className="rounded-md border border-border overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-muted/30">
          <Tabs value={sort} onValueChange={(v) => setSort(v as TechSortMode)}>
            <TabsList size="sm">
              <TabsTrigger value="name">by Name</TabsTrigger>
              <TabsTrigger value="recency">by Recency</TabsTrigger>
            </TabsList>
          </Tabs>
          <SearchField
            value={search}
            size="sm"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords..."
            className="w-56"
          />
        </div>

        <div className="border-t border-border max-h-96 overflow-y-auto">
          {filteredCount === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-4">
              No technologies match your search.
            </p>
          ) : sort === 'recency' ? (
            <div className={GRID_CLASS}>
              {groups.map((group) => (
                <GroupSection key={group.bucket} label={group.label} items={group.items} />
              ))}
            </div>
          ) : (
            <div className={GRID_CLASS}>
              {flat.map((t, i) => (
                <TechItem key={`${t.technology}-${i}`} tech={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GroupSection({ label, items }: { label: string; items: Technology[] }) {
  return (
    <>
      <h4 className="col-span-full sticky top-0 z-10 border-t border-b border-border bg-muted px-3 py-1.5 text-xs uppercase tracking-wide first:border-t-0">
        {label}
      </h4>
      {items.map((t, i) => (
        <TechItem key={`${label}-${t.technology}-${i}`} tech={t} />
      ))}
    </>
  );
}

function TechItem({ tech }: { tech: Technology }) {
  const bucket = getRecencyBucket(tech.lastVerifiedAt);
  const weight = getWeightClass(bucket);
  const tooltip = tech.lastVerifiedAt
    ? `Last verified ${format(new Date(tech.lastVerifiedAt), 'PPP')}`
    : 'Verification date unknown';

  return (
    <div className="px-3 py-2">
      <Tooltip>
        <TooltipTrigger
          render={<span className={cn('text-xs text-foreground cursor-default', weight)} />}
        >
          {tech.technology}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}
