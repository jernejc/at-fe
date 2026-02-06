'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Partner, PartnerType, MembershipRead, MembershipWithProgress } from '@/lib/schemas/campaign';
import {
    getCampaignPartners,
    getPartnerAssignedCompanies,
    assignCompanyToPartner,
    unassignCompanyFromPartner,
    bulkAssignCompaniesToPartner,
    getCampaignCompanies,
} from '@/lib/api';
import type { PartnerCompanyAssignmentWithCompany, PartnerAssignmentSummary } from '@/lib/schemas';
import { Building2, Zap, Briefcase, Globe, ExternalLink, Shuffle, LayoutGrid, TableProperties, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PartnerOverviewCard } from './PartnerOverviewCard';
import { PartnerAssignmentsView } from './PartnerAssignmentsView';
import { AutoAssignDialog } from './AutoAssignDialog';
import { PartnerDetailSheet } from './PartnerDetailSheet';
import { AddPartnerDialog } from './AddPartnerDialog';
import { cn } from '@/lib/utils';

interface PartnerTabProps {
    campaignSlug: string;
    companies: MembershipRead[];
    partners?: PartnerAssignmentSummary[];
    onCompanyClick?: (domain: string) => void;
    onPartnersUpdated?: () => void;
}

export function PartnerTab({ 
    campaignSlug, 
    companies: initialCompanies, 
    partners: preloadedPartners,
    onCompanyClick,
    onPartnersUpdated
}: PartnerTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<'overview' | 'assignments'>('overview');
    const [partners, setPartners] = useState<Partner[]>([]);
    const [companies, setCompanies] = useState<MembershipRead[]>(initialCompanies);
    const [loading, setLoading] = useState(true);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);
    const [addPartnerDialogOpen, setAddPartnerDialogOpen] = useState(false);

    // Store raw API response for partner IDs
    const [partnerAssignmentData, setPartnerAssignmentData] = useState<PartnerAssignmentSummary[]>([]);

    // Load partners, companies, and partner assignments efficiently
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                
                // Step 1: Fetch partners (if not preloaded) and companies in parallel
                let partnerAssignments = preloadedPartners;
                let companiesResult = null;

                if (partnerAssignments) {
                    // Just fetch companies if needed
                     if (initialCompanies.length === 0) {
                        companiesResult = await getCampaignCompanies(campaignSlug, { page_size: 200 });
                     }
                } else {
                    const [fetchedPartners, fetchedCompanies] = await Promise.all([
                        getCampaignPartners(campaignSlug),
                        initialCompanies.length === 0 
                            ? getCampaignCompanies(campaignSlug, { page_size: 200 })
                            : Promise.resolve(null),
                    ]);
                    partnerAssignments = fetchedPartners;
                    companiesResult = fetchedCompanies;
                }
                
                const companiesResponse = companiesResult;

                // Store raw partner data for ID lookups
                setPartnerAssignmentData(partnerAssignments);

                // Map partner assignments to Partner type
                const mappedPartners: Partner[] = partnerAssignments.map((p) => ({
                    id: String(p.partner_id),
                    name: p.partner_name,
                    type: (p.partner_type as PartnerType) || 'consulting',
                    logo_url: p.partner_logo_url ?? undefined,
                    description: p.partner_description ?? '',
                    status: p.partner_status === 'active' ? 'active' : 'inactive',
                    match_score: 90,
                    capacity: p.partner_capacity ?? undefined,
                    // Use the count from the API directly
                    assigned_count: p.assigned_count ?? 0,
                    industries: p.partner_industries ?? [],
                }));

                setPartners(mappedPartners);

                // Get base companies
                const baseCompanies = companiesResponse ? companiesResponse.items : initialCompanies;

                // Step 2: Fetch partner-company assignments for all partners in parallel
                // This is O(P) where P = number of partners (typically small: 5-10)
                // Much better than O(C) where C = number of companies (could be 100+)
                const partnerCompanyAssignments = await Promise.all(
                    partnerAssignments.map(async (p) => {
                        try {
                            const assignments = await getPartnerAssignedCompanies(campaignSlug, p.partner_id);
                            return { partnerId: String(p.partner_id), assignments };
                        } catch {
                            return { partnerId: String(p.partner_id), assignments: [] };
                        }
                    })
                );

                // Step 3: Build lookup map: company_id -> partner_id
                const companyToPartnerMap = new Map<number, string>();
                for (const { partnerId, assignments } of partnerCompanyAssignments) {
                    for (const assignment of assignments) {
                        companyToPartnerMap.set(assignment.company_id, partnerId);
                    }
                }

                // Step 4: Merge partner_id into companies
                // Note: assignment.company_id matches company.company_id (NOT company.id which is membership ID)
                const companiesWithPartners = baseCompanies.map(company => ({
                    ...company,
                    partner_id: companyToPartnerMap.get(company.company_id) ?? company.partner_id ?? null,
                }));

                // Debug logging
                console.log('[PartnerTab] Partner assignments:', partnerCompanyAssignments);
                console.log('[PartnerTab] companyToPartnerMap size:', companyToPartnerMap.size);
                console.log('[PartnerTab] Sample companies:', baseCompanies.slice(0, 3).map(c => ({ id: c.id, company_id: c.company_id, domain: c.domain })));
                console.log('[PartnerTab] Assigned count:', companiesWithPartners.filter(c => c.partner_id).length);

                setCompanies(companiesWithPartners);
            } catch (error) {
                console.error('Failed to fetch campaign data:', error);
                setPartners([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [campaignSlug, initialCompanies.length === 0, preloadedPartners]);


    // Note: We don't sync with initialCompanies directly because we need to merge
    // partner_id from partner assignments. The main useEffect handles this.

    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [partnerDetailOpen, setPartnerDetailOpen] = useState(false);
    const [selectedPartnerCompanies, setSelectedPartnerCompanies] = useState<PartnerCompanyAssignmentWithCompany[]>([]);
    const [loadingPartnerDetail, setLoadingPartnerDetail] = useState(false);

    const OUTREACH_STATUSES: MembershipWithProgress['outreach_status'][] = [
        'not_started', 'draft', 'sent', 'replied', 'meeting_booked'
    ];

    // Only fetch partner companies when user clicks on a specific partner
    const handlePartnerClick = async (partner: Partner) => {
        setSelectedPartner(partner);
        setPartnerDetailOpen(true);
        setLoadingPartnerDetail(true);

        try {
            // Single fetch only when needed (on-demand)
            const assignments = await getPartnerAssignedCompanies(campaignSlug, Number(partner.id));
            setSelectedPartnerCompanies(assignments);
        } catch (error) {
            console.error('Failed to fetch partner companies:', error);
            setSelectedPartnerCompanies([]);
        } finally {
            setLoadingPartnerDetail(false);
        }
    };

    // Convert partner assignments to MembershipWithProgress for the detail sheet
    const selectedPartnerAccounts = useMemo<MembershipWithProgress[]>(() => {
        if (!selectedPartner) return [];

        // If we have detailed assignment data, use it
        if (selectedPartnerCompanies.length > 0) {
            return selectedPartnerCompanies.map((a, idx) => ({
                id: a.id,
                company_id: a.company_id,
                domain: a.company.domain,
                company_name: a.company.name,
                industry: a.company.industry,
                employee_count: a.company.employee_count,
                hq_country: a.company.hq_country,
                segment: null,
                cached_fit_score: null,
                cached_likelihood_score: null,
                cached_urgency_score: null,
                is_processed: false,
                notes: a.notes,
                priority: 0,
                created_at: a.assigned_at,
                partner_id: selectedPartner.id,
                partner_name: selectedPartner.name,
                outreach_status: 'not_started',
                outreach_sent_at: undefined,
                decision_makers_count: 0,
                last_activity: undefined,
            }));
        }

        // Fallback: filter from local companies data
        const assignedCompanies = companies.filter(c => c.partner_id === selectedPartner.id);
        return assignedCompanies.map((c, idx) => ({
            ...c,
            outreach_status: 'not_started',
            outreach_sent_at: undefined,
            decision_makers_count: 0,
            last_activity: undefined,
        }));
    }, [selectedPartner, selectedPartnerCompanies, companies]);

    const handlePartnerAccountClick = (domain: string) => {
        onCompanyClick?.(domain);
    };

    // Use assigned_count from API data, fallback to counting companies
    const partnersWithStats = useMemo(() => {
        return partners.map(partner => {
            // First try to use the assigned_count from the API
            const apiData = partnerAssignmentData.find(p => p.partner_id === Number(partner.id));
            if (apiData && apiData.assigned_count !== undefined) {
                return {
                    ...partner,
                    assigned_count: apiData.assigned_count,
                };
            }
            // Fallback to counting from local companies data
            return {
                ...partner,
                assigned_count: companies.filter(c => c.partner_id === partner.id).length,
            };
        });
    }, [partners, partnerAssignmentData, companies]);

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
        } catch (error) {
            console.error('Failed to assign company:', error);
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
        } catch (error) {
            console.error('Failed to bulk assign companies:', error);
        } finally {
            setAssignmentLoading(false);
        }
    };

    // Refresh data after adding partners
    const handlePartnersAdded = async () => {
        // Notify parent to refresh data
        if (onPartnersUpdated) {
            onPartnersUpdated();
        }

        setLoading(true);
        try {
            const partnerAssignments = await getCampaignPartners(campaignSlug);
            setPartnerAssignmentData(partnerAssignments);
            
            const mappedPartners: Partner[] = partnerAssignments.map((p) => ({
                id: String(p.partner_id),
                name: p.partner_name,
                type: (p.partner_type as PartnerType) || 'consulting',
                logo_url: p.partner_logo_url ?? undefined,
                description: p.partner_description ?? '',
                status: p.partner_status === 'active' ? 'active' : 'inactive',
                match_score: 90,
                capacity: p.partner_capacity ?? undefined,
                assigned_count: p.assigned_count ?? 0,
                industries: p.partner_industries ?? [],
            }));
            setPartners(mappedPartners);
        } catch (error) {
            console.error('Failed to refresh partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const unassignedCount = companies.filter(c => !c.partner_id).length;
    const existingPartnerIds = partnerAssignmentData.map(p => p.partner_id);

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
                        <Button 
                            variant="outline" 
                            className="bg-white dark:bg-slate-800 gap-2"
                            onClick={() => setAddPartnerDialogOpen(true)}
                        >
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

            <AddPartnerDialog
                campaignSlug={campaignSlug}
                existingPartnerIds={existingPartnerIds}
                open={addPartnerDialogOpen}
                onClose={() => setAddPartnerDialogOpen(false)}
                onPartnersAdded={handlePartnersAdded}
            />

            <PartnerDetailSheet
                partner={selectedPartner}
                open={partnerDetailOpen}
                onClose={() => {
                    setPartnerDetailOpen(false);
                    setSelectedPartnerCompanies([]);
                }}
                assignedCompanies={selectedPartnerAccounts}
                onCompanyClick={handlePartnerAccountClick}
                isLoading={loadingPartnerDetail}
            />
        </div>
    );
}
