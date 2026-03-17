'use client';

import { useState, useCallback } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Building2, Download, Loader2 } from 'lucide-react';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import type { CompanyRowMetric } from '@/components/campaigns/CompanyRow';
import { Separator } from '@/components/ui/separator';
import { SelectToggle } from '@/components/ui/select-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DiscoveryToolbar } from './DiscoveryToolbar';
import type { CompanyRowData } from '@/lib/schemas';
import type { UseDiscoveryCompaniesReturn } from './useDiscoveryCompanies';

/** Metrics shown when a product filter is active (fit scores available). */
const METRICS_WITH_FIT: CompanyRowMetric[] = ['fit', 'location', 'size'];
/** Metrics shown without a product filter (no fit scores). */
const METRICS_WITHOUT_FIT: CompanyRowMetric[] = ['location', 'size'];

interface DiscoveryViewProps extends UseDiscoveryCompaniesReturn {
  /** Handler when a company row is clicked. */
  onCompanyClick?: (company: CompanyRowData) => void;
  /** Whether bulk-edit mode is active. */
  isEditing: boolean;
  /** Set of selected company IDs in edit mode. */
  selectedIds: Set<number>;
  /** Number of selected companies. */
  selectedCount: number;
  /** Toggle selection for a company (pass shiftKey for range). */
  onToggleSelect: (id: number, shiftKey: boolean, companies: CompanyRowData[]) => void;
  /** Toggle all visible companies. */
  onToggleSelectAll: (companies: CompanyRowData[]) => void;
  /** Whether all visible companies are selected. */
  isAllSelected: boolean;
  /** Whether some but not all visible companies are selected. */
  isPartiallySelected: boolean;
  /** Enter edit mode. */
  onStartEditing: () => void;
  /** Cancel edit mode. */
  onCancelEditing: () => void;
  /** Create a new campaign with selected companies. */
  onNewCampaign: () => void;
  /** Add selected companies to an existing campaign. */
  onAddToExisting: () => void;
}

/** Renders the discovery companies list with toolbar, rows, and empty state. */
export function DiscoveryView({
  companies,
  totalCount,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  filterDefinitions,
  activeFilters,
  setActiveFilters,
  sortOptions,
  activeSort,
  setActiveSort,
  isExporting,
  handleExport,
  onCompanyClick,
  isEditing,
  selectedIds,
  selectedCount,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
  isPartiallySelected,
  onStartEditing,
  onCancelEditing,
  onNewCampaign,
  onAddToExisting,
}: DiscoveryViewProps) {
  const hasProductFilter = activeFilters.some((f) => f.key === 'product');
  const visibleMetrics = hasProductFilter ? METRICS_WITH_FIT : METRICS_WITHOUT_FIT;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {!loading && totalCount > 0
            ? `${totalCount.toLocaleString()} companies`
            : 'Companies'}
        </h1>
        {hasProductFilter && (
          <ExportDropdown isExporting={isExporting} onExport={handleExport} />
        )}
      </div>

      <DiscoveryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterDefinitions={filterDefinitions}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        isEditing={isEditing}
        selectedCount={selectedCount}
        onStartEditing={onStartEditing}
        onCancelEditing={onCancelEditing}
        onNewCampaign={onNewCampaign}
        onAddToExisting={onAddToExisting}
      />

      {loading ? (
        <CompaniesListSkeleton showFit={hasProductFilter} />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : companies.length === 0 ? (
        <CompaniesEmptyState hasFilters={activeFilters.length > 0 || searchQuery.length > 0} />
      ) : (
        <div className="flex flex-col">
          <TableHeader
            isEditing={isEditing}
            isAllSelected={isAllSelected}
            isPartiallySelected={isPartiallySelected}
            onToggleSelectAll={() => onToggleSelectAll(companies)}
            showFit={hasProductFilter}
          />
          <Separator />
          {companies.map((company) => (
            <div key={company.id}>
              <CompanyRow
                company={company}
                className="-mx-5"
                hideStatus
                visibleMetrics={visibleMetrics}
                onClick={isEditing ? undefined : onCompanyClick}
                selectable={isEditing}
                selected={selectedIds.has(company.id)}
                onSelect={(e) => onToggleSelect(company.id, e.shiftKey, companies)}
              />
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MAX_EXPORT_LIMIT = 5000;

interface ExportDropdownProps {
  isExporting: boolean;
  onExport: (limit: number) => Promise<void>;
}

/** Popover dropdown that lets users choose how many companies to export. */
function ExportDropdown({ isExporting, onExport }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(100);

  const handleExport = useCallback(() => {
    const clamped = Math.min(Math.max(1, limit), MAX_EXPORT_LIMIT);
    setOpen(false);
    onExport(clamped);
  }, [limit, onExport]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button variant="outline" disabled={isExporting}>
            {isExporting
              ? <Loader2 className="w-4 h-4 animate-spin" data-icon="inline-start" />
              : <Download className="w-4 h-4" data-icon="inline-start" />}
            Export
          </Button>
        }
      />
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={4}>
          <Popover.Popup
            className="bg-popover text-popover-foreground ring-foreground/10 rounded-lg shadow-md ring-1 p-3 pl-5 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100 z-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Export top</span>
              <Input
                type="number"
                min={1}
                max={MAX_EXPORT_LIMIT}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">companies</span>
              <Button size="icon" onClick={handleExport}>
                <Download className="w-4 h-4" data-icon="inline-start" />
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface TableHeaderProps {
  isEditing: boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onToggleSelectAll: () => void;
  showFit: boolean;
}

/** Column headers matching the CompanyRow layout with discovery-specific metrics. */
function TableHeader({ isEditing, isAllSelected, isPartiallySelected, onToggleSelectAll, showFit }: TableHeaderProps) {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      {isEditing && (
        <SelectToggle
          checked={isAllSelected}
          indeterminate={isPartiallySelected}
          onChange={onToggleSelectAll}
        />
      )}
      {/* Spacer for avatar */}
      <div className="w-8 shrink-0" />
      {/* Company name column */}
      <div className="flex-1 min-w-0">Company</div>
      {/* Right-side metric columns (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        {showFit && <span className="w-18">Fit</span>}
        <span className="w-30">Location</span>
        <span className="w-16">Size</span>
      </div>
    </div>
  );
}

function CompaniesListSkeleton({ showFit }: { showFit: boolean }) {
  const metrics = showFit ? METRICS_WITH_FIT : METRICS_WITHOUT_FIT;
  return (
    <div className="flex flex-col">
      <TableHeader isEditing={false} isAllSelected={false} isPartiallySelected={false} onToggleSelectAll={() => { }} showFit={showFit} />
      <Separator />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i}>
          <div className='-mx-5'>
            <CompanyRowSkeleton hideStatus visibleMetrics={metrics} />
          </div>
          <Separator />
        </div>
      ))}
    </div>
  );
}

function CompaniesEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Building2 className="size-10 text-muted-foreground/50" />
      <div>
        <p className="text-sm font-medium text-foreground">
          {hasFilters ? 'No matching accounts' : 'No accounts found'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {hasFilters
            ? 'Try adjusting your search or filters.'
            : 'Accounts will appear here once data is available.'}
        </p>
      </div>
    </div>
  );
}
