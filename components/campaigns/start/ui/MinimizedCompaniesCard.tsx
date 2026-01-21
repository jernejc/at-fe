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

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden',
                className
            )}
        >
            {/* Trigger */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                        {companies.length} companies selected
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                </motion.div>
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-slate-100 dark:border-slate-800">
                            <ScrollArea className="max-h-[200px]">
                                {companies.map((company) => (
                                    <CompanyRowCompact
                                        key={company.domain}
                                        name={company.name}
                                        domain={company.domain}
                                        logoBase64={company.logo_base64}
                                        industry={company.industry}
                                        employeeCount={company.employee_count}
                                    />
                                ))}
                            </ScrollArea>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
