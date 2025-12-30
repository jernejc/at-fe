'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCompactNumber } from '@/lib/utils';
import {
    LayoutDashboard,
    Sparkles,
    BookOpen,
    Users,
    Briefcase,
    Newspaper,
    Bell,
} from 'lucide-react';

interface TabCounts {
    playbooks: number;
    employees: number;
    jobs: number;
    news: number;
    updates: number;
}

interface AccountDetailTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    counts: TabCounts;
    hasExplainability: boolean;
}

function CountBadge({ count }: { count: number }) {
    return (
        <span className="ml-1.5 text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
            {formatCompactNumber(count)}
        </span>
    );
}

export function AccountDetailTabs({
    activeTab,
    onTabChange,
    counts,
    hasExplainability,
}: AccountDetailTabsProps) {
    const hasPlaybooks = counts.playbooks > 0;
    const hasPeople = counts.employees > 0;
    const hasJobs = counts.jobs > 0;
    const hasNews = counts.news > 0;
    const hasUpdates = counts.updates > 0;

    return (
        <div className="border-b bg-background sticky top-0 z-30">
            <div className="max-w-7xl mx-auto w-full px-6">
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <TabsList variant="line" className="h-12 w-full justify-around">
                        <TabsTrigger value="overview" className="gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </TabsTrigger>

                        {hasExplainability && (
                            <TabsTrigger value="explainability" className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                Explainability
                            </TabsTrigger>
                        )}

                        <TabsTrigger value="playbooks" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            Playbooks
                            {hasPlaybooks && <CountBadge count={counts.playbooks} />}
                        </TabsTrigger>

                        {hasPeople && (
                            <TabsTrigger value="people" className="gap-2">
                                <Users className="w-4 h-4" />
                                People
                                <CountBadge count={counts.employees} />
                            </TabsTrigger>
                        )}

                        {hasJobs && (
                            <TabsTrigger value="jobs" className="gap-2">
                                <Briefcase className="w-4 h-4" />
                                Jobs
                                <CountBadge count={counts.jobs} />
                            </TabsTrigger>
                        )}

                        {hasNews && (
                            <TabsTrigger value="news" className="gap-2">
                                <Newspaper className="w-4 h-4" />
                                News
                                <CountBadge count={counts.news} />
                            </TabsTrigger>
                        )}

                        {hasUpdates && (
                            <TabsTrigger value="updates" className="gap-2">
                                <Bell className="w-4 h-4" />
                                Updates
                                <CountBadge count={counts.updates} />
                            </TabsTrigger>
                        )}
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}
