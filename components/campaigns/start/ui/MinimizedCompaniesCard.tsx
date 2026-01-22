'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Building2, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CompanyRowCompact } from '@/components/campaigns/CompanyRowCompact';
import type { WSCompanyResult } from '@/lib/schemas';

interface MinimizedCompaniesCardProps {
    companies: WSCompanyResult[];
    className?: string;
}

export function MinimizedCompaniesCard({ companies, className }: MinimizedCompaniesCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasMore = companies.length > 3;
    const visibleCompanies = companies.slice(0, 3);
    const hiddenCompanies = companies.slice(3);

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
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                        {companies.length} companies selected
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
                    {visibleCompanies.map((company) => (
                        <CompanyRowCompact
                            key={company.domain}
                            name={company.name}
                            domain={company.domain}
                            logoBase64={company.logo_base64}
                            industry={company.industry}
                            employeeCount={company.employee_count}
                        />
                    ))}
                    <AnimatePresence initial={false}>
                        {isExpanded && hiddenCompanies.map((company) => (
                            <motion.div
                                key={company.domain}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CompanyRowCompact
                                    name={company.name}
                                    domain={company.domain}
                                    logoBase64={company.logo_base64}
                                    industry={company.industry}
                                    employeeCount={company.employee_count}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </ScrollArea>
            </div>
        </motion.div>
    );
}
