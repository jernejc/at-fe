'use client';

import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyRowProps {
    logoUrl: string | null;
    name: string | null;
    domain: string;
    expectedRevenue: string;
    industry: string | null;
    employeeCount: number | null;
    location: string | null;
    status: string | null;
    isNew: boolean;
    onClick: () => void;
}

export function CompanyRow({
    logoUrl,
    name,
    domain,
    expectedRevenue,
    industry,
    employeeCount,
    location,
    status,
    isNew,
    onClick,
}: CompanyRowProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full grid grid-cols-12 gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer',
                isNew && 'border-2 border-amber-200'
            )}
        >
            {/* Company Info */}
            <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt={name || ''} className="w-6 h-6 object-contain" />
                    ) : (
                        <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                        {name || domain}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {domain}
                    </p>
                </div>
            </div>

            {/* Expected Revenue */}
            <div className="col-span-2 flex items-center">
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {expectedRevenue}
                </span>
            </div>

            {/* Industry */}
            <div className="col-span-2 flex items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                    {industry || '—'}
                </span>
            </div>

            {/* Size */}
            <div className="col-span-1 flex items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                    {employeeCount?.toLocaleString() || '—'}
                </span>
            </div>

            {/* Location */}
            <div className="col-span-2 flex items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                    {location || '—'}
                </span>
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center">
                <span className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                    status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                    status === 'completed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}>
                    {status || '—'}
                </span>
            </div>
        </button>
    );
}
