'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CampaignFilterUI } from '@/lib/schemas';

interface AudienceFilterChipsProps {
    filters: CampaignFilterUI[];
    setFilters: (filters: CampaignFilterUI[]) => void;
    activeFilterType: string | null;
    setActiveFilterType: (type: string | null) => void;
    filterInputValue: string;
    setFilterInputValue: (value: string) => void;
    addFilter: (type: string, value: string) => void;
    disabled?: boolean;
}

const filterConfig: Record<string, { label: string; icon: React.ReactNode; placeholder: string; suggestions: string[] }> = {
    industry: {
        label: 'Industry',
        icon: <Building2 className="w-3.5 h-3.5" />,
        placeholder: 'e.g., Technology',
        suggestions: ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail']
    },
    location: {
        label: 'Location',
        icon: <MapPin className="w-3.5 h-3.5" />,
        placeholder: 'e.g., United States',
        suggestions: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia']
    },
    size_min: {
        label: 'Size',
        icon: <Users className="w-3.5 h-3.5" />,
        placeholder: 'Min employees',
        suggestions: ['50', '100', '500', '1000']
    },
    fit_min: {
        label: 'Min Score',
        icon: <Sparkles className="w-3.5 h-3.5" />,
        placeholder: 'Min score (0-100)',
        suggestions: ['50', '60', '70', '80', '90']
    },
};

export function AudienceFilterChips({
    filters,
    setFilters,
    activeFilterType,
    setActiveFilterType,
    filterInputValue,
    setFilterInputValue,
    addFilter,
    disabled = false,
}: AudienceFilterChipsProps) {
    const filterTypes = ['industry', 'location', 'size_min', 'fit_min'];

    return (
        <div className="-mt-3 mb-3 px-11 max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Active filters */}
                <AnimatePresence mode="popLayout">
                    {filters.map(f => (
                        <motion.span
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                        >
                            {f.displayLabel}
                            <button
                                onClick={() => setFilters(filters.filter(x => x.id !== f.id))}
                                disabled={disabled}
                                className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>

                {/* Filter buttons */}
                {filterTypes.map(type => {
                    const c = filterConfig[type];
                    const isActive = activeFilterType === type;
                    const hasFilter = filters.some(f => f.type === type || (type === 'location' && f.type === 'country'));

                    if (hasFilter) return null;

                    return (
                        <div key={type} className="relative">
                            <button
                                onClick={() => !disabled && setActiveFilterType(isActive ? null : type)}
                                disabled={disabled}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {c.icon}
                                {c.label}
                            </button>

                            {isActive && !disabled && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => {
                                            setActiveFilterType(null);
                                            setFilterInputValue('');
                                        }}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="absolute z-50 bottom-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 min-w-[220px]"
                                    >
                                        {/* Quick suggestions */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {c.suggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => addFilter(type === 'location' ? 'country' : type, suggestion)}
                                                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                                                >
                                                    {type === 'size_min' ? `${suggestion}+` : suggestion}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom input */}
                                        <div className="flex gap-2">
                                            <input
                                                autoFocus
                                                value={filterInputValue}
                                                onChange={(e) => setFilterInputValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && filterInputValue.trim()) {
                                                        addFilter(type === 'location' ? 'country' : type, filterInputValue);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setActiveFilterType(null);
                                                        setFilterInputValue('');
                                                    }
                                                }}
                                                placeholder={c.placeholder}
                                                className="flex-1 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600 transition-all duration-200"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => addFilter(type === 'location' ? 'country' : type, filterInputValue)}
                                                disabled={!filterInputValue.trim()}
                                                className="h-8 px-3 text-xs rounded-lg"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
