"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { AccountCard, AccountCardSkeleton } from "./AccountCard";
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
import { Loader2, Plus, FolderPlus, Package, Building2 } from "lucide-react";
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

// Color palette for product tabs
const PRODUCT_COLORS = [
    "#8b5cf6", // violet
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
];

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
}

export function AccountList({
    productGroup,
    onAccountClick,
}: AccountListProps) {
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

    // Fetch accounts when product selection changes
    useEffect(() => {
        async function fetchAccounts() {
            setLoadingAccounts(true);
            setError(null);

            try {
                if (selectedProductId === "all") {
                    // Fetch all companies
                    const response = await getCompanies({
                        page: 1,
                        page_size: 100,
                        sort_by: "updated_at",
                        sort_order: "desc",
                    });

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
                        page: 1,
                        page_size: 100,
                    });

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
                setError(
                    err instanceof Error ? err.message : "Failed to fetch accounts"
                );
                console.error("Error fetching accounts:", err);
            } finally {
                setLoadingAccounts(false);
            }
        }

        fetchAccounts();
    }, [selectedProductId]);

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

    const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);

    // Get color for product tab
    const getProductColor = (index: number) => PRODUCT_COLORS[index % PRODUCT_COLORS.length];

    const isAllAccounts = selectedProductId === "all";

    return (
        <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/10">
            {/* 1. Main Application Header */}
            <Header />

            {/* 1.5. Product Navigation - Select Product to View Candidates */}
            <div className="bg-white dark:bg-slate-900 border-b border-border/60 z-10 relative h-12">
                {/* Fade gradient on right edge for scroll indication */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />

                <div className="max-w-[1600px] mx-auto px-6 h-full flex items-stretch justify-between gap-4">
                    <div className="overflow-x-auto overflow-y-hidden scrollbar-hide flex-1 h-full">
                        {loading ? (
                            <div className="flex items-center h-full gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-6 w-32 bg-muted rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <Tabs
                                value={selectedProductId}
                                onValueChange={setSelectedProductId}
                                className="w-max h-full"
                            >
                                <TabsList
                                    className="bg-transparent !h-full p-0 gap-6 w-max rounded-none flex-nowrap"
                                    style={{ border: "none" }}
                                >
                                    {/* All Accounts Tab */}
                                    <TabsTrigger
                                        value="all"
                                        className="relative h-full rounded-none px-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-all whitespace-nowrap flex items-center"
                                        style={{
                                            border: "none",
                                            borderBottom: isAllAccounts
                                                ? "2px solid #2563eb"
                                                : "2px solid transparent",
                                            color: isAllAccounts ? "#2563eb" : undefined,
                                            background: "transparent",
                                            boxShadow: "none",
                                            outline: "none",
                                        }}
                                    >
                                        <Building2 className="w-4 h-4 mr-2" style={{ opacity: isAllAccounts ? 1 : 0.5 }} />
                                        All Accounts
                                    </TabsTrigger>

                                    {/* Product Tabs */}
                                    {products.map((product, index) => {
                                        const color = getProductColor(index);
                                        const isSelected = selectedProductId === product.id.toString();
                                        return (
                                            <TabsTrigger
                                                key={product.id}
                                                value={product.id.toString()}
                                                className="relative !h-full rounded-none px-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-all whitespace-nowrap group flex items-center"
                                                style={{
                                                    border: "none",
                                                    borderBottom: isSelected
                                                        ? `2px solid ${color}`
                                                        : "2px solid transparent",
                                                    color: isSelected ? color : undefined,
                                                    background: "transparent",
                                                    boxShadow: "none",
                                                    outline: "none",
                                                }}
                                            >
                                                <span
                                                    className="w-2 h-2 rounded-full mr-2 transition-all group-hover:scale-110"
                                                    style={{
                                                        backgroundColor: color,
                                                        opacity: isSelected ? 1 : 0.5,
                                                    }}
                                                />
                                                {product.name}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                            </Tabs>
                        )}
                    </div>

                    {/* Add Product Button - Pinned Right */}
                    <div className="pl-4 border-l border-border/60 flex items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => (window.location.href = "/products/new")}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Product</span>
                        </Button>
                    </div>
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
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 group-focus-within:text-blue-600 transition-colors z-10"
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
                            className="relative bg-transparent border-transparent focus:ring-0 focus:border-transparent pl-10 h-10 placeholder:text-muted-foreground/60 text-sm"
                        />
                    </div>

                    <div className="h-6 w-px bg-border/60 mx-1" />

                    {/* Filter Tabs with Counts - Only show Hot/Warm for product views */}
                    <Tabs
                        value={scoreFilter}
                        onValueChange={(v) => setScoreFilter(v as ScoreFilter)}
                        className="w-auto"
                    >
                        <TabsList className="h-10 bg-slate-100/50 dark:bg-slate-800/50 p-1 border border-border/50">
                            <TabsTrigger value="all" className="text-xs px-3 font-medium">
                                All{" "}
                                <span className="ml-1.5 text-muted-foreground">
                                    ({scoreCounts.all})
                                </span>
                            </TabsTrigger>
                            {!isAllAccounts && (
                                <>
                                    <TabsTrigger
                                        value="hot"
                                        className="text-xs px-3 font-medium text-emerald-700 dark:text-emerald-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/20 data-[state=active]:shadow-none"
                                    >
                                        Hot{" "}
                                        <span className="ml-1.5 opacity-70">({scoreCounts.hot})</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="warm"
                                        className="text-xs px-3 font-medium text-amber-700 dark:text-amber-400 data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20 data-[state=active]:shadow-none"
                                    >
                                        Warm{" "}
                                        <span className="ml-1.5 opacity-70">({scoreCounts.warm})</span>
                                    </TabsTrigger>
                                </>
                            )}
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
                                        const selectedDomains = filteredAccounts
                                            .filter((a) => selectedIds.has(a.company_id))
                                            .map((a) => a.company_domain)
                                            .join(",");
                                        window.location.href = `/campaigns/new?domains=${encodeURIComponent(
                                            selectedDomains
                                        )}`;
                                    }}
                                    size="sm"
                                    className="gap-1.5 h-8 shadow-sm hover:shadow transition-all bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    New Campaign
                                </Button>

                                {/* Divider */}
                                <div className="h-6 w-px bg-blue-200 dark:bg-blue-800" />

                                {/* Secondary Action - Add to Existing */}
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowAddToCampaign(true)}
                                    size="sm"
                                    className="gap-1.5 h-8 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                >
                                    <FolderPlus className="w-3.5 h-3.5" />
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

            {/* Status Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-border/60 shrink-0">
                <div className="max-w-[1600px] mx-auto px-5 xl:px-4 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={
                                filteredAccounts.length > 0 &&
                                selectedIds.size === filteredAccounts.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            disabled={filteredAccounts.length === 0}
                        />
                        <span>
                            {isAllAccounts ? "Sorted by Last Updated" : "Sorted by Fit Score"}
                        </span>
                        {selectedProduct && (
                            <span className="text-blue-600">• {selectedProduct.name}</span>
                        )}
                    </div>
                    <span>{filteredAccounts.length} results</span>
                </div>
            </div>

            {/* Account List */}
            <div className="flex-1 overflow-auto bg-white/50 dark:bg-slate-950/20">
                <div className="max-w-[1600px] mx-auto min-h-full border-x border-border/40 bg-white dark:bg-slate-900/50">
                    {loading || loadingAccounts ? (
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
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
                            <Building2 className="w-12 h-12 opacity-40" />
                            <div className="text-center">
                                <p className="font-medium">
                                    {isAllAccounts ? "No accounts found" : "No candidates found"}
                                </p>
                                <p className="text-sm opacity-70">
                                    {isAllAccounts
                                        ? "Add companies to get started"
                                        : "Try adjusting your filters or selecting a different product"}
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
        </div>
    );
}
