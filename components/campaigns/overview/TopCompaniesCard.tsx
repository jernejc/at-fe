import { CampaignOverview, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import { Loader2, ArrowRight } from 'lucide-react';
import { CompanyRowCompact, CompanyRowCompactSkeleton } from '../CompanyRowCompact';

export function TopCompaniesCard({
    topCompanies,
    dynamicCompanies,
    dynamicCompaniesTotal = 0,
    totalCompanies = 0,
    loadingDynamicCompanies,
    onCompanyClick,
    onViewAll,
}: {
    topCompanies?: CampaignOverview['top_companies'];
    dynamicCompanies?: (CompanySummary | CompanySummaryWithFit)[];
    dynamicCompaniesTotal?: number;
    totalCompanies?: number;
    loadingDynamicCompanies?: boolean;
    onCompanyClick: (domain: string) => void;
    onViewAll: () => void;
}) {
    const useDynamic = dynamicCompanies !== undefined;

    // Sort dynamic companies by fit score
    const sortedDynamicCompanies = useDynamic && dynamicCompanies
        ? [...dynamicCompanies].sort((a, b) => {
            const scoreA = 'combined_score' in a ? (a.combined_score ?? 0) : 0;
            const scoreB = 'combined_score' in b ? (b.combined_score ?? 0) : 0;
            return scoreB - scoreA;
        })
        : undefined;

    const displayCompanies = useDynamic ? sortedDynamicCompanies : topCompanies;
    const shownCount = displayCompanies?.slice(0, 10).length || 0;
    const totalCount = useDynamic ? dynamicCompaniesTotal : totalCompanies;
    const hasMore = totalCount > shownCount;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Top Companies</h3>
                </div>
                <div className="flex items-center gap-3">
                    {loadingDynamicCompanies ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                        <span className="text-xs text-slate-400 tabular-nums">
                            {shownCount} of {totalCount}
                        </span>
                    )}
                    {hasMore && !loadingDynamicCompanies && (
                        <button
                            onClick={onViewAll}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            View all
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {loadingDynamicCompanies ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <CompanyRowCompactSkeleton key={i} showRank />
                    ))
                ) : useDynamic ? (
                    sortedDynamicCompanies && sortedDynamicCompanies.length > 0 ? sortedDynamicCompanies.slice(0, 10).map((company, idx) => (
                        <CompanyRowCompact
                            key={company.domain}
                            name={company.name}
                            domain={company.domain}
                            rank={idx + 1}
                            industry={company.industry}
                            employeeCount={company.employee_count}
                            hqCountry={company.hq_country}
                            fitScore={'combined_score' in company ? company.combined_score : null}
                            logoBase64={company.logo_base64}
                            onClick={() => onCompanyClick(company.domain)}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        />
                    )) : (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            No companies match your filters
                        </div>
                    )
                ) : (
                    topCompanies && topCompanies.length > 0 ? topCompanies.slice(0, 6).map((company, idx) => (
                        <CompanyRowCompact
                            key={company.id}
                            name={company.company_name || company.domain}
                            domain={company.domain}
                            rank={idx + 1}
                            industry={company.industry}
                            employeeCount={company.employee_count}
                            hqCountry={company.hq_country}
                            fitScore={company.cached_fit_score}
                            logoBase64={company.logo_base64}
                            partnerName={company.partner_name}
                            onClick={() => onCompanyClick(company.domain)}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        />
                    )) : (
                        <div className="p-8 text-center">
                            <div className="text-slate-500 dark:text-slate-400 text-sm">No companies yet</div>
                            <div className="text-slate-400 text-xs mt-1">Add companies to get started</div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
