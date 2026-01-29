import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CRMStatCardProps {
    icon: LucideIcon;
    iconBgClass?: string;
    label: string;
    value: React.ReactNode;
    valueColorClass?: string;
    trend?: {
        value: number;
        label: string;
        isPositive?: boolean;
    };
}

export function CRMStatCard({
    icon: Icon,
    iconBgClass = 'bg-slate-100 dark:bg-slate-800',
    label,
    value,
    valueColorClass = 'text-slate-900 dark:text-white',
    trend,
}: CRMStatCardProps) {
    const TrendIcon = trend?.isPositive !== false ? TrendingUp : TrendingDown;
    const trendColorClass = trend?.isPositive !== false
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400';

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide uppercase">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconBgClass)}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{label}</span>
            </div>
            <div className="flex items-end justify-between">
                <div className={cn("text-3xl font-extrabold tracking-tight", valueColorClass)}>
                    {value}
                </div>
                {trend && (
                    <div className={cn("flex items-center gap-1 text-xs font-medium", trendColorClass)}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span>{trend.isPositive !== false ? '+' : ''}{trend.value}{trend.label}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
