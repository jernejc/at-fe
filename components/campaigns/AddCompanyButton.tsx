'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Search, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { addCompanyToCampaign, searchCompanies } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CompanySummary } from '@/lib/schemas';
import { toast } from 'sonner';

interface AddCompanyButtonProps {
    slug: string;
    onCompanyAdded: () => void;
    existingDomains?: string[];
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
}

// Simple text highlighter
function Highlight({ text, highlight }: { text: string; highlight: string }) {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="bg-yellow-100 dark:bg-yellow-900/40 font-medium text-slate-900 dark:text-yellow-100">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}

function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export function AddCompanyButton({ slug, onCompanyAdded, existingDomains = [], className, variant = 'ghost' }: AddCompanyButtonProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [results, setResults] = useState<CompanySummary[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanySummary | null>(null);

    // Search logic
    const debouncedQuery = useDebouncedValue(query, 300);

    useEffect(() => {
        async function fetchResults() {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchCompanies(debouncedQuery, 20);
                // Filter out companies already in the campaign
                const filteredCompanies = (data.companies || []).filter(
                    company => !existingDomains.includes(company.domain)
                );
                setResults(filteredCompanies);
            } catch (err) {
                console.error('Search failed', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }

        if (open) {
            fetchResults();
        }
    }, [debouncedQuery, open]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setQuery('');
            setResults([]);
            setSelectedCompany(null);
        }
    }, [open]);

    const handleAdd = async (domain: string) => {
        if (!domain) return;
        setAdding(true);
        try {
            await addCompanyToCampaign(slug, { domain });
            toast.success('Company added', {
                description: `${domain} has been added to the campaign`,
                descriptionClassName: '!text-foreground font-medium',
            });
            onCompanyAdded();
            setOpen(false);
        } catch (err) {
            console.error('Failed to add company:', err);
            toast.error('Failed to add company', {
                description: err instanceof Error ? err.message : 'Please try again',
            });
        } finally {
            setAdding(false);
        }
    };

    const handleCompanyClick = (company: CompanySummary) => {
        setSelectedCompany(company);
    };

    const handleConfirmAdd = () => {
        if (selectedCompany) {
            handleAdd(selectedCompany.domain);
        }
    };

    const getCompanyLogo = (company: CompanySummary) => {
        // Check logo_base64 first (from search results)
        if (company.logo_base64) {
            return company.logo_base64.startsWith('data:') 
                ? company.logo_base64 
                : `data:image/png;base64,${company.logo_base64}`;
        }
        // Fallback to logo_url
        return company.logo_url || null;
    };

    return (
        <>
            <Button
                variant="ghost"
                className={cn(
                    "group w-full flex items-center justify-center gap-2 h-10",
                    "rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800",
                    "text-sm font-medium text-slate-500 dark:text-slate-400",
                    "hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200",
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    "transition-all duration-200 ease-out",
                    className
                )}
                onClick={() => setOpen(true)}
            >
                <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Add another company</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Add Company to Campaign</DialogTitle>
                        <DialogDescription>
                            Search for companies to add to this campaign, or paste a domain directly.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by company name or paste a domain (e.g., example.com)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                            autoFocus
                        />
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1 overflow-auto min-h-0 py-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">Searching companies...</p>
                            </div>
                        ) : results.length === 0 && query.length >= 2 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                                    <Search className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    No companies found matching "{query}"
                                </p>
                                {query.includes('.') && (
                                    <p className="text-xs text-slate-400 mt-2">
                                        You can add this domain directly using the option below
                                    </p>
                                )}
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {results.map((company) => {
                                    const isSelected = selectedCompany?.domain === company.domain;
                                    const logoSrc = getCompanyLogo(company);

                                    return (
                                        <Card
                                            key={company.id || company.domain}
                                            onClick={() => handleCompanyClick(company)}
                                            className={cn(
                                                "group relative transition-all duration-200 cursor-pointer overflow-hidden border-2",
                                                isSelected
                                                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500/20 shadow-md"
                                                    : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-lg"
                                            )}
                                        >
                                            <CardContent className="p-3 flex gap-3 items-start select-none">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors border overflow-hidden",
                                                    isSelected
                                                        ? "bg-blue-100 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800"
                                                        : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                                                )}>
                                                    {logoSrc ? (
                                                        <img 
                                                            src={logoSrc} 
                                                            alt="" 
                                                            className="w-full h-full object-contain p-1"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <Building2 className={cn(
                                                        "w-5 h-5",
                                                        logoSrc ? "hidden" : "",
                                                        isSelected ? "text-blue-600 dark:text-blue-300" : "text-slate-400"
                                                    )} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className={cn(
                                                        "font-bold text-sm truncate pr-6",
                                                        isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
                                                    )}>
                                                        <Highlight text={company.name || company.domain} highlight={query} />
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {company.domain}
                                                    </p>
                                                    {company.industry && (
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1">
                                                            {company.industry}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className={cn(
                                                    "absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300",
                                                    isSelected
                                                        ? "bg-blue-600 border-blue-600 text-white scale-100 shadow-sm"
                                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-transparent scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                                                )}>
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Start typing to search for companies</p>
                            </div>
                        )}

                        {/* Domain Direct Add */}
                        {query.includes('.') && (
                            <div className="mt-3 p-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-left border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    onClick={() => handleAdd(query)}
                                    disabled={adding}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                        <Plus className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-slate-900 dark:text-white">
                                            Add <span className="font-bold">"{query}"</span> directly
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Add this domain to the campaign
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-slate-500">
                                {selectedCompany && `${selectedCompany.name || selectedCompany.domain} selected`}
                            </span>
                            <div className="flex gap-2">
                                <DialogClose render={<Button variant="outline" />}>
                                    Cancel
                                </DialogClose>
                                <Button
                                    onClick={handleConfirmAdd}
                                    disabled={!selectedCompany || adding}
                                    className="gap-2"
                                >
                                    {adding ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    Add to Campaign
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
