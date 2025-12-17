'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, X, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addCompanyToCampaign, searchCompanies } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CompanySummary } from '@/lib/schemas';

interface AddCompanyButtonProps {
    slug: string;
    onCompanyAdded: () => void;
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

export function AddCompanyButton({ slug, onCompanyAdded, className, variant = 'ghost' }: AddCompanyButtonProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<CompanySummary[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Search logic
    const debouncedQuery = useDebouncedValue(query, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchResults() {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            setLoading(true);
            try {
                const data = await searchCompanies(debouncedQuery, 5);
                setResults(data.companies || []);
                setShowResults(true);
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [debouncedQuery]);

    // Click outside to close results
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                // If clicking outside, close expand entirely if query is empty
                if (query.length === 0 && !adding) {
                    setIsExpanded(false);
                }
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [query, adding]);

    const handleAdd = async (domain: string) => {
        if (!domain) return;
        setAdding(true);
        setError(null);
        try {
            await addCompanyToCampaign(slug, { domain });
            setQuery('');
            setResults([]);
            setIsExpanded(false);
            onCompanyAdded();
        } catch (err) {
            console.error('Failed to add company:', err);
            setError('Failed to add');
        } finally {
            setAdding(false);
        }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (showResults) setShowResults(false);
            else {
                setIsExpanded(false);
                setQuery('');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (query.includes('.')) {
                handleAdd(query);
            } else if (results.length > 0) {
                handleAdd(results[0].domain);
            }
        }
    };

    if (isExpanded) {
        return (
            <div ref={wrapperRef} className={cn("relative w-full", className)}>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                        ref={inputRef}
                        autoFocus
                        placeholder="Search specific companies or pasting a domain..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setError(null);
                            if (!showResults && e.target.value.length >= 2) setShowResults(true);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        className={cn(
                            "pl-9 h-10 bg-white dark:bg-slate-900 shadow-sm transition-all",
                            "border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500",
                            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                            error && "border-red-500 focus:border-red-500"
                        )}
                        disabled={adding}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                                onClick={() => {
                                    setIsExpanded(false);
                                    setQuery('');
                                }}
                            >
                                <X className="h-3.5 w-3.5 text-slate-400" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search Results Dropdown */}
                {showResults && (results.length > 0 || query.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden z-20 animate-in fade-in slide-in-from-top-1">
                        <div className="max-h-[320px] overflow-y-auto">
                            {results.length > 0 ? (
                                <div className="p-1.5 space-y-0.5">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1.5">Suggested Companies</div>
                                    {results.map((company) => (
                                        <button
                                            key={company.id || company.domain}
                                            className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-colors text-left group"
                                            onClick={() => handleAdd(company.domain)}
                                            disabled={adding}
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                {company.logo_url ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={company.logo_url} alt="" className="w-5 h-5 object-contain" />
                                                ) : (
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                                                        <Highlight text={company.name || company.domain} highlight={query} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <span className="truncate">{company.domain}</span>
                                                    {company.industry && (
                                                        <>
                                                            <span className="w-0.5 h-0.5 bg-slate-400 rounded-full" />
                                                            <span className="truncate max-w-[120px]">{company.industry}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="h-7 w-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
                                                    <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : query.length > 2 && !loading && (
                                <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 mb-2">
                                        <Search className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        No companies found matching "{query}"
                                    </p>
                                </div>
                            )}

                            {/* Fallback to add domain */}
                            {query.includes('.') && (
                                <div className="p-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <button
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-left group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                                        onClick={() => handleAdd(query)}
                                        disabled={adding}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-dashed border-slate-300 dark:border-slate-600">
                                            <Plus className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-slate-900 dark:text-white">
                                                Add <span className="font-bold">"{query}"</span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Add as new domain directly
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Idle State - Dashed Slot Style
    return (
        <button
            className={cn(
                "group w-full flex items-center justify-center gap-2 h-10",
                "rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800",
                "text-sm font-medium text-slate-500 dark:text-slate-400",
                "hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200",
                "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                "transition-all duration-200 ease-out",
                className
            )}
            onClick={() => setIsExpanded(true)}
        >
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Add another company</span>
        </button>
    );
}
