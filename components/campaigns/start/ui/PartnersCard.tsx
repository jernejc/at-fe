'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CompactPartnerRow } from '@/components/campaigns/CompactPartnerRow';
import type { PartnerSummary, WSPartnerSuggestion } from '@/lib/schemas';
import { Users, SearchX } from 'lucide-react';

interface PartnersCardProps {
    partnerSuggestions: WSPartnerSuggestion[];
    allPartners: PartnerSummary[];
    selectedPartnerIds: Set<string>;
    onToggle: (partnerId: string) => void;
    className?: string;
    isLoading?: boolean;
}

export function PartnersCard({
    partnerSuggestions,
    allPartners,
    selectedPartnerIds,
    onToggle,
    className,
    isLoading = false,
}: PartnersCardProps) {
    const suggestedSlugs = new Set(partnerSuggestions.map(s => s.slug));
    const otherPartners = allPartners.filter(p => !suggestedSlugs.has(p.slug));
    const totalCount = partnerSuggestions.length + otherPartners.length;
    const selectedCount = selectedPartnerIds.size;

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
                'flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg min-h-0',
                className
            )}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                        Select Partners
                    </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                    {isLoading ? (
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            Loading...
                        </motion.span>
                    ) : (
                        `${selectedCount}/${totalCount} selected`
                    )}
                </Badge>
            </div>

            {/* Partners list */}
            <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                {isLoading && partnerSuggestions.length === 0 ? (
                    // Skeleton loaders while loading
                    <div className="p-2 space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                            >
                                <motion.div
                                    className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700"
                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                />
                                <motion.div
                                    className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700"
                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                />
                                <div className="flex-1 space-y-2">
                                    <motion.div
                                        className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"
                                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                    <motion.div
                                        className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"
                                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : totalCount === 0 ? (
                    // Empty state - no partners found
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <SearchX className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            No partners found
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                            No partners are available at this time
                        </p>
                    </div>
                ) : (
                    <div className="p-2 space-y-4">
                        {/* Recommended Partners Section */}
                        {partnerSuggestions.length > 0 && (
                            <div className="space-y-2">
                                <div className="px-2 flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Recommended Partners
                                    </span>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                        {partnerSuggestions.length}
                                    </Badge>
                                </div>
                                <div className="space-y-1.5">
                                    {partnerSuggestions.map((suggestion, index) => (
                                        <motion.div
                                            key={suggestion.slug}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02, duration: 0.2 }}
                                        >
                                            <CompactPartnerRow
                                                partner={{
                                                    name: suggestion.name,
                                                    slug: suggestion.slug,
                                                    description: suggestion.description,
                                                    logo_url: suggestion.logo_url,
                                                }}
                                                suggestion={{
                                                    ...suggestion,
                                                    match_reasons: suggestion.matched_interests.map(i => i.interest),
                                                }}
                                                isSelected={selectedPartnerIds.has(suggestion.slug)}
                                                onToggle={() => onToggle(suggestion.slug)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Partners Section */}
                        {otherPartners.length > 0 && (
                            <div className="space-y-2">
                                <div className="px-2 flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        All Partners
                                    </span>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                        {otherPartners.length}
                                    </Badge>
                                </div>
                                <div className="space-y-1.5">
                                    {otherPartners.map((partner, index) => (
                                        <motion.div
                                            key={partner.slug}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: (partnerSuggestions.length + index) * 0.02, duration: 0.2 }}
                                        >
                                            <CompactPartnerRow
                                                partner={partner}
                                                isSelected={selectedPartnerIds.has(partner.slug)}
                                                onToggle={() => onToggle(partner.slug)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </motion.div>
    );
}
