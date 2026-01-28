import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    iconBgClass?: string;
    label: string;
    value: React.ReactNode;
    valueColorClass?: string;
}

export function StatCard({
    icon: Icon,
    iconBgClass = 'bg-slate-100 dark:bg-slate-800',
    label,
    value,
    valueColorClass = 'text-slate-900 dark:text-white',
}: StatCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide uppercase">
                <div className={`w-7 h-7 rounded-lg ${iconBgClass} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{label}</span>
            </div>
            <div className={`text-3xl font-extrabold tracking-tight ${valueColorClass}`}>
                {value}
            </div>
        </div>
    );
}
