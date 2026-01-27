'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Building2, MapPin, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SystemMessage } from '../ui/SystemMessage';
import { SearchPhaseIndicator } from '../../SearchPhaseIndicator';
import { CompanyRowCompact } from '../../CompanyRowCompact';
import { SearchInsightsPanel } from '../../SearchInsightsPanel';
import type { CampaignFilterUI, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import type { AgenticSearchState } from '@/hooks/useAgenticSearch';

interface AudienceStepProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filters: CampaignFilterUI[];
    setFilters: (filters: CampaignFilterUI[]) => void;
    activeFilterType: string | null;
    setActiveFilterType: (type: string | null) => void;
    filterInputValue: string;
    setFilterInputValue: (val: string) => void;
    previewCompanies: (CompanySummary | CompanySummaryWithFit)[];
    previewTotal: number;
    loadingPreview: boolean;
    isAgenticSearching: boolean;
    agenticState: AgenticSearchState;
    onConfirm: () => void;
    addFilter: (type: string, value: string) => void;
    triggerAgenticSearch: (query: string) => void;
    onCompanyClick: (domain: string) => void;
    useAgenticMode: boolean;
}

export function AudienceStep({
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    activeFilterType,
    setActiveFilterType,
    filterInputValue,
    setFilterInputValue,
    previewCompanies,
    previewTotal,
    loadingPreview,
    isAgenticSearching,
    agenticState,
    onConfirm,
    addFilter,
    triggerAgenticSearch,
    onCompanyClick,
    useAgenticMode
}: AudienceStepProps) {
    const isAgenticPhaseActive = agenticState.phase !== 'idle' && agenticState.phase !== 'complete' && agenticState.phase !== 'error';
    const hasAudience = searchQuery.trim() || filters.length > 0;

    return (
        <SystemMessage showAvatar={false}>
            {/* AI Search - clean layout without extra container */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-4"
            >
                {/* Search Input Section */}
                <div className="space-y-3">
                    {/* Main search input */}
                    <div className={cn(
                        "relative group rounded-xl transition-all duration-300",
                        isAgenticPhaseActive && "ring-2 ring-slate-300/50 dark:ring-slate-600/30"
                    )}>
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200",
                            searchQuery.trim() ? "text-slate-600 dark:text-slate-300" : "text-slate-400"
                        )}>
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Describe your ideal customer... e.g., B2B SaaS in healthcare"
                            autoFocus
                            className={cn(
                                "w-full h-12 pl-11 pr-4 rounded-xl text-sm transition-all duration-200",
                                "bg-white dark:bg-slate-800",
                                "border border-slate-200 dark:border-slate-700",
                                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                                "focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600",
                                "group-hover:border-slate-300 dark:group-hover:border-slate-600"
                            )}
                        />
                    </div>

                    {/* Filter chips row */}
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
                                        className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>

                        {/* Filter buttons */}
                        {['industry', 'location', 'size_min', 'fit_min'].map(type => {
                            const config: Record<string, { label: string; icon: React.ReactNode; placeholder: string; suggestions?: string[] }> = {
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
                            const c = config[type];
                            const isActive = activeFilterType === type;
                            const hasFilter = filters.some(f => f.type === type || (type === 'location' && f.type === 'country'));

                            if (hasFilter) return null;

                            return (
                                <div key={type} className="relative">
                                    <button
                                        onClick={() => setActiveFilterType(isActive ? null : type)}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                                        )}
                                    >
                                        {c.icon}
                                        {c.label}
                                    </button>

                                    {isActive && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => { setActiveFilterType(null); setFilterInputValue(''); }} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="absolute z-50 top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 min-w-[220px]"
                                            >
                                                {/* Quick suggestions */}
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {c.suggestions?.map((suggestion) => (
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

                {/* AI Interpretation / Status - integrated styling */}
                <AnimatePresence mode="wait">
                    {useAgenticMode && isAgenticPhaseActive && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-visible"
                        >
                            <SearchPhaseIndicator
                                phase={agenticState.phase}
                                showElapsedTime
                                intent={agenticState.interpretation?.intent}
                                semanticQuery={agenticState.interpretation?.semantic_query}
                                keywords={agenticState.interpretation?.keywords}
                                details={
                                    agenticState.interpretation?.keywords?.length
                                        ? `Identifying: ${agenticState.interpretation.keywords.slice(0, 3).join(', ')}${agenticState.interpretation.keywords.length > 3 ? '...' : ''}`
                                        : agenticState.interpretation?.semantic_query
                                            ? `Refining: ${agenticState.interpretation.semantic_query}`
                                            : undefined
                                }
                                className="mb-2"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {hasAudience && (previewCompanies.length > 0 || agenticState.companies.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm">
                                {/* Results Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/80 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                            <Building2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Matching Companies
                                        </span>
                                    </div>
                                    <motion.div
                                        key="count"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
                                    >
                                        <span className="tabular-nums">
                                            {(isAgenticSearching && agenticState.companies.length > 0
                                                ? (agenticState.totalResults || agenticState.companies.length)
                                                : previewTotal).toLocaleString()}
                                        </span>
                                        <span className="text-emerald-500/70 dark:text-emerald-500/50">matches</span>
                                    </motion.div>
                                </div>

                                {/* Results list with reveal animation */}
                                <div className="divide-y divide-slate-100/80 dark:divide-slate-700/30 rounded-b-xl">
                                    {isAgenticSearching && agenticState.companies.length > 0 ? (
                                        agenticState.companies.slice(0, 20).map((company: any, idx: number) => (
                                            <motion.div
                                                key={company.domain}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.25, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                                            >
                                                <CompanyRowCompact
                                                    name={company.name}
                                                    domain={company.domain}
                                                    industry={company.industry}
                                                    fitScore={company.match_score > 1 ? company.match_score / 100 : company.match_score}
                                                    logoBase64={company.logo_base64}
                                                    logoUrl={!company.logo_base64 ? `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64` : undefined}
                                                    onClick={() => onCompanyClick(company.domain)}
                                                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                />
                                            </motion.div>
                                        ))
                                    ) : previewCompanies.slice(0, 20).map((company, idx) => (
                                        <motion.div
                                            key={company.domain}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <CompanyRowCompact
                                                name={company.name}
                                                domain={company.domain}
                                                industry={company.industry}
                                                fitScore={'combined_score' in company && company.combined_score != null ? company.combined_score / 100 : null}
                                                logoBase64={company.logo_base64}
                                                logoUrl={!company.logo_base64 && company.domain ? `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64` : undefined}
                                                onClick={() => onCompanyClick(company.domain)}
                                                className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Insights Panel - integrated with container */}
                <AnimatePresence mode="wait">
                    {agenticState.phase === 'complete' && (agenticState.insights || agenticState.suggestedQueries.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <SearchInsightsPanel
                                insights={agenticState.insights}
                                suggestedQueries={agenticState.suggestedQueries}
                                refinementTips={agenticState.refinementTips}
                                interestSummary={agenticState.interestSummary}
                                searchTimeMs={agenticState.searchTimeMs}
                                totalResults={agenticState.totalResults}
                                onQueryClick={(query) => {
                                    setSearchQuery(query);
                                    setTimeout(() => triggerAgenticSearch(query), 100);
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Continue button */}
                <AnimatePresence>
                    {hasAudience && previewTotal > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 28 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={onConfirm}
                                    className="w-full h-12 rounded-xl gap-2 font-medium"
                                >
                                    <motion.span
                                        key={previewTotal}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        Continue with {previewTotal.toLocaleString()} companies
                                    </motion.span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </SystemMessage>
    );
}
