'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
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
                        product_group: productGroup
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
    }, [productGroup]);

    // Filter and sort companies
    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
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
        <div className="flex flex-col h-full">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <Tabs value={scoreFilter} onValueChange={(v) => setScoreFilter(v as ScoreFilter)}>
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="all" className="data-[state=active]:bg-background">
                            All <span className="ml-1.5 text-muted-foreground">{scoreCounts.all}</span>
                        </TabsTrigger>
                        <TabsTrigger value="hot" className="data-[state=active]:bg-background">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Hot 80+
                            </span>
                            <span className="ml-1.5 text-muted-foreground">{scoreCounts.hot}</span>
                        </TabsTrigger>
                        <TabsTrigger value="warm" className="data-[state=active]:bg-background">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Warm 60-79
                            </span>
                            <span className="ml-1.5 text-muted-foreground">{scoreCounts.warm}</span>
                        </TabsTrigger>
                        <TabsTrigger value="cold" className="data-[state=active]:bg-background">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                Cold &lt;60
                            </span>
                            <span className="ml-1.5 text-muted-foreground">{scoreCounts.cold}</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Avg score: <span className="font-medium text-foreground">79</span></span>
                    <span>Updated 9:40:00 AM</span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <div className="relative flex-1 max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <Input
                        placeholder="Search companies, industries, or signals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <FilterDropdown label="All Industries" />
                    <FilterDropdown label="All..." />
                    <FilterDropdown label="Intent..." />
                    <FilterDropdown label="Desc" />
                    <FilterDropdown label="Compact" />
                </div>

                <label className="flex items-center gap-2 ml-auto cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedIds.size === filteredCompanies.length && filteredCompanies.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">Select all</span>
                </label>
            </div>

            {/* Results Summary */}
            <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border bg-muted/30">
                Showing {filteredCompanies.length} of {totalCount} companies
                <span className="mx-2">•</span>
                <span className="text-emerald-600">{scoreCounts.hot} hot</span>
                <span className="mx-1">•</span>
                <span className="text-amber-600">{scoreCounts.warm} warm</span>
                <span className="mx-1">•</span>
                <span>{companies.filter(c => (playbooks[c.id]?.fit_score || 0) > 0).length} with signals</span>
            </div>

            {/* Account List */}
            <div className="flex-1 overflow-auto">
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
                            signals={['Growth', 'critical', '+2 more']}
                            selected={selectedIds.has(company.id)}
                            onSelect={(selected) => handleSelect(company.id, selected)}
                            onClick={() => onAccountClick?.(company)}
                        />
                    ))
                )}
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
