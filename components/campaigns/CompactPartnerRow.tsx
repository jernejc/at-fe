'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Partner, WSPartnerSuggestion } from '@/lib/schemas';

interface CompactPartnerRowProps { 
    partner: Partner | any; 
    suggestion?: WSPartnerSuggestion | any; 
    isSelected: boolean; 
    onToggle: () => void 
}

export function CompactPartnerRow({ 
    partner, 
    suggestion, 
    isSelected, 
    onToggle 
}: CompactPartnerRowProps) {
    const logoUrl = partner.logo_url || suggestion?.logo_url || partner.logo_base64;
    
    return (
        <motion.button
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onToggle}
            className={cn(
                "w-full rounded-lg border px-3 py-2 text-left transition-all group",
                isSelected
                    ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                    isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                )}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>

                <div className="w-6 h-6 rounded border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-4 h-4 object-contain" />
                    ) : (
                        <span className="text-[10px] font-bold text-slate-500">
                            {partner.name.charAt(0)}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white text-sm shrink-0">
                        {partner.name}
                    </span>
                    
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {suggestion ? suggestion.match_reasons[0] : (partner.description || partner.type)?.slice(0, 60) + ((partner.description || partner.type)?.length > 60 ? '...' : '')}
                    </span>
                </div>

                {suggestion && (
                    <div className="shrink-0 flex items-center gap-2">
                        {suggestion.interest_coverage && (
                             <div className="hidden sm:block text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                Cov: {Math.round(suggestion.interest_coverage)}%
                             </div>
                        )}
                        <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold",
                            "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        )}>
                            {suggestion.match_score}%
                        </div>
                    </div>
                )}
                 {!suggestion && partner.type && (partner.description || partner.type !== (partner.description || partner.type)) && (
                     <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                        {partner.type}
                     </Badge>
                )}
            </div>
        </motion.button>
    );
}
