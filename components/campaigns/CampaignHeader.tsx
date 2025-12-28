'use client';

import Link from 'next/link';
import type { CampaignRead, CampaignFilterUI } from '@/lib/schemas';
import { Loader2, Building2, ChevronRight, Download, Settings, Trash2, Calendar, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterBar } from './FilterBar';

interface CampaignHeaderProps {
    campaign: CampaignRead;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onDelete: () => void;
    isDeleting: boolean;
    filters: CampaignFilterUI[];
    onFiltersChange: (filters: CampaignFilterUI[]) => void;
    isSavingFilters?: boolean;
    // Dynamic company data from filters
    dynamicCompanyCount?: number;
    loadingDynamicCompanies?: boolean;
}

export function CampaignHeader({
    campaign,
    activeTab,
    onTabChange,
    onDelete,
    isDeleting,
    filters,
    onFiltersChange,
    isSavingFilters,
    dynamicCompanyCount,
    loadingDynamicCompanies,
}: CampaignHeaderProps) {
    // Use dynamic count if filters are active, otherwise use campaign count
    const useDynamic = filters.length > 0 && dynamicCompanyCount !== undefined;
    const displayCompanyCount = useDynamic ? dynamicCompanyCount : campaign.company_count;

    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;
    const progressPercent = Math.round((campaign.processed_count / Math.max(campaign.company_count, 1)) * 100);

    return (
        <div className="relative group border-b border-border/60 bg-white dark:bg-slate-900">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-blue-900/10 pointer-events-none" />

            <div className="relative px-6 pt-12 pb-0 max-w-[1600px] mx-auto w-full">
                <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
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

                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    {loadingDynamicCompanies ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                                    ) : (
                                        <span className="text-foreground font-medium">{displayCompanyCount}</span>
                                    )}
                                    <span>{useDynamic ? 'matching' : 'companies'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    <span className="text-foreground font-medium">{progressPercent}%</span>
                                    <span>analyzed</span>
                                </div>
                                {avgFitScore && (
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-amber-500" />
                                        <span className="text-foreground font-medium">{avgFitScore}%</span>
                                        <span>avg fit</span>
                                    </div>
                                )}
                            </div>

                            {campaign.description && (
                                <p className="text-sm text-muted-foreground pt-4 max-w-3xl leading-relaxed">
                                    {campaign.description}
                                </p>
                            )}

                            {/* Filter Bar */}
                            <div className="pt-4 flex items-center gap-3">
                                <FilterBar
                                    filters={filters}
                                    onFiltersChange={onFiltersChange}
                                    disabled={isSavingFilters}
                                />
                                {isSavingFilters && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 shrink-0 pt-1">
                        <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm bg-white dark:bg-slate-900">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm bg-white dark:bg-slate-900">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/30 dark:hover:bg-red-900/30 dark:text-red-400 bg-white dark:bg-slate-900"
                            onClick={onDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="pt-8">
                    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                        <div className="w-full border-b border-border">
                            <TabsList variant="line" className="w-full justify-start gap-8">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="companies">
                                    Companies
                                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        {loadingDynamicCompanies ? '...' : displayCompanyCount}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="partners">Partners</TabsTrigger>
                                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
