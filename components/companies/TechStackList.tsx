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
import { Separator } from '../ui/separator';

interface TechStackListProps {
  technologies: Technology[];
}

const GRID_CLASS =
  'grid grid-cols-[repeat(auto-fill,minmax(10rem,max-content))] gap-x-4 gap-y-4';

/**
 * Shared "Tech Stack" section: header with title + search + sort segmented control,
 * auto-fit grid of keywords with font weight based on `lastVerifiedAt` recency,
 * and group headers when sorted by recency.
 */
export function TechStackList({ technologies }: TechStackListProps) {
  const { search, setSearch, sort, setSort, filteredCount, flat, groups } =
    useTechStackList(technologies);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="text-base font-medium text-foreground">
          Tech Stack
        </h3>
        <div className='flex-1'>
          <Tabs
            value={sort}
            onValueChange={(v) => setSort(v as TechSortMode)}
          >
            <TabsList size="sm">
              <TabsTrigger value="name">by Name</TabsTrigger>
              <TabsTrigger value="recency">by Recency</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <SearchField
          value={search}
          size="sm"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search keywords..."
          className="w-56"
        />
      </div>

      {filteredCount === 0 ? (
        <p className="text-sm text-muted-foreground">No technologies match your search.</p>
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
    </section>
  );
}

function GroupSection({ label, items }: { label: string; items: Technology[] }) {
  return (
    <>
      <h4 className="col-span-full text-xs uppercase tracking-wide mt-6 first:mt-2">
        {label}
      </h4>
      <Separator className="col-span-full mb-4" />
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
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn('text-xs text-foreground cursor-default', weight)} />}
      >
        {tech.technology}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
