'use client';

import { useMemo } from 'react';
import type { MembershipRead, CompanySummary, CompanySummaryWithFit, CampaignFilterUI } from '@/lib/schemas';
import { CompanyRowCompact } from './CompanyRowCompact';
import { AddCompanyButton } from './AddCompanyButton';
import { FilterBar } from './FilterBar';
import { Loader2 } from 'lucide-react';

interface CompaniesTabProps {
    slug: string;
    companies: MembershipRead[];
    dynamicCompanies?: (CompanySummary | CompanySummaryWithFit)[];
    dynamicCompaniesTotal?: number;
    loadingDynamicCompanies?: boolean;
    onCompanyClick: (domain: string) => void;
    onCompanyAdded: () => void;
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
    filters,
    onFiltersChange,
    isSavingFilters,
}: CompaniesTabProps) {
    const useDynamic = dynamicCompanies !== undefined;
    const totalCount = useDynamic ? dynamicCompaniesTotal : companies.length;

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

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center gap-3">
                <FilterBar
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    disabled={isSavingFilters}
                />
                {isSavingFilters && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                    </div>
                )}
            </div>

            {/* Companies List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
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
                                `${companies.length} companies · ${companies.filter(c => c.partner_id).length} assigned`
                            )}
                        </p>
                    </div>
                    {loadingDynamicCompanies && (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    )}
                </div>

                {(useDynamic ? (sortedDynamicCompanies?.length ?? 0) : sortedCompanies.length) > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {useDynamic ? (
                            sortedDynamicCompanies!.map((company) => (
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
                            sortedCompanies.map((membership) => (
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
                                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                />
                            ))
                        )}
                    </div>
                ) : !loadingDynamicCompanies && (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <p>{useDynamic ? 'No companies match your filters' : 'No companies in this campaign yet'}</p>
                        {useDynamic && (
                            <p className="text-xs mt-1">Try adjusting your filter criteria</p>
                        )}
                    </div>
                )}

                {useDynamic && sortedDynamicCompanies && sortedDynamicCompanies.length < totalCount && (
                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                            Showing {sortedDynamicCompanies.length} of {totalCount} matching companies
                        </p>
                    </div>
                )}
            </div>

            {/* Add Company Button */}
            {!useDynamic && (
                <AddCompanyButton
                    slug={slug}
                    onCompanyAdded={onCompanyAdded}
                    className="h-10 bg-white dark:bg-slate-900 border-dashed"
                />
            )}
        </div>
    );
}
