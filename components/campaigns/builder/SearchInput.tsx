'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, Briefcase, Users, Globe, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { CampaignFilterUI } from '@/lib/schemas/campaign';
import {
    parseNaturalLanguage,
    INDUSTRY_OPTIONS,
    SIZE_OPTIONS,
    COUNTRY_OPTIONS
} from './utils';

interface SearchInputProps {
    filters: CampaignFilterUI[];
    onFiltersChange: (filters: CampaignFilterUI[]) => void;
    onSearch: (term: string) => void;
}

export function SearchInput({ filters, onFiltersChange, onSearch }: SearchInputProps) {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const filter = parseNaturalLanguage(input);

        if (filter) {
            onFiltersChange([...filters, filter]);
            setInput('');
        }
    };

    const addFilter = (filter: CampaignFilterUI) => {
        onFiltersChange([...filters, filter]);
        setOpenDropdown(null);
    };

    const removeFilter = (filterId: string) => {
        onFiltersChange(filters.filter(f => f.id !== filterId));
    };

    const FILTER_BUTTONS = [
        {
            key: 'industry',
            label: 'Industry',
            icon: Briefcase,
            options: INDUSTRY_OPTIONS.map(o => ({ label: o, value: o, type: 'industry' as const }))
        },
        {
            key: 'size',
            label: 'Size',
            icon: Users,
            options: SIZE_OPTIONS
        },
        {
            key: 'country',
            label: 'Location',
            icon: Globe,
            options: COUNTRY_OPTIONS.map(o => ({ label: o, value: o, type: 'country' as const }))
        },
    ];

    const hasFilters = filters.length > 0;

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative bg-card/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-visible z-20 p-2",
                isFocused
                    ? "border-ring/50 shadow-sm ring-1 ring-ring/20"
                    : "border-border shadow-xl shadow-black/5 dark:shadow-black/20"
            )}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-1">
                {/* Filter Pills */}
                {hasFilters && (
                    <div className="px-1 flex flex-wrap gap-2 mb-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        {filters.map(filter => (
                            <Badge
                                key={filter.id}
                                variant="secondary"
                                className="pl-2.5 pr-1 py-1 gap-1.5 text-sm transition-colors"
                            >
                                {filter.displayLabel}
                                <button
                                    type="button"
                                    onClick={() => removeFilter(filter.id)}
                                    className="p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    placeholder="Search by industry, location, size, or keywords..."
                    className="w-full bg-transparent text-xl placeholder:text-muted-foreground/70 font-medium px-3 py-2 min-h-[60px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none rounded-lg shadow-none"
                />

                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
                    {/* Left: Filter Icons */}
                    <div className="flex items-center gap-1">
                        {FILTER_BUTTONS.map(filter => (
                            <div key={filter.key} className="relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setOpenDropdown(openDropdown === filter.key ? null : filter.key)}
                                    className={cn(
                                        "h-10 w-10 rounded-xl transition-all duration-200",
                                        openDropdown === filter.key
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    )}
                                    title={filter.label}
                                >
                                    <filter.icon className="w-5 h-5" strokeWidth={2} />
                                </Button>

                                {/* Dropdown */}
                                {openDropdown === filter.key && (
                                    <Card className="absolute top-full left-0 mt-3 w-64 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200 border-border shadow-lg bg-popover text-popover-foreground">
                                        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-accent/30 border-b border-border">
                                            Select {filter.label}
                                        </div>
                                        <div className="max-h-72 overflow-y-auto py-1 custom-scrollbar">
                                            {filter.options.map(opt => (
                                                <button
                                                    type="button"
                                                    key={opt.label}
                                                    onClick={() => addFilter({ id: crypto.randomUUID(), type: opt.type, value: opt.value, displayLabel: opt.label })}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 group"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right: Search Button */}
                    <Button
                        type="submit"
                        disabled={!input.trim()}
                        className={cn(
                            "h-9 px-4 rounded-xl transition-all duration-300 gap-2 font-medium shadow-md",
                            input.trim()
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-primary/20"
                                : "opacity-50 cursor-not-allowed shadow-none"
                        )}
                    >
                        <Search className="w-4 h-4" strokeWidth={2.5} />
                        <span>Search</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
