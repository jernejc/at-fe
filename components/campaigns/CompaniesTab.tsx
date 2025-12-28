'use client';

import type { MembershipRead } from '@/lib/schemas';
import { FunnelVisualization } from './FunnelVisualization';
import { CompanyRowCompact } from './CompanyRowCompact';
import { AddCompanyButton } from './AddCompanyButton';

interface CompaniesTabProps {
    slug: string;
    productId?: number;
    companies: MembershipRead[];
    onCompanyClick: (domain: string) => void;
    onCompanyAdded: () => void;
}

export function CompaniesTab({
    slug,
    productId,
    companies,
    onCompanyClick,
    onCompanyAdded,
}: CompaniesTabProps) {
    return (
        <div className="space-y-6">
            {/* Funnel Visualization */}
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

            {/* Companies List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            Companies in Campaign
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {companies.length} companies • {companies.filter(c => c.partner_id).length} assigned to partners
                        </p>
                    </div>
                </div>
                {companies.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-2">
                        {companies.map((membership) => (
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
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <p>No companies in this campaign yet</p>
                    </div>
                )}
            </div>

            {/* Add Company Button */}
            <div className="mt-4">
                <AddCompanyButton slug={slug} onCompanyAdded={onCompanyAdded} className="h-12 bg-white dark:bg-slate-900 border-dashed" />
            </div>
        </div>
    );
}
