'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PartnerPerformance {
    id: string;
    name: string;
    leads: number;
    winRate: number;
    revenue: number;
    avgDeal: number;
    slaStatus: 'on_track' | 'warning' | 'breached';
    cycleTime: number; // days
}

interface PartnerPerformanceTableProps {
    /** Partner performance data - uses sample data if not provided */
    partners?: PartnerPerformance[];
    /** Additional classes */
    className?: string;
}

// Sample data matching the reference design
const SAMPLE_PARTNERS: PartnerPerformance[] = [
    {
        id: '1',
        name: 'CyberShield Solutions',
        leads: 245,
        winRate: 18.2,
        revenue: 342000,
        avgDeal: 45200,
        slaStatus: 'on_track',
        cycleTime: 32,
    },
    {
        id: '2',
        name: 'Nexa Systems',
        leads: 182,
        winRate: 12.4,
        revenue: 210500,
        avgDeal: 38000,
        slaStatus: 'warning',
        cycleTime: 48,
    },
    {
        id: '3',
        name: 'SecureFlow Tech',
        leads: 310,
        winRate: 15.8,
        revenue: 412000,
        avgDeal: 52100,
        slaStatus: 'on_track',
        cycleTime: 29,
    },
    {
        id: '4',
        name: 'Titan Infosec',
        leads: 95,
        winRate: 8.1,
        revenue: 88000,
        avgDeal: 28500,
        slaStatus: 'breached',
        cycleTime: 64,
    },
];

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `€${(value / 1000).toFixed(0)},${(value % 1000).toString().padStart(3, '0')}`;
    }
    return `€${value.toLocaleString()}`;
}

function SlaStatusBadge({ status }: { status: PartnerPerformance['slaStatus'] }) {
    const config = {
        on_track: {
            label: 'ON TRACK',
            className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
            dotClassName: 'bg-emerald-500',
        },
        warning: {
            label: 'SLA WARNING',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
            dotClassName: 'bg-amber-500',
        },
        breached: {
            label: 'BREACHED',
            className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
            dotClassName: 'bg-red-500',
        },
    };

    const { label, className, dotClassName } = config[status];

    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold',
            className
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', dotClassName)} />
            {label}
        </span>
    );
}

/**
 * Table showing per-partner performance metrics.
 */
export function PartnerPerformanceTable({
    partners = SAMPLE_PARTNERS,
    className,
}: PartnerPerformanceTableProps) {
    const partnerCount = partners.length;

    return (
        <div className={cn(
            'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">
                    Partner Performance Details
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {partnerCount} Active Partners
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Partner Name
                            </th>
                            <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Leads
                            </th>
                            <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Win %
                            </th>
                            <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Revenue
                            </th>
                            <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Avg Deal
                            </th>
                            <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                SLA Status
                            </th>
                            <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Cycle Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {partners.map((partner) => (
                            <tr
                                key={partner.id}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <td className="px-5 py-4">
                                    <span className="font-medium text-sm text-slate-900 dark:text-white">
                                        {partner.name}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                                        {partner.leads}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                                        {partner.winRate}%
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                                        {formatCurrency(partner.revenue)}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <span className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                                        €{partner.avgDeal.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <SlaStatusBadge status={partner.slaStatus} />
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <span className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                                        {partner.cycleTime} Days
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
