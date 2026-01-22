'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Users, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PartnerSummary, WSPartnerSuggestion } from '@/lib/schemas';

interface MinimizedPartnersCardProps {
    partners: (PartnerSummary | WSPartnerSuggestion)[];
    className?: string;
}

export function MinimizedPartnersCard({ partners, className }: MinimizedPartnersCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasMore = partners.length > 3;
    const visiblePartners = partners.slice(0, 3);
    const hiddenPartners = partners.slice(3);

    const renderPartnerRow = (partner: PartnerSummary | WSPartnerSuggestion) => {
        const logoUrl = 'logo_url' in partner ? partner.logo_url : undefined;
        const name = partner.name;

        return (
            <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="w-6 h-6 rounded border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                        <span className="text-[10px] font-bold text-slate-500">
                            {name.charAt(0)}
                        </span>
                    )}
                </div>
                <span className="text-sm text-slate-900 dark:text-white truncate">
                    {name}
                </span>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden',
                className
            )}
        >
            {/* Header */}
            <div className="w-full px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                        {partners.length} partner{partners.length !== 1 ? 's' : ''} selected
                    </span>
                </div>
                {hasMore && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        <span>{isExpanded ? 'show less' : 'show more'}</span>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="border-t border-slate-100 dark:border-slate-800">
                <ScrollArea className="max-h-[500px]">
                    {visiblePartners.map((partner) => (
                        <div key={partner.slug}>
                            {renderPartnerRow(partner)}
                        </div>
                    ))}
                    <AnimatePresence initial={false}>
                        {isExpanded && hiddenPartners.map((partner) => (
                            <motion.div
                                key={partner.slug}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderPartnerRow(partner)}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </ScrollArea>
            </div>
        </motion.div>
    );
}
