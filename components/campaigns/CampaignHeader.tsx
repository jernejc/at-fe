'use client';

import Link from 'next/link';
import type { CampaignRead } from '@/lib/schemas';
import type { CampaignTab } from '@/hooks/useCampaignPage';
import { 
    Loader2, Building2, ChevronRight, Trash2, Send, TrendingUp, Users, BarChart3,
    Calendar, Target, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CampaignHeaderProps {
    campaign: CampaignRead;
    activeTab: CampaignTab;
    onTabChange: (tab: CampaignTab) => void;
    onDelete: () => void;
    isDeleting: boolean;
    /** Publish the campaign (changes status from draft to published) */
    onPublish?: () => void;
    isPublishing?: boolean;
    /** Override company count (for dynamic filter campaigns) */
    companyCount?: number;
    /** Number of partners assigned */
    partnerCount?: number;
}

// Format date range for display
function formatDateRange(startDate?: string | null, endDate?: string | null): string {
    if (!startDate && !endDate) return 'No date set';
    
    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();
        
        if (startYear === endYear) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
        return `${formatDate(startDate)}, ${startYear} - ${formatDate(endDate)}, ${endYear}`;
    }
    
    return startDate ? `From ${formatDate(startDate)}` : `Until ${formatDate(endDate!)}`;
}

export function CampaignHeader({
    campaign,
    activeTab,
    onTabChange,
    onDelete,
    isDeleting,
    onPublish,
    isPublishing = false,
    companyCount,
    partnerCount,
}: CampaignHeaderProps) {
    // Use provided count or fall back to campaign data
    const displayCompanyCount = companyCount ?? campaign.company_count;
    const displayPartnerCount = partnerCount ?? 0;
    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;

    // Mock target value (can be replaced with actual campaign target)
    const targetValue = '€2.5M';
    
    // Format dates
    const dateRange = formatDateRange(campaign.created_at, null);

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="px-6 pt-6 pb-0 max-w-[1600px] mx-auto w-full">
                {/* Breadcrumb */}
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/campaigns" className="hover:text-foreground transition-colors">Campaigns</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-foreground">{campaign.name}</span>
                </div>

                {/* Title Row */}
                <div className="flex gap-6 items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {campaign.name}
                            </h1>
                            <Badge
                                variant={campaign.status === 'published' ? 'default' : 'secondary'}
                                className={`capitalize px-2.5 py-0.5 text-xs font-semibold ${campaign.status === 'published'
                                    ? 'bg-emerald-500 hover:bg-emerald-500 text-white border-0'
                                    : ''
                                }`}
                            >
                                {campaign.status === 'published' ? 'Active' : campaign.status}
                            </Badge>
                        </div>

                        {/* Campaign Meta Strip */}
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{dateRange}</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{displayPartnerCount} Partners Enrolled</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex items-center gap-1.5 relative group">
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <Target className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-slate-400 font-medium">Target: —</span>
                                </div>
                                <span className="text-[10px] text-slate-400 italic" title="Waiting for partner data">
                                    (pending)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export Report
                        </Button>
                        
                        {/* Divider */}
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
                        
                        {campaign.status === 'draft' && onPublish && (
                            <Button
                                variant="default"
                                size="sm"
                                className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700"
                                onClick={onPublish}
                                disabled={isPublishing}
                            >
                                {isPublishing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Publish
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                <div className="pt-5">
                    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as CampaignTab)} className="w-full">
                        <TabsList variant="line" className="w-full justify-start gap-6">
                            <TabsTrigger value="performance">
                                <TrendingUp className="w-4 h-4" />
                                Performance
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
