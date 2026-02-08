"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { AccountCard, AccountCardSkeleton } from "./AccountCard";
import { ProductNavigation } from "./ProductNavigation";
import { Pagination } from "@/components/ui/pagination";
import {
    getProducts,
    getProductCandidates,
    getCompanies,
    getCampaigns,
    addCompaniesBulk,
} from "@/lib/api";
import type {
    ProductSummary,
    CandidateFitSummary,
    CompanySummary,
    CampaignSummary,
} from "@/lib/schemas";
import { Loader2, Plus, FolderPlus, Building2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type ScoreFilter = "all" | "hot" | "warm" | "cold";

function isAbortError(error: unknown): boolean {
    return (
        (error instanceof DOMException && error.name === "AbortError") ||
        (error instanceof Error && error.name === "AbortError")
    );
}

// Unified account type for display
interface AccountItem {
    company_id: number;
    company_domain: string;
    company_name: string;
    industry: string | null;
    employee_count: number | null;
    hq_country: string | null;
    logo_url: string | null;
    combined_score: number | null;
    urgency_score: number | null;
    top_drivers: string[] | null;
    calculated_at: string | null;
    top_contact: {
        full_name: string;
        current_title: string | null;
        avatar_url: string | null;
    } | null;
}

interface AccountListProps {
    productGroup?: string;
    onAccountClick?: (account: AccountItem) => void;
    hideHeader?: boolean;
    compact?: boolean;
}

export function AccountList(props: AccountListProps) {
    const { onAccountClick, hideHeader = false } = props;
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [accounts, setAccounts] = useState<AccountItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(100);

    // Add to Campaign State
    const [showAddToCampaign, setShowAddToCampaign] = useState(false);
    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);

    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
        null
    );
    const [addingToCampaign, setAddingToCampaign] = useState(false);

    // Fetch products on mount
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            setError(null);

            try {
                const productsRes = await getProducts(1, 100);
                setProducts(productsRes.items);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to fetch products"
                );
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    // Fetch accounts when product selection or page changes
    useEffect(() => {
        const controller = new AbortController();

        async function fetchAccounts() {
            setLoadingAccounts(true);
            setError(null);

            try {
                if (selectedProductId === "all") {
                    // Fetch all companies
                    const response = await getCompanies({
                        page,
                        page_size: pageSize,
                        sort_by: "updated_at",
                        sort_order: "desc",
                    }, { signal: controller.signal });

                    // Map CompanySummary to AccountItem
                    const items: AccountItem[] = response.items.map((company: CompanySummary) => ({
                        company_id: company.id,
                        company_domain: company.domain,
                        company_name: company.name,
                        industry: company.industry,
                        employee_count: company.employee_count,
                        hq_country: company.hq_country,
                        logo_url: company.logo_url || (company.logo_base64
                            ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
                            : null),
                        combined_score: null,
                        urgency_score: null,
                        top_drivers: null,
                        calculated_at: company.updated_at,
                        top_contact: company.top_contact ? {
                            full_name: company.top_contact.full_name,
                            current_title: company.top_contact.current_title,
                            avatar_url: company.top_contact.avatar_url,
                        } : null,
                    }));

                    setAccounts(items);
                    setTotalCount(response.total);
                } else {
                    // Fetch candidates for specific product
                    const productId = Number(selectedProductId);
                    const response = await getProductCandidates(productId, {
                        page,
                        page_size: pageSize,
                    }, { signal: controller.signal });

                    // Map CandidateFitSummary to AccountItem
                    const items: AccountItem[] = response.candidates.map((candidate: CandidateFitSummary) => ({
                        company_id: candidate.company_id,
                        company_domain: candidate.company_domain,
                        company_name: candidate.company_name,
                        industry: candidate.industry || null,
                        employee_count: candidate.employee_count || null,
                        hq_country: candidate.hq_country || null,
                        logo_url: candidate.logo_url || (candidate.logo_base64
                            ? (candidate.logo_base64.startsWith('data:') ? candidate.logo_base64 : `data:image/png;base64,${candidate.logo_base64}`)
                            : null),
                        combined_score: candidate.combined_score,
                        urgency_score: candidate.urgency_score,
                        top_drivers: candidate.top_drivers,
                        calculated_at: candidate.calculated_at,
                        top_contact: candidate.top_contact ? {
                            full_name: candidate.top_contact.full_name,
                            current_title: candidate.top_contact.current_title || null,
                            avatar_url: candidate.top_contact.avatar_url || null,
                        } : null,
                    }));

                    setAccounts(items);
                    setTotalCount(response.total);
                }
            } catch (err) {
                if (isAbortError(err)) {
                    return;
                }
                setError(
                    err instanceof Error ? err.message : "Failed to fetch accounts"
                );
                console.error("Error fetching accounts:", err);
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingAccounts(false);
                }
            }
        }

        fetchAccounts();

        return () => {
            controller.abort();
        };
    }, [selectedProductId, page, pageSize]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [selectedProductId, scoreFilter, searchQuery]);

    // Filter and sort accounts
    const filteredAccounts = useMemo(() => {
        const result = accounts.filter((account) => {
            // Score filter (only apply if we have scores)
            if (account.combined_score !== null) {
                const score = Math.round(account.combined_score * 100);
                if (scoreFilter === "hot" && score < 80) return false;
                if (scoreFilter === "warm" && (score < 60 || score >= 80)) return false;
                if (scoreFilter === "cold" && score >= 60) return false;
            } else if (scoreFilter !== "all") {
                // If no score and filter is not "all", exclude
                return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = account.company_name.toLowerCase().includes(query);
                const matchesIndustry = account.industry?.toLowerCase().includes(query);
                const matchesLocation = account.hq_country?.toLowerCase().includes(query);
                if (!matchesName && !matchesIndustry && !matchesLocation) return false;
            }

            return true;
        });

        // Sort by score descending if available, otherwise by name
        return result.sort((a, b) => {
            if (a.combined_score !== null && b.combined_score !== null) {
                return b.combined_score - a.combined_score;
            }
            if (a.combined_score !== null) return -1;
            if (b.combined_score !== null) return 1;
            return a.company_name.localeCompare(b.company_name);
        });
    }, [accounts, scoreFilter, searchQuery]);

    // Count by score category
    const scoreCounts = useMemo(() => {
        const counts = { all: accounts.length, hot: 0, warm: 0, cold: 0 };
        accounts.forEach((account) => {
            if (account.combined_score !== null) {
                const score = Math.round(account.combined_score * 100);
                if (score >= 80) counts.hot++;
                else if (score >= 60) counts.warm++;
                else counts.cold++;
            }
        });
        return counts;
    }, [accounts]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredAccounts.map((a) => a.company_id)));
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

    // Handle Add to Campaign
    useEffect(() => {
        if (showAddToCampaign) {
            getCampaigns({ page: 1, page_size: 100 }).then((res) => {
                setCampaigns(res.items);
            });
        }
    }, [showAddToCampaign]);

    const handleAddToCampaign = async () => {
        if (!selectedCampaignId || selectedIds.size === 0) return;

        setAddingToCampaign(true);
        try {
            const selectedDomains = filteredAccounts
                .filter((a) => selectedIds.has(a.company_id))
                .map((a) => a.company_domain);

            const result = await addCompaniesBulk(
                selectedCampaignId,
                selectedDomains
            );

            alert(
                `✅ Successfully added ${result.added} companies to the campaign.\n` +
                (result.skipped > 0 ? `(${result.skipped} were already defined)` : "")
            );

            setShowAddToCampaign(false);
            setSelectedIds(new Set());
            setSelectedCampaignId(null);
        } catch (err) {
            console.error("Error adding to campaign:", err);
            alert("❌ Failed to add companies to campaign");
        } finally {
            setAddingToCampaign(false);
        }
    };

    // Navigate to create campaign wizard
    const handleNewCampaign = () => {
        // Navigate to the create wizard with product preselection if available
        const productParam = selectedProductId !== "all" ? `?product=${selectedProductId}` : '';
        window.location.href = `/campaigns/new${productParam}`;
    };

    const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);
    const isInitialLoading = loading || (loadingAccounts && accounts.length === 0);
    const isRefreshingPage = loadingAccounts && accounts.length > 0;

    const isAllAccounts = selectedProductId === "all";

    return (
        <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/10">
            {/* 1. Main Application Header */}
            {!hideHeader && <Header />}

            {/* 1.5. Product Navigation - Glass morphism style */}
            <ProductNavigation
                products={products}
                selectedProductId={selectedProductId}
                onSelectProduct={setSelectedProductId}
                loading={loading}
            />

            {/* 2. Control & Filter Bar - Refined */}
            <div className="relative border-b border-border/30 z-10 shrink-0 bg-gradient-to-r from-slate-50/90 via-white/80 to-slate-50/90 dark:from-slate-900/90 dark:via-slate-950/80 dark:to-slate-900/90">
                <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-3 relative">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-sm group">
                        <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg border border-border/60 group-focus-within:border-blue-400/60 group-focus-within:ring-2 group-focus-within:ring-blue-500/10 transition-all duration-200 shadow-sm" />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-blue-500 transition-colors duration-200 z-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <Input
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative bg-transparent border-transparent focus:ring-0 focus:border-transparent pl-9 h-9 placeholder:text-muted-foreground/50 text-sm"
                        />
                    </div>

                    {/* Filter Pills */}
                    <Tabs
                        value={scoreFilter}
                        onValueChange={(v) => setScoreFilter(v as ScoreFilter)}
                        className="w-auto"
                    >
                        <TabsList className="h-9 bg-slate-100/60 dark:bg-slate-800/40 p-0.5 border border-border/30 rounded-lg gap-0.5">
                            <TabsTrigger value="all" className="text-xs px-3 h-full font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all duration-200">
                                All
                                <span className="ml-1.5 text-muted-foreground/70 tabular-nums">
                                    {scoreCounts.all}
                                </span>
                            </TabsTrigger>
                            {!isAllAccounts && (
                                <>
                                    <TabsTrigger
                                        value="hot"
                                        className="text-xs px-3 h-full font-medium rounded-md data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                        Hot
                                        <span className="ml-1.5 opacity-60 tabular-nums">{scoreCounts.hot}</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="warm"
                                        className="text-xs px-3 h-full font-medium rounded-md data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                                        Warm
                                        <span className="ml-1.5 opacity-60 tabular-nums">{scoreCounts.warm}</span>
                                    </TabsTrigger>
                                </>
                            )}
                        </TabsList>
                    </Tabs>

                    {/* Action Area */}
                    <div className="ml-auto pl-3 border-l border-border/40">
                        {selectedIds.size === 0 ? (
                            <div className="text-xs text-muted-foreground/50 font-medium flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded border border-dashed border-muted-foreground/30" />
                                Select to act
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/60 rounded-lg p-0.5">
                                <Button
                                    onClick={handleNewCampaign}
                                    size="sm"
                                    className="gap-1.5 h-7 text-xs shadow-sm hover:shadow transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    <Plus className="w-3 h-3" />
                                    New Campaign
                                </Button>
                                <div className="h-5 w-px bg-blue-200/60 dark:bg-blue-800/60" />
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowAddToCampaign(true)}
                                    size="sm"
                                    className="gap-1.5 h-7 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 rounded-md"
                                >
                                    <FolderPlus className="w-3 h-3" />
                                    Add to Existing
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add to Campaign Dialog */}
            <Dialog open={showAddToCampaign} onOpenChange={setShowAddToCampaign}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add to Campaign</DialogTitle>
                        <DialogDescription>
                            Add {selectedIds.size} selected companies to an existing campaign.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Select Campaign</Label>
                            <Select
                                value={selectedCampaignId || ""}
                                onValueChange={setSelectedCampaignId}
                            >
                                <SelectTrigger>
                                    <SelectValue>Select a campaign...</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {campaigns.map((c) => (
                                        <SelectItem key={c.slug} value={c.slug}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddToCampaign(false)}
                            disabled={addingToCampaign}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddToCampaign}
                            disabled={!selectedCampaignId || addingToCampaign}
                        >
                            {addingToCampaign && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Add Companies
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Bar - Minimal */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/20 shrink-0">
                <div className="max-w-[1600px] mx-auto px-6 py-1 flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer transition-all"
                            checked={
                                filteredAccounts.length > 0 &&
                                selectedIds.size === filteredAccounts.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            disabled={filteredAccounts.length === 0}
                        />
                        <span className="uppercase tracking-wide">
                            {isAllAccounts ? "By Last Updated" : "By Fit Score"}
                        </span>
                        {selectedProduct && (
                            <span className="text-blue-500/80">• {selectedProduct.name}</span>
                        )}
                    </div>
                    <span className="tabular-nums">
                        {totalCount > 0 ? (
                            <>
                                {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} results
                            </>
                        ) : (
                            "0 results"
                        )}
                    </span>
                </div>
            </div>

            {/* Account List */}
            <div className="flex-1 overflow-auto bg-white/50 dark:bg-slate-950/20 relative">
                <div className="max-w-[1600px] mx-auto min-h-full border-x border-border/40 bg-white dark:bg-slate-900/50 relative">
                    <div
                        aria-busy={isRefreshingPage}
                        className={isRefreshingPage
                            ? "transition-opacity duration-200 opacity-70"
                            : "transition-opacity duration-200 opacity-100"
                        }
                    >
                    {isInitialLoading ? (
                        <div>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <AccountCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-destructive">
                            <p>{error}</p>
                        </div>
                    ) : filteredAccounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 text-muted-foreground gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-900/20 dark:to-slate-800/20 rounded-full blur-xl opacity-60" />
                                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-border/30">
                                    <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                </div>
                            </div>
                            <div className="text-center space-y-1.5">
                                <p className="font-semibold text-foreground/80">
                                    {isAllAccounts ? "No accounts yet" : "No matches found"}
                                </p>
                                <p className="text-sm text-muted-foreground/60 max-w-[280px]">
                                    {isAllAccounts
                                        ? "Add your first company to get started with discovery"
                                        : "Try adjusting your filters or search query"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredAccounts.map((account) => (
                            <AccountCard
                                key={account.company_id}
                                account={account}
                                selected={selectedIds.has(account.company_id)}
                                onSelect={(selected) => handleSelect(account.company_id, selected)}
                                onClick={() => onAccountClick?.(account)}
                            />
                        ))
                    )}
                    </div>
                </div>

                {/* Pagination Controls - Always visible when there's data */}
                {!loading && totalCount > 0 && (
                    <Pagination
                        currentPage={page}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        disabled={loadingAccounts}
                    />
                )}
            </div>

            {/* Fixed loading status - stays visible during list scroll and does not affect layout */}
            {isRefreshingPage && (
                <div className="pointer-events-none fixed bottom-20 right-6 md:right-10 z-40">
                    <div className="rounded-full border border-blue-200/70 dark:border-blue-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 shadow-lg">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Loading page {page}...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
