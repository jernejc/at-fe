'use client';

import { Coffee, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/ui/search-field';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import { Pagination } from '@/components/ui/pagination';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { CampaignRow, CampaignRowSkeleton } from '@/components/campaigns/CampaignRow';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { usePartnerCampaignsList, FILTER_DEFINITIONS, SORT_OPTIONS } from './usePartnerCampaignsList';
import { NewOpportunitiesCell } from './NewOpportunitiesCell';

/** Partner campaigns list page with search, filters, sort, dashboard, and pagination. */
export function PartnerCampaignsList() {
  const {
    paginatedRows,
    totalFiltered,
    metrics,
    loading,
    error,
    hasNoCampaigns,
    hasNoResults,
    search,
    filters,
    sort,
    currentPage,
    pageSize,
    newOpportunities,
    newOpportunitiesLoading,
    handleSearchChange,
    handleFiltersChange,
    handleSortChange,
    handleRowClick,
    handlePageChange,
  } = usePartnerCampaignsList();

  return (
    <div className="flex flex-col flex-1 min-w-0 gap-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-semibold tracking-tight text-foreground">
          Campaigns
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your campaign assignments and engagement
        </p>
      </div>

      {/* Dashboard metrics */}
      <Dashboard className="grid-rows-2">
        {/* Left half: New Opportunities (spans 2 cols + 2 rows) */}
        <DashboardCell size="half" height="auto" rowSpan={2} className="max-h-110 overflow-y-auto">
          <NewOpportunitiesCell items={newOpportunities} loading={newOpportunitiesLoading} />
        </DashboardCell>

        {/* Right half, top row */}
        <DashboardCell>
          <DashboardCellTitle>Campaigns</DashboardCellTitle>
          <DashboardCellBody loading={loading}>{metrics.campaignCount}</DashboardCellBody>
        </DashboardCell>
        <DashboardCell>
          <DashboardCellTitle>Opportunities won</DashboardCellTitle>
          <DashboardCellBody loading={loading}>{metrics.opportunitiesWon}</DashboardCellBody>
        </DashboardCell>

        {/* Right half, bottom row */}
        <DashboardCell>
          <DashboardCellTitle>Avg. conversion</DashboardCellTitle>
          <DashboardCellBody loading={loading}>{Math.round(metrics.avgConversion)}%</DashboardCellBody>
        </DashboardCell>
        <DashboardCell gradient={!loading && metrics.totalWon > 0 ? 'green' : 'none'}>
          <DashboardCellTitle>Total earned</DashboardCellTitle>
          <DashboardCellBody loading={loading}>{formatCurrency(metrics.totalWon)}</DashboardCellBody>
        </DashboardCell>
      </Dashboard>

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
          <PartnerTableHeader />
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
            No campaigns yet
          </h2>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t been assigned to any campaigns yet
          </p>
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
          <PartnerTableHeader />
          <Separator />
          {paginatedRows.map((row) => (
            <div key={row.id}>
              <CampaignRow
                campaign={row}
                onClick={handleRowClick}
                className="-mx-5"
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

/** Column headers with "Engaged" column after Progress. */
function PartnerTableHeader() {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      <div className="w-8 shrink-0" />
      <div className="flex-1 min-w-0">Campaign</div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-28">Progress</span>
        <span className="w-20">Engaged</span>
        <span className="w-14">Conversion</span>
        <span className="w-14">Total won</span>
      </div>
    </div>
  );
}
