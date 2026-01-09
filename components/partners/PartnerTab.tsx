'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Partner, PartnerType, MembershipRead, MembershipWithProgress } from '@/lib/schemas/campaign';
import {
    getCampaignPartners,
    getPartnerAssignedCompanies,
    assignCompanyToPartner,
    unassignCompanyFromPartner,
    bulkAssignCompaniesToPartner,
} from '@/lib/api';
import type { PartnerCompanyAssignmentWithCompany } from '@/lib/schemas';
import { Building2, Zap, Briefcase, Globe, ExternalLink, Shuffle, LayoutGrid, TableProperties, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PartnerOverviewCard } from './PartnerOverviewCard';
import { PartnerAssignmentsView } from './PartnerAssignmentsView';
import { AutoAssignDialog } from './AutoAssignDialog';
import { PartnerDetailSheet } from './PartnerDetailSheet';
import { cn } from '@/lib/utils';

interface PartnerTabProps {
    campaignSlug: string;
    companies: MembershipRead[];
    onCompanyClick?: (domain: string) => void;
}

export function PartnerTab({ campaignSlug, companies: initialCompanies, onCompanyClick }: PartnerTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<'overview' | 'assignments'>('overview');
    const [partners, setPartners] = useState<Partner[]>([]);
    const [companies, setCompanies] = useState<MembershipRead[]>(initialCompanies);
    const [loading, setLoading] = useState(true);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);

    const [partnerAssignments, setPartnerAssignments] = useState<Map<string, PartnerCompanyAssignmentWithCompany[]>>(new Map());

    useEffect(() => {
        async function fetchPartners() {
            try {
                setLoading(true);
                const partnerAssignments = await getCampaignPartners(campaignSlug);

                const mappedPartners: Partner[] = partnerAssignments.map((p) => ({
                    id: String(p.partner_id),
                    name: p.partner_name,
                    type: (p.partner_type as PartnerType) || 'consulting',
                    logo_url: p.partner_logo_url ?? undefined,
                    description: p.partner_description ?? '',
                    status: p.partner_status === 'active' ? 'active' : 'inactive',
                    match_score: 90,
                    capacity: p.partner_capacity ?? undefined,
                    assigned_count: 0,
                    industries: p.partner_industries ?? [],
                }));

                setPartners(mappedPartners);
                await fetchAllPartnerAssignments(mappedPartners);
            } catch (error) {
                console.error('Failed to fetch campaign partners:', error);
                setPartners([]);
            } finally {
                setLoading(false);
            }
        }

        fetchPartners();
    }, [campaignSlug]);

    const fetchAllPartnerAssignments = useCallback(async (partnerList: Partner[]) => {
        const assignmentsMap = new Map<string, PartnerCompanyAssignmentWithCompany[]>();

        await Promise.all(
            partnerList.map(async (partner) => {
                try {
                    const assignments = await getPartnerAssignedCompanies(campaignSlug, Number(partner.id));
                    assignmentsMap.set(partner.id, assignments);
                } catch (error) {
                    console.error(`Failed to fetch assignments for partner ${partner.id}:`, error);
                    assignmentsMap.set(partner.id, []);
                }
            })
        );

        setPartnerAssignments(assignmentsMap);
        updateCompaniesWithAssignments(assignmentsMap, partnerList);
    }, [campaignSlug]);

    const updateCompaniesWithAssignments = (
        assignmentsMap: Map<string, PartnerCompanyAssignmentWithCompany[]>,
        partnerList: Partner[]
    ) => {
        setCompanies(prev => prev.map(company => {
            for (const [partnerId, assignments] of assignmentsMap) {
                const assignment = assignments.find(a => a.company_id === company.company_id);
                if (assignment) {
                    const partner = partnerList.find(p => p.id === partnerId);
                    return {
                        ...company,
                        partner_id: partnerId,
                        partner_name: partner?.name ?? null,
                    };
                }
            }
            return {
                ...company,
                partner_id: null,
                partner_name: null,
            };
        }));
    };

    useEffect(() => {
        if (initialCompanies.length > 0 && partnerAssignments.size > 0) {
            updateCompaniesWithAssignments(partnerAssignments, partners);
        } else {
            setCompanies(initialCompanies);
        }
    }, [initialCompanies]);

    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [partnerDetailOpen, setPartnerDetailOpen] = useState(false);

    const OUTREACH_STATUSES: MembershipWithProgress['outreach_status'][] = [
        'not_started', 'draft', 'sent', 'replied', 'meeting_booked'
    ];

    const selectedPartnerAccounts = useMemo<MembershipWithProgress[]>(() => {
        if (!selectedPartner) return [];

        const assignedCompanies = companies.filter(c => c.partner_id === selectedPartner.id);

        return assignedCompanies.map((c, idx) => ({
            ...c,
            outreach_status: OUTREACH_STATUSES[idx % OUTREACH_STATUSES.length],
            outreach_sent_at: idx % 3 !== 0
                ? new Date(Date.now() - (idx * 2 + 1) * 86400000).toISOString()
                : undefined,
            decision_makers_count: Math.floor((idx + 1) % 5) + 1,
            last_activity: new Date(Date.now() - idx * 43200000).toISOString(),
        }));
    }, [selectedPartner, companies]);

    const handlePartnerClick = (partner: Partner) => {
        setSelectedPartner(partner);
        setPartnerDetailOpen(true);
    };

    const handlePartnerAccountClick = (domain: string) => {
        onCompanyClick?.(domain);
    };

    const partnersWithStats = useMemo(() => {
        return partners.map(partner => ({
            ...partner,
            assigned_count: companies.filter(c => c.partner_id === partner.id).length,
        }));
    }, [partners, companies]);

    const handleAssign = async (domain: string, partnerId: string | null) => {
        setAssignmentLoading(true);

        try {
            const company = companies.find(c => c.domain === domain);
            if (!company) return;

            const companyId = company.company_id;
            if (!companyId || companyId === 0) {
                console.error('Cannot assign: company_id is invalid', company);
                alert('Cannot assign: company ID is not available. Please check the API response.');
                return;
            }

            const currentPartnerId = company.partner_id;

            if (currentPartnerId && currentPartnerId !== partnerId) {
                await unassignCompanyFromPartner(
                    campaignSlug,
                    Number(currentPartnerId),
                    companyId
                );
            }

            if (partnerId) {
                await assignCompanyToPartner(campaignSlug, Number(partnerId), {
                    company_id: companyId,
                });
            }

            const partner = partners.find(p => p.id === partnerId);
            setCompanies(prev => prev.map(c => {
                if (c.domain === domain) {
                    return {
                        ...c,
                        partner_id: partnerId,
                        partner_name: partner?.name ?? null,
                    };
                }
                return c;
            }));

            await fetchAllPartnerAssignments(partners);
        } catch (error) {
            console.error('Failed to assign company:', error);
            await fetchAllPartnerAssignments(partners);
        } finally {
            setAssignmentLoading(false);
        }
    };

    const handleAutoAssign = async (assignments: Record<string, string>) => {
        setAssignmentLoading(true);

        try {
            const partnerToCompanies = new Map<string, number[]>();

            for (const [domain, partnerId] of Object.entries(assignments)) {
                const company = companies.find(c => c.domain === domain);
                if (!company) continue;

                const companyId = company.company_id;
                if (!companyId || companyId === 0) {
                    console.error('Skipping bulk assign: company_id is invalid', { domain, company });
                    continue;
                }

                if (!partnerToCompanies.has(partnerId)) {
                    partnerToCompanies.set(partnerId, []);
                }
                partnerToCompanies.get(partnerId)!.push(companyId);
            }

            await Promise.all(
                Array.from(partnerToCompanies.entries()).map(async ([partnerId, companyIds]) => {
                    await bulkAssignCompaniesToPartner(
                        campaignSlug,
                        Number(partnerId),
                        companyIds
                    );
                })
            );

            setCompanies(prev => prev.map(company => {
                const partnerId = assignments[company.domain];
                if (partnerId) {
                    const partner = partners.find(p => p.id === partnerId);
                    return {
                        ...company,
                        partner_id: partnerId,
                        partner_name: partner?.name ?? null,
                    };
                }
                return company;
            }));

            await fetchAllPartnerAssignments(partners);
        } catch (error) {
            console.error('Failed to bulk assign companies:', error);
            await fetchAllPartnerAssignments(partners);
        } finally {
            setAssignmentLoading(false);
        }
    };

    const unassignedCount = companies.filter(c => !c.partner_id).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                        onClick={() => setActiveSubTab('overview')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                            activeSubTab === 'overview'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveSubTab('assignments')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                            activeSubTab === 'assignments'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                    >
                        <TableProperties className="w-4 h-4" />
                        Assignments
                        {unassignedCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                {unassignedCount}
                            </span>
                        )}
                    </button>
                </div>

                <Button
                    onClick={() => setAutoAssignDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={unassignedCount === 0 || assignmentLoading}
                >
                    {assignmentLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Shuffle className="w-4 h-4" />
                    )}
                    Auto-assign
                    {unassignedCount > 0 && (
                        <span className="text-xs opacity-70">({unassignedCount})</span>
                    )}
                </Button>
            </div>

            {activeSubTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {partnersWithStats.map(partner => (
                            <PartnerOverviewCard
                                key={partner.id}
                                partner={partner}
                                onClick={() => handlePartnerClick(partner)}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Assignment Summary</span>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 dark:text-white">{companies.length}</span>
                                <span className="text-slate-500 dark:text-slate-400">accounts</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{companies.length - unassignedCount}</span>
                                <span className="text-slate-500 dark:text-slate-400">assigned</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex items-center gap-1.5">
                                <span className={cn(
                                    "font-semibold",
                                    unassignedCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
                                )}>{unassignedCount}</span>
                                <span className="text-slate-500 dark:text-slate-400">pending</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 dark:text-white">{partners.length}</span>
                                <span className="text-slate-500 dark:text-slate-400">partners</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 flex flex-col justify-center items-center text-center">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Need more partners?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-lg">
                            Find specialized partners to help you execute your campaign strategy, from content creation to lead nurturing.
                        </p>
                        <Button variant="outline" className="bg-white dark:bg-slate-800 gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Browse Partner Directory
                        </Button>
                    </div>
                </div>
            )}

            {activeSubTab === 'assignments' && (
                <div className="animate-in fade-in-50">
                    <PartnerAssignmentsView
                        companies={companies}
                        partners={partnersWithStats}
                        onAssign={handleAssign}
                        onCompanyClick={onCompanyClick}
                        isLoading={assignmentLoading}
                    />
                </div>
            )}

            <AutoAssignDialog
                companies={companies}
                partners={partnersWithStats}
                open={autoAssignDialogOpen}
                onClose={() => setAutoAssignDialogOpen(false)}
                onConfirm={handleAutoAssign}
            />

            <PartnerDetailSheet
                partner={selectedPartner}
                open={partnerDetailOpen}
                onClose={() => setPartnerDetailOpen(false)}
                assignedCompanies={selectedPartnerAccounts}
                onCompanyClick={handlePartnerAccountClick}
            />
        </div>
    );
}
