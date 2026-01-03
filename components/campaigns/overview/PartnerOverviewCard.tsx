import { useState, useEffect, useMemo } from 'react';
import { getPartnerAssignedCompanies, getCampaignPartners } from '@/lib/api';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MembershipRead } from '@/lib/schemas';

interface PartnerCardData {
    id: string;
    name: string;
    logo_url: string | null;
    count: number;
    capacity: number | null;
}

export function PartnerOverviewCard({
    campaignSlug,
    onManagePartners,
    totalCompanyCount = 0,
    companies,
}: {
    campaignSlug?: string;
    onManagePartners: () => void;
    totalCompanyCount?: number;
    companies?: MembershipRead[];
}) {
    const [partners, setPartners] = useState<PartnerCardData[]>([]);
    const [loading, setLoading] = useState(true);

    // Calculate counts from companies list
    const partnerCounts = useMemo(() => {
        const counts = new Map<string, number>();
        if (!companies) return counts;
        
        companies.forEach(company => {
            if (company.partner_id) {
                // partner_id in MembershipRead is string according to schema, but let's handle numeric too
                const pId = String(company.partner_id);
                counts.set(pId, (counts.get(pId) || 0) + 1);
            }
        });
        return counts;
    }, [companies]);

    // The API now returns full partner details directly (PartnerAssignmentSummary)
    useEffect(() => {
        async function fetchPartners() {
            if (!campaignSlug) {
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const partnerAssignments = await getCampaignPartners(campaignSlug);
                
                // Map API PartnerAssignmentSummary to PartnerCardData
                // If API count is missing (0), fetch actual assignments
                const mappedPartners = await Promise.all(partnerAssignments.map(async (p) => {
                    let count = p.assigned_count ?? 0;
                    
                    // Fallback to calculated if matches (optimization)
                    const calculatedCount = partnerCounts.get(String(p.partner_id)) || 0;
                    count = Math.max(count, calculatedCount);
                    
                    // If still 0, try fetching explicit assignments (expensive fallback)
                    if (count === 0 && campaignSlug) {
                        try {
                            const assignments = await getPartnerAssignedCompanies(campaignSlug, p.partner_id);
                            if (assignments.length > 0) {
                                count = assignments.length;
                            }
                        } catch (e) {
                            // ignore error
                        }
                    }

                    return {
                        id: String(p.partner_id),
                        name: p.partner_name,
                        logo_url: p.partner_logo_url,
                        count, 
                        capacity: p.partner_capacity,
                    };
                }));
                
                setPartners(mappedPartners);
            } catch (error) {
                console.error('Failed to fetch partners:', error);
                setPartners([]);
            } finally {
                setLoading(false);
            }
        }
        
        fetchPartners();
    }, [campaignSlug, partnerCounts]);

    const topPartners = partners;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Partners</h3>
                </div>
                <button
                    onClick={onManagePartners}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                    Manage
                </button>
            </div>
            <div className="p-5 py-2">
                {/* Top partners with logos */}
                <div className="flex flex-col">
                    {topPartners.map((partner, index) => (
                        <div key={partner.id} className={cn(
                            "group flex items-center justify-between text-sm py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default px-2 -mx-2 rounded-md",
                            index !== topPartners.length - 1 && "border-b border-slate-50 dark:border-slate-700"
                        )}>
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-5 h-5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                    <img
                                        src={partner.logo_url ?? undefined}
                                        alt={partner.name}
                                        className="w-3.5 h-3.5 object-contain"
                                    />
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-[13px]">
                                    {partner.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                                    {partner.capacity ? Math.round((partner.count / partner.capacity) * 100) : 0}%
                                </span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium tabular-nums shrink-0 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                                    {partner.count}/{partner.capacity || '-'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
