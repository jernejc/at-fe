// Shared components for AccountDetail

import { cn } from '@/lib/utils';

export function EmptyState({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground">{children}</div>;
}

export function MetricPill({ icon, value, label, highlight = false }: {
    icon: string;
    value: string;
    label: string;
    highlight?: boolean;
}) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border",
            highlight
                ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100"
                : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-400"
        )}>
            <span className="text-base">{icon}</span>
            <span className="font-semibold">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

export function DetailCell({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="p-4 bg-background">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="font-medium mt-1">{value || '—'}</p>
        </div>
    );
}

export function RatingBar({ label, value, color }: { label: string; value: number | null | undefined; color: string }) {
    if (!value) return null;
    const percentage = (value / 5) * 100;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{value.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-muted overflow-hidden">
                <div className={cn("h-full", color)} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

export function SectionHeader({ title, count, color = "bg-blue-600", children }: { title: string; count?: number | string; color?: string; children?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-1 h-5 rounded-full", color)} />
            <h3 className="font-semibold">{title}</h3>
            {count !== undefined && <span className="text-sm text-muted-foreground">({count})</span>}
            {children}
        </div>
    );
}
