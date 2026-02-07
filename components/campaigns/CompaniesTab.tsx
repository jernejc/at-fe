'use client';

import { useMemo, useState } from 'react';
import type { MembershipRead, CompanySummary, CompanySummaryWithFit, CampaignFilterUI } from '@/lib/schemas';
import { CompanyRowCompact } from './CompanyRowCompact';
import { AddCompanyButton } from './AddCompanyButton';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X } from 'lucide-react';

interface CompaniesTabProps {
    slug: string;
    companies: MembershipRead[];
    dynamicCompanies?: (CompanySummary | CompanySummaryWithFit)[];
    dynamicCompaniesTotal?: number;
    loadingDynamicCompanies?: boolean;
    onCompanyClick: (domain: string) => void;
    onCompanyAdded: () => void;
    onCompanyRemoved?: (domain: string) => void;
    filters: CampaignFilterUI[];
    onFiltersChange: (filters: CampaignFilterUI[]) => void;
    isSavingFilters?: boolean;
}

export function CompaniesTab({
    slug,
    companies,
    dynamicCompanies,
    dynamicCompaniesTotal = 0,
    loadingDynamicCompanies = false,
    onCompanyClick,
    onCompanyAdded,
    onCompanyRemoved,
    filters,
    onFiltersChange,
    isSavingFilters,
}: CompaniesTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const useDynamic = dynamicCompanies !== undefined;
    const totalCount = useDynamic ? dynamicCompaniesTotal : companies.length;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    // Sort companies by fit score (highest first)
    const sortedCompanies = useMemo(() => {
        return [...companies].sort((a, b) => {
            const scoreA = a.cached_fit_score ?? 0;
            const scoreB = b.cached_fit_score ?? 0;
            return scoreB - scoreA;
        });
    }, [companies]);

    const sortedDynamicCompanies = useMemo(() => {
        if (!dynamicCompanies) return undefined;
        return [...dynamicCompanies].sort((a, b) => {
            const scoreA = 'combined_score' in a ? (a.combined_score ?? 0) : 0;
            const scoreB = 'combined_score' in b ? (b.combined_score ?? 0) : 0;
            return scoreB - scoreA;
        });
    }, [dynamicCompanies]);

    const visibleMemberships = useMemo(() => {
        if (!normalizedSearch) return sortedCompanies;
        return sortedCompanies.filter((membership) => {
            const haystack = [
                membership.company_name ?? '',
                membership.domain,
                membership.industry ?? '',
                membership.hq_country ?? '',
                membership.partner_name ?? '',
            ].join(' ').toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [normalizedSearch, sortedCompanies]);

    const visibleDynamicCompanies = useMemo(() => {
        const base = sortedDynamicCompanies ?? [];
        if (!normalizedSearch) return base;
        return base.filter((company) => {
            const haystack = [
                company.name ?? '',
                company.domain,
                company.industry ?? '',
                company.hq_country ?? '',
            ].join(' ').toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [normalizedSearch, sortedDynamicCompanies]);

    const removeFilter = (filterId: string) => {
        onFiltersChange(filters.filter(filter => filter.id !== filterId));
    };

    const clearFilters = () => {
        onFiltersChange([]);
    };

    const hasFilters = filters.length > 0;

    return (
        <div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="font-medium text-sm text-slate-900 dark:text-white">
                                {useDynamic ? 'Matching Companies' : 'All Companies'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {loadingDynamicCompanies ? (
                                    'Searching...'
                                ) : useDynamic ? (
                                    `${totalCount} companies match your filters`
                                ) : (
                                    `${companies.length} companies`
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <div className="relative w-full lg:w-72">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search companies..."
                                    className="h-9 pl-8"
                                />
                            </div>
                            {!useDynamic && (
                                <AddCompanyButton
                                    slug={slug}
                                    onCompanyAdded={onCompanyAdded}
                                    existingDomains={companies.map(c => c.domain)}
                                    variant="outline"
                                    label="Add company"
                                    className="h-9 w-auto shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 border-solid px-3"
                                />
                            )}
                            {loadingDynamicCompanies && (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />
                            )}
                        </div>
                    </div>

                    {hasFilters && (
                        <div className="flex flex-wrap items-center gap-2">
                            {filters.map((filter) => (
                                <div
                                    key={filter.id}
                                    className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                                >
                                    <span className="max-w-[200px] truncate">{filter.value}</span>
                                    <button
                                        onClick={() => removeFilter(filter.id)}
                                        disabled={isSavingFilters}
                                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                                        aria-label={`Remove ${filter.value} filter`}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={clearFilters}
                                disabled={isSavingFilters}
                                className="h-7 px-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors disabled:opacity-50"
                            >
                                Clear all
                            </button>
                            {isSavingFilters && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Saving...
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {(useDynamic ? visibleDynamicCompanies.length : visibleMemberships.length) > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {useDynamic ? (
                            visibleDynamicCompanies.map((company) => (
                                <CompanyRowCompact
                                    key={company.domain}
                                    name={company.name}
                                    domain={company.domain}
                                    industry={company.industry}
                                    employeeCount={company.employee_count}
                                    hqCountry={company.hq_country}
                                    fitScore={'combined_score' in company ? company.combined_score : null}
                                    logoBase64={company.logo_base64}
                                    onClick={() => onCompanyClick(company.domain)}
                                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                />
                            ))
                        ) : (
                            visibleMemberships.map((membership) => (
                                <CompanyRowCompact
                                    key={membership.id}
                                    name={membership.company_name || membership.domain}
                                    domain={membership.domain}
                                    industry={membership.industry}
                                    employeeCount={membership.employee_count}
                                    hqCountry={membership.hq_country}
                                    segment={membership.segment}
                                    fitScore={membership.cached_fit_score}
                                    logoBase64={membership.logo_base64}
                                    partnerName={membership.partner_name}
                                    onClick={() => onCompanyClick(membership.domain)}
                                    onRemove={onCompanyRemoved ? (e) => {
                                        e.stopPropagation();
                                        onCompanyRemoved(membership.domain);
                                    } : undefined}
                                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                />
                            ))
                        )}
                    </div>
                ) : !loadingDynamicCompanies && (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <p>
                            {searchTerm.trim()
                                ? 'No companies match your search'
                                : useDynamic
                                    ? 'No companies match your filters'
                                    : 'No companies in this campaign yet'}
                        </p>
                        {useDynamic && !searchTerm.trim() && (
                            <p className="text-xs mt-1">Try adjusting your filter criteria</p>
                        )}
                    </div>
                )}

                {useDynamic && visibleDynamicCompanies.length < totalCount && (
                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                            Showing {visibleDynamicCompanies.length} of {totalCount} matching companies
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
