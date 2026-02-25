'use client';

import { Plus, Coffee, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/ui/search-field';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import { Pagination } from '@/components/ui/pagination';
import { CampaignRow, CampaignRowSkeleton } from './CampaignRow';
import { useCampaignsList, FILTER_DEFINITIONS, SORT_OPTIONS } from './useCampaignsList';
import { Separator } from '../ui/separator';

/** Campaign list page with search, filters, sort, and pagination. */
export function CampaignsList() {
  const {
    paginatedRows,
    totalFiltered,
    loading,
    error,
    hasNoCampaigns,
    hasNoResults,
    search,
    filters,
    sort,
    currentPage,
    pageSize,
    handleSearchChange,
    handleFiltersChange,
    handleSortChange,
    handleNewCampaign,
    handleRowClick,
    handlePageChange,
  } = useCampaignsList();

  return (
    <div className="flex flex-col flex-1 gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your outreach campaigns and track performance
          </p>
        </div>
        <Button variant="secondary" onClick={handleNewCampaign} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          New campaign
        </Button>
      </div>

      {/* Dashboard metrics placeholder */}
      {/* TODO: Replace with CampaignMetricsCard component */}
      <div className="h-32 rounded-xl border border-border bg-card" />

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <SearchField
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange('')}
          placeholder="Search by name"
          className="w-44"
        />
        <Filter
          definitions={FILTER_DEFINITIONS}
          value={filters}
          onValueChange={handleFiltersChange}
        />
        <Sort
          options={SORT_OPTIONS}
          value={sort}
          onValueChange={handleSortChange}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col">
          <TableHeader />
          {Array.from({ length: 5 }, (_, i) => (
            <CampaignRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-lg font-semibold text-foreground/80">{error}</p>
          <Button onClick={() => window.location.reload()} variant="secondary">
            Retry
          </Button>
        </div>
      ) : hasNoCampaigns ? (
        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
          <Coffee size={48} strokeWidth={1.5} className="mb-5 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No campaigns found
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Get started by creating your first campaign
          </p>
          <Button onClick={handleNewCampaign} variant="secondary" size="lg">
            Create Campaign
          </Button>
        </div>
      ) : hasNoResults ? (
        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
          <SearchX size={48} strokeWidth={1.5} className="mb-5 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No matches
          </h2>
          <p className="text-sm text-muted-foreground">
            No campaigns match your search or filters
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          <TableHeader />
          <Separator />
          {paginatedRows.map((row) => (
            <div key={row.id}>
              <CampaignRow
                campaign={row}
                onClick={handleRowClick}
                className='-mx-5'
              />
              <Separator />
            </div>
          ))}
          <Pagination
            currentPage={currentPage}
            totalCount={totalFiltered}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

/** Column headers matching the CampaignRow right-side metrics layout. */
function TableHeader() {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      {/* Spacer for icon column */}
      <div className="w-8 shrink-0" />
      {/* Campaign name column */}
      <div className="flex-1 min-w-0">Campaign</div>
      {/* Right-side metric columns (hidden on mobile, matching CampaignRow) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span>Avg. fit</span>
        <span className="w-28">Progress</span>
        <span className="w-14">Conversion</span>
        <span className="w-14">Total won</span>
      </div>
    </div>
  );
}
