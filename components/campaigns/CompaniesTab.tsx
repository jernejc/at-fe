'use client';

import type { MembershipRead, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import { FunnelVisualization } from './FunnelVisualization';
import { CompanyRowCompact } from './CompanyRowCompact';
import { AddCompanyButton } from './AddCompanyButton';
import { Loader2 } from 'lucide-react';

interface CompaniesTabProps {
    slug: string;
    productId?: number;
    companies: MembershipRead[];
    // Dynamic companies from filters
    dynamicCompanies?: (CompanySummary | CompanySummaryWithFit)[];
    dynamicCompaniesTotal?: number;
    loadingDynamicCompanies?: boolean;
    onCompanyClick: (domain: string) => void;
    onCompanyAdded: () => void;
}

export function CompaniesTab({
    slug,
    productId,
    companies,
    dynamicCompanies,
    dynamicCompaniesTotal = 0,
    loadingDynamicCompanies = false,
    onCompanyClick,
    onCompanyAdded,
}: CompaniesTabProps) {
    // Use dynamic companies if available, otherwise fall back to membership-based companies
    const useDynamic = dynamicCompanies !== undefined;
    const displayCompanies = useDynamic ? dynamicCompanies : companies;
    const totalCount = useDynamic ? dynamicCompaniesTotal : companies.length;

    return (
        <div className="space-y-6">
            {/* Funnel Visualization - only show for membership-based campaigns */}
            {!useDynamic && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Campaign Funnel</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Company progression through qualification stages
                        </p>
                    </div>
                    <FunnelVisualization
                        slug={slug}
                        productId={productId}
                    />
                </div>
            )}

            {/* Companies List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            {useDynamic ? 'Matching Companies' : 'Companies in Campaign'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {loadingDynamicCompanies ? (
                                'Searching...'
                            ) : useDynamic ? (
                                `${totalCount} companies match your filters`
                            ) : (
                                `${companies.length} companies • ${companies.filter(c => c.partner_id).length} assigned to partners`
                            )}
                        </p>
                    </div>
                    {loadingDynamicCompanies && (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    )}
                </div>

                {displayCompanies && displayCompanies.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-2">
                        {useDynamic ? (
                            // Render dynamic companies (CompanySummary)
                            dynamicCompanies!.map((company) => (
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
                                    className="cursor-pointer"
                                />
                            ))
                        ) : (
                            // Render membership-based companies
                            companies.map((membership) => (
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
                                    className="cursor-pointer"
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

                {/* Show total count if there are more */}
                {useDynamic && dynamicCompanies && dynamicCompanies.length < totalCount && (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                        Showing {dynamicCompanies.length} of {totalCount} matching companies
                    </p>
                )}
            </div>

            {/* Add Company Button - only show for non-dynamic mode */}
            {!useDynamic && (
                <div className="mt-4">
                    <AddCompanyButton slug={slug} onCompanyAdded={onCompanyAdded} className="h-12 bg-white dark:bg-slate-900 border-dashed" />
                </div>
            )}
        </div>
    );
}
