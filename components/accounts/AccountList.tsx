'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/ui/Header';
import { AccountCard, AccountCardSkeleton } from './AccountCard';
import {
    getCompanies,
    getPlaybooks,
    PRODUCT_GROUPS
} from '@/lib/api';
import type {
    CompanySummary,
    PlaybookSummary,
    CompanyFilters,
} from '@/lib/schemas';

type ScoreFilter = 'all' | 'hot' | 'warm' | 'cold';

interface AccountListProps {
    productGroup?: string;
    onAccountClick?: (company: CompanySummary) => void;
}

export function AccountList({ productGroup, onAccountClick }: AccountListProps) {
    const [companies, setCompanies] = useState<CompanySummary[]>([]);
    const [playbooks, setPlaybooks] = useState<Record<number, PlaybookSummary>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeProductGroup, setActiveProductGroup] = useState<string>('all');
    const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [totalCount, setTotalCount] = useState(0);

    // Fetch companies and playbooks
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const filters: CompanyFilters = {
                    page: 1,
                    page_size: 50,
                    sort_by: 'updated_at',
                    sort_order: 'desc',
                };

                const [companiesRes, playbooksRes] = await Promise.all([
                    getCompanies(filters),
                    getPlaybooks({
                        page_size: 100,
                        product_group: activeProductGroup === 'all' ? undefined : activeProductGroup
                    }),
                ]);

                setCompanies(companiesRes.items);
                setTotalCount(companiesRes.total);

                // Create lookup map for playbooks by company_id
                const playbookMap: Record<number, PlaybookSummary> = {};
                playbooksRes.items.forEach(pb => {
                    // Use highest fit score if multiple playbooks for same company
                    if (!playbookMap[pb.company_id] || (pb.fit_score || 0) > (playbookMap[pb.company_id].fit_score || 0)) {
                        playbookMap[pb.company_id] = pb;
                    }
                });
                setPlaybooks(playbookMap);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
                console.error('Error fetching accounts:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [activeProductGroup]);

    // Filter and sort companies
    const filteredCompanies = useMemo(() => {
        const result = companies.filter(company => {
            const playbook = playbooks[company.id];
            const score = Math.round((playbook?.fit_score || 0) * 100);

            // Score filter
            if (scoreFilter === 'hot' && score < 80) return false;
            if (scoreFilter === 'warm' && (score < 60 || score >= 80)) return false;
            if (scoreFilter === 'cold' && score >= 60) return false;

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = company.name.toLowerCase().includes(query);
                const matchesIndustry = company.industry?.toLowerCase().includes(query);
                const matchesLocation = company.hq_city?.toLowerCase().includes(query) ||
                    company.hq_country?.toLowerCase().includes(query);
                if (!matchesName && !matchesIndustry && !matchesLocation) return false;
            }

            return true;
        });

        // Sort by score descending
        return result.sort((a, b) => {
            const scoreA = (playbooks[a.id]?.fit_score || 0);
            const scoreB = (playbooks[b.id]?.fit_score || 0);
            return scoreB - scoreA;
        });
    }, [companies, playbooks, scoreFilter, searchQuery]);

    // Count by score category
    const scoreCounts = useMemo(() => {
        const counts = { all: companies.length, hot: 0, warm: 0, cold: 0 };
        companies.forEach(company => {
            const playbook = playbooks[company.id];
            const score = Math.round((playbook?.fit_score || 0) * 100);
            if (score >= 80) counts.hot++;
            else if (score >= 60) counts.warm++;
            else counts.cold++;
        });
        return counts;
    }, [companies, playbooks]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredCompanies.map(c => c.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelect = (id: number, selected: boolean) => {
        const newSelected = new Set(selectedIds);
        if (selected) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/10">

            {/* 1. Main Application Header - "LookAcross" Brand + Product Tabs */}
            {/* 1. Main Application Header - "LookAcross" Brand + Product Tabs */}
            <Header />

            {/* 1.5. Product Group Navigation - Context Switching (Dedicated Row) */}
            <div className="bg-white dark:bg-slate-900 border-b border-border/60 z-10">
                <div className="max-w-[1600px] mx-auto px-6">
                    <Tabs value={activeProductGroup} onValueChange={setActiveProductGroup} className="w-full">
                        <TabsList className="bg-transparent h-auto p-0 gap-8 w-full justify-start border-b-0 rounded-none">
                            <TabsTrigger
                                value="all"
                                className="relative h-12 rounded-none border-b-[2px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors shadow-none data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                            >
                                All Accounts
                            </TabsTrigger>
                            {PRODUCT_GROUPS.map((group) => (
                                <TabsTrigger
                                    key={group.id}
                                    value={group.id}
                                    className="relative h-12 rounded-none border-b-[2px] border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors shadow-none data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full mr-2.5 opacity-60 group-hover:opacity-100 transition-opacity"
                                        style={{ backgroundColor: group.color }}
                                    />
                                    {group.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* 2. Control & Filter Bar */}
            <div className="relative border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-10 shrink-0">
                {/* Gradient Background Match */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-blue-900/10 pointer-events-none" />

                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-4 relative">

                    {/* Search Bar - Clean & Distinct */}
                    <div className="relative flex-1 max-w-md group">
                        <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-md shadow-sm border border-border/80 group-focus-within:border-blue-500/50 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all" />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 group-focus-within:text-blue-600 transition-colors z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative bg-transparent border-transparent focus:ring-0 focus:border-transparent pl-10 h-10 placeholder:text-muted-foreground/60 text-sm"
                        />
                    </div>

                    <div className="h-6 w-px bg-border/60 mx-1" />

                    {/* Filter Tabs */}
                    <Tabs value={scoreFilter} onValueChange={(v) => setScoreFilter(v as ScoreFilter)} className="w-auto">
                        <TabsList className="h-10 bg-slate-100/50 dark:bg-slate-800/50 p-1 border border-border/50">
                            <TabsTrigger value="all" className="text-xs px-3 font-medium">All</TabsTrigger>
                            <TabsTrigger value="hot" className="text-xs px-3 font-medium text-emerald-700 dark:text-emerald-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/20 data-[state=active]:shadow-none">Hot</TabsTrigger>
                            <TabsTrigger value="warm" className="text-xs px-3 font-medium text-amber-700 dark:text-amber-400 data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20 data-[state=active]:shadow-none">Warm</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Dropdowns */}
                    <div className="flex items-center gap-2">
                        <FilterDropdown label="Industry" />
                        <FilterDropdown label="More" />
                    </div>

                    <div className="ml-auto pl-4 border-l border-border/60">
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            Save View
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-border/60 shrink-0">
                <div className="max-w-[1600px] mx-auto px-6 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>Sorted by Fit Score</span>
                    </div>
                    <span>{filteredCompanies.length} results</span>
                </div>
            </div>

            {/* Account List */}
            <div className="flex-1 overflow-auto bg-white/50 dark:bg-slate-950/20">
                <div className="max-w-[1600px] mx-auto min-h-full border-x border-border/40 bg-white dark:bg-slate-900/50">
                    {loading ? (
                        <div>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <AccountCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-destructive">
                            <p>{error}</p>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            <p>No accounts found matching your filters</p>
                        </div>
                    ) : (
                        filteredCompanies.map((company) => (
                            <AccountCard
                                key={company.id}
                                company={company}
                                playbook={playbooks[company.id]}
                                keyContact={company.top_contact || undefined}
                                signals={['Growth', 'critical', '+2 more']}
                                selected={selectedIds.has(company.id)}
                                onSelect={(selected) => handleSelect(company.id, selected)}
                                onClick={() => onAccountClick?.(company)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Simple filter dropdown placeholder
function FilterDropdown({ label }: { label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <span>{label}</span>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );
}
