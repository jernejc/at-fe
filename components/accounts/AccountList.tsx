'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { AccountCard, AccountCardSkeleton } from './AccountCard';
import {
    getCompanies,
    getPlaybooks,
    getProducts,
    calculateFits,
    PRODUCT_GROUPS
} from '@/lib/api';
import type {
    CompanySummary,
    PlaybookSummary,
    CompanyFilters,
    ProductSummary,
} from '@/lib/schemas';
import { Loader2, Plus, Sparkles } from 'lucide-react';

type ScoreFilter = 'all' | 'hot' | 'warm' | 'cold';

interface AccountListProps {
    productGroup?: string;
    onAccountClick?: (company: CompanySummary) => void;
}

export function AccountList({ productGroup, onAccountClick }: AccountListProps) {
    const [companies, setCompanies] = useState<CompanySummary[]>([]);
    const [playbooks, setPlaybooks] = useState<Record<number, PlaybookSummary>>({});
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeProductGroup, setActiveProductGroup] = useState<string>('all');
    const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [calculatingFit, setCalculatingFit] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Fetch companies, playbooks, and products
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

                const [companiesRes, playbooksRes, productsRes] = await Promise.all([
                    getCompanies(filters),
                    getPlaybooks({
                        page_size: 100,
                        product_group: activeProductGroup === 'all' ? undefined : activeProductGroup
                    }),
                    getProducts(1, 100),
                ]);

                setCompanies(companiesRes.items);
                setTotalCount(companiesRes.total);
                setProducts(productsRes.items);

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

    // Export filtered companies to CSV
    const handleExport = () => {
        const headers = ['Name', 'Domain', 'Industry', 'Location', 'Employees', 'Fit Score', 'Urgency', 'Updated'];
        const rows = filteredCompanies.map(company => {
            const playbook = playbooks[company.id];
            const location = company.hq_city ? `${company.hq_city}${company.hq_country ? ', ' + company.hq_country : ''}` : '';
            return [
                company.name,
                company.domain,
                company.industry || '',
                location,
                company.employee_count?.toString() || '',
                playbook?.fit_score ? Math.round(playbook.fit_score * 100).toString() : '',
                playbook?.fit_urgency?.toString() || '',
                company.updated_at || ''
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `accounts-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle Calculate Fit
    const handleCalculateFit = async () => {
        if (selectedIds.size === 0 || activeProductGroup === 'all') return;

        // Debug: Log available products and active group
        console.log('Active product group:', activeProductGroup);
        console.log('Available products:', products.map(p => ({ id: p.id, name: p.name, category: p.category })));

        // Find the product ID for the active product group
        // Try matching by category first, then by product group name
        let product = products.find(p => p.category === activeProductGroup);

        if (!product) {
            // Try to find by matching product group name with product name or category
            const productGroupInfo = PRODUCT_GROUPS.find(g => g.id === activeProductGroup);
            if (productGroupInfo) {
                product = products.find(p =>
                    p.name.toLowerCase().includes(productGroupInfo.name.toLowerCase()) ||
                    p.category?.toLowerCase().includes(productGroupInfo.name.toLowerCase())
                );
            }
        }

        if (!product) {
            alert(
                `Could not find product for the selected group "${activeProductGroup}".\n\n` +
                `Available products:\n${products.map(p => `- ${p.name} (category: ${p.category || 'none'})`).join('\n')}\n\n` +
                `Please check the console for more details.`
            );
            return;
        }

        console.log('Selected product:', product);

        setCalculatingFit(true);
        try {
            const selectedDomains = filteredCompanies
                .filter(c => selectedIds.has(c.id))
                .map(c => c.domain);

            // Make individual API calls for each company
            // The API supports: specific company × specific product (domain + product_id)
            console.log(`Calculating fits for ${selectedDomains.length} companies with product ${product.name}...`);

            let totalCalculated = 0;
            let totalSkipped = 0;
            let totalDuration = 0;

            for (const domain of selectedDomains) {
                try {
                    const result = await calculateFits({
                        domain: domain,
                        product_id: product.id,
                        force: false,
                    });
                    totalCalculated += result.companies_calculated;
                    totalSkipped += result.companies_skipped;
                    totalDuration += result.duration_seconds;
                } catch (err) {
                    console.error(`Failed to calculate fit for ${domain}:`, err);
                }
            }

            alert(
                `✅ Fit calculation complete!\n\n` +
                `Product: ${product.name}\n` +
                `Companies processed: ${selectedDomains.length}\n` +
                `Companies calculated: ${totalCalculated}\n` +
                `Companies skipped: ${totalSkipped}\n` +
                `Total duration: ${totalDuration.toFixed(2)}s`
            );

            // Clear selection after successful calculation
            setSelectedIds(new Set());
        } catch (err) {
            console.error('Error calculating fits:', err);
            alert('❌ Failed to calculate fits: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setCalculatingFit(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/10">

            {/* 1. Main Application Header - "LookAcross" Brand + Product Tabs */}
            <Header />

            {/* 1.5. Product Group Navigation - Context Switching (Scrollable) */}
            <div className="bg-white dark:bg-slate-900 border-b border-border/60 z-10 relative">
                {/* Fade gradient on right edge for scroll indication */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />

                <div className="max-w-[1600px] mx-auto px-6 overflow-x-auto scrollbar-hide">
                    <Tabs value={activeProductGroup} onValueChange={setActiveProductGroup} className="w-max min-w-full">
                        <TabsList className="bg-transparent h-auto p-0 gap-6 w-max justify-start rounded-none" style={{ border: 'none' }}>
                            <TabsTrigger
                                value="all"
                                className="relative h-12 rounded-none px-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
                                style={{
                                    border: 'none',
                                    borderBottom: activeProductGroup === 'all' ? '2px solid #2563eb' : '2px solid transparent',
                                    color: activeProductGroup === 'all' ? '#2563eb' : undefined,
                                    background: 'transparent',
                                    boxShadow: 'none',
                                    outline: 'none'
                                }}
                            >
                                All Accounts
                            </TabsTrigger>
                            {PRODUCT_GROUPS.map((group) => (
                                <TabsTrigger
                                    key={group.id}
                                    value={group.id}
                                    className="relative h-12 rounded-none px-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-all whitespace-nowrap group"
                                    style={{
                                        border: 'none',
                                        borderBottom: activeProductGroup === group.id ? `2px solid ${group.color}` : '2px solid transparent',
                                        color: activeProductGroup === group.id ? group.color : undefined,
                                        background: 'transparent',
                                        boxShadow: 'none',
                                        outline: 'none'
                                    }}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full mr-2 transition-all group-hover:scale-110"
                                        style={{
                                            backgroundColor: group.color,
                                            opacity: activeProductGroup === group.id ? 1 : 0.5
                                        }}
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

                    {/* Filter Tabs with Counts */}
                    <Tabs value={scoreFilter} onValueChange={(v) => setScoreFilter(v as ScoreFilter)} className="w-auto">
                        <TabsList className="h-10 bg-slate-100/50 dark:bg-slate-800/50 p-1 border border-border/50">
                            <TabsTrigger value="all" className="text-xs px-3 font-medium">
                                All <span className="ml-1.5 text-muted-foreground">({scoreCounts.all})</span>
                            </TabsTrigger>
                            <TabsTrigger value="hot" className="text-xs px-3 font-medium text-emerald-700 dark:text-emerald-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/20 data-[state=active]:shadow-none">
                                Hot <span className="ml-1.5 opacity-70">({scoreCounts.hot})</span>
                            </TabsTrigger>
                            <TabsTrigger value="warm" className="text-xs px-3 font-medium text-amber-700 dark:text-amber-400 data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20 data-[state=active]:shadow-none">
                                Warm <span className="ml-1.5 opacity-70">({scoreCounts.warm})</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Action Buttons - Compact Group */}
                    <div className="ml-auto pl-4 border-l border-border/60">
                        {selectedIds.size === 0 ? (
                            <div className="text-xs text-muted-foreground font-medium">
                                Select companies to take action
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-1">
                                {/* Primary Action - New Campaign */}
                                <Button
                                    onClick={() => {
                                        const selectedDomains = filteredCompanies
                                            .filter(c => selectedIds.has(c.id))
                                            .map(c => c.domain)
                                            .join(',');
                                        window.location.href = `/campaigns/new?domains=${encodeURIComponent(selectedDomains)}`;
                                    }}
                                    size="sm"
                                    className="gap-1.5 h-8 shadow-sm hover:shadow transition-all bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    New Campaign ({selectedIds.size})
                                </Button>

                                {/* Divider */}
                                <div className="h-6 w-px bg-blue-200 dark:bg-blue-800" />

                                {/* Secondary Action - Calculate Fit */}
                                <button
                                    onClick={handleCalculateFit}
                                    disabled={activeProductGroup === 'all' || calculatingFit}
                                    className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                    title={activeProductGroup === 'all' ? 'Select a product group to calculate fit' : 'Calculate fit scores'}
                                >
                                    {calculatingFit ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Calculate Fit
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
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
