'use client';

import Link from 'next/link';
import type { CampaignRead } from '@/lib/schemas';
import type { CampaignTab } from '@/hooks/useCampaignPage';
import { Loader2, Building2, ChevronRight, Trash2, Target, Activity, LayoutDashboard, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CampaignHeaderProps {
    campaign: CampaignRead;
    activeTab: CampaignTab;
    onTabChange: (tab: CampaignTab) => void;
    onDelete: () => void;
    isDeleting: boolean;
    /** Override company count (for dynamic filter campaigns) */
    companyCount?: number;
    /** Number of partners assigned */
    partnerCount?: number;
}

export function CampaignHeader({
    campaign,
    activeTab,
    onTabChange,
    onDelete,
    isDeleting,
    companyCount,
    partnerCount,
}: CampaignHeaderProps) {
    // Use provided count or fall back to campaign data
    const displayCompanyCount = companyCount ?? campaign.company_count;
    const displayPartnerCount = partnerCount ?? 0;
    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;
    const progressPercent = Math.round((campaign.processed_count / Math.max(displayCompanyCount, 1)) * 100);

    return (
        <div className="relative group border-b border-border/60 bg-white dark:bg-slate-900">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-blue-900/10 pointer-events-none" />

            <div className="relative px-6 pt-8 pb-0 max-w-[1600px] mx-auto w-full">
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/campaigns" className="hover:text-foreground transition-colors">Campaigns</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-foreground">{campaign.name}</span>
                </div>

                <div className="flex gap-6 items-start">
                    <div className="flex-1 min-w-0">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {campaign.name}
                                </h1>
                                <Badge variant="secondary" className="capitalize px-2 py-0.5 pointer-events-none">
                                    {campaign.status}
                                </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-3">
                                <div className="flex items-center gap-2" title="Total Companies">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    <span className="text-foreground font-medium">{displayCompanyCount}</span>
                                    <span>companies</span>
                                </div>

                                {/* Processing Status - Only show if not fully processed */}
                                {displayCompanyCount > 0 && campaign.processed_count < displayCompanyCount && (
                                    <div className="flex items-center gap-2" title="Processing Progress">
                                        <Activity className="w-4 h-4 text-amber-500" />
                                        <span className="text-foreground font-medium">
                                            {Math.round((campaign.processed_count / displayCompanyCount) * 100)}%
                                        </span>
                                        <span>processed</span>
                                    </div>
                                )}

                                {/* Average Fit Score */}
                                {avgFitScore !== null && (
                                    <div className="flex items-center gap-2" title="Average Fit Score">
                                        <Target className="w-4 h-4 text-emerald-500" />
                                        <span className="text-foreground font-medium">{avgFitScore}%</span>
                                        <span>avg fit</span>
                                    </div>
                                )}

                                {/* Owner */}
                                {campaign.owner && (
                                    <div className="flex items-center gap-2" title="Campaign Owner">
                                        <Users className="w-4 h-4 text-indigo-400" />
                                        <span className="text-foreground font-medium">{campaign.owner}</span>
                                    </div>
                                )}

                                {/* Created Date */}
                                <div className="flex items-center gap-2" title={`Created ${new Date(campaign.created_at).toLocaleDateString()}`}>
                                    <BarChart3 className="w-4 h-4 text-slate-400" />
                                    <span>Created {new Date(campaign.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={onDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="pt-6">
                    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as CampaignTab)} className="w-full">
                        <TabsList variant="line" className="w-full justify-start gap-6">
                            <TabsTrigger value="overview">
                                <LayoutDashboard className="w-4 h-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="companies">
                                <Building2 className="w-4 h-4" />
                                Companies
                                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {displayCompanyCount}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="partners">
                                <Users className="w-4 h-4" />
                                Partners
                                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {displayPartnerCount}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="analysis">
                                <BarChart3 className="w-4 h-4" />
                                Analysis
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
