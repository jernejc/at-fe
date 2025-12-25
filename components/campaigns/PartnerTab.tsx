'use client';

import { useState, useEffect, useMemo } from 'react';
import { Partner, MembershipRead } from '@/lib/schemas/campaign';
import { getCampaignCompanies } from '@/lib/api';
import { Building2, Zap, Briefcase, Globe, ExternalLink, Shuffle, LayoutGrid, TableProperties, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PartnerOverviewCard } from './PartnerOverviewCard';
import { PartnerAssignmentsView } from './PartnerAssignmentsView';
import { AutoAssignDialog } from './AutoAssignDialog';
import { DEFAULT_CAMPAIGN_PARTNERS } from './mockPartners';
import { cn } from '@/lib/utils';

interface PartnerTabProps {
    campaignSlug: string;
    onCompanyClick?: (domain: string) => void;
}

export function PartnerTab({ campaignSlug, onCompanyClick }: PartnerTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<'overview' | 'assignments'>('overview');
    const [partners, setPartners] = useState<Partner[]>(DEFAULT_CAMPAIGN_PARTNERS);
    const [companies, setCompanies] = useState<MembershipRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);

    // Load companies data
    useEffect(() => {
        async function loadCompanies() {
            try {
                const result = await getCampaignCompanies(campaignSlug, { page_size: 100 });
                setCompanies(result.items);
            } catch (err) {
                console.error('Failed to load companies:', err);
            } finally {
                setLoading(false);
            }
        }
        loadCompanies();
    }, [campaignSlug]);

    // Calculate partner stats based on current assignments
    const partnersWithStats = useMemo(() => {
        return partners.map(partner => ({
            ...partner,
            assigned_count: companies.filter(c => c.partner_id === partner.id).length,
        }));
    }, [partners, companies]);

    // Handle individual assignment
    const handleAssign = (domain: string, partnerId: string | null) => {
        setCompanies(prev => prev.map(company => {
            if (company.domain === domain) {
                const partner = partners.find(p => p.id === partnerId);
                return {
                    ...company,
                    partner_id: partnerId,
                    partner_name: partner?.name ?? null,
                };
            }
            return company;
        }));
    };

    // Handle bulk auto-assignment
    const handleAutoAssign = (assignments: Record<string, string>) => {
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
            {/* Header with sub-tabs and actions */}
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
                    disabled={unassignedCount === 0}
                >
                    <Shuffle className="w-4 h-4" />
                    Auto-assign
                    {unassignedCount > 0 && (
                        <span className="text-xs opacity-70">({unassignedCount})</span>
                    )}
                </Button>
            </div>

            {/* Overview Tab */}
            {activeSubTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in-50">
                    {/* Partner Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {partnersWithStats.map(partner => (
                            <PartnerOverviewCard
                                key={partner.id}
                                partner={partner}
                            />
                        ))}
                    </div>

                    {/* Summary Stats */}
                    <div className="flex items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
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

                    {/* Partner Directory CTA */}
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

            {/* Assignments Tab */}
            {activeSubTab === 'assignments' && (
                <div className="animate-in fade-in-50">
                    <PartnerAssignmentsView
                        companies={companies}
                        partners={partnersWithStats}
                        onAssign={handleAssign}
                        onCompanyClick={onCompanyClick}
                    />
                </div>
            )}

            {/* Auto-assign Dialog */}
            <AutoAssignDialog
                companies={companies}
                partners={partnersWithStats}
                open={autoAssignDialogOpen}
                onClose={() => setAutoAssignDialogOpen(false)}
                onConfirm={handleAutoAssign}
            />
        </div>
    );
}
