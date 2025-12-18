'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Building2, Users, MapPin } from 'lucide-react';

export interface CompanyRowCompactProps {
    // Core data
    name: string;
    domain: string;
    logoUrl?: string | null;
    logoBase64?: string | null;

    // Optional metadata
    industry?: string | null;
    employeeCount?: number | null;
    hqCountry?: string | null;
    segment?: string | null;

    // Display options
    rank?: number;
    fitScore?: number | null;
    onClick?: () => void;
    className?: string;
}

function formatCompactNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
}

export function CompanyRowCompact({
    name,
    domain,
    logoUrl,
    logoBase64,
    industry,
    employeeCount,
    hqCountry,
    segment,
    rank,
    fitScore,
    onClick,
    className,
}: CompanyRowCompactProps) {
    // Get company initials for avatar fallback
    const companyInitials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Resolve logo source
    const logoSrc = logoBase64
        ? (logoBase64.startsWith('data:') ? logoBase64 : `data:image/png;base64,${logoBase64}`)
        : logoUrl;

    const hasMetadata = industry || employeeCount || hqCountry;

    return (
        <div
            className={cn(
                "group flex items-center gap-3 px-4 py-3 transition-colors",
                "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                "border-b border-slate-100 dark:border-slate-800 last:border-0",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {/* Rank Badge (optional) */}
            {rank !== undefined && (
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs shrink-0">
                    {rank}
                </div>
            )}

            {/* Company Logo - Compact 28px */}
            <div className="shrink-0">
                <Avatar className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 after:hidden">
                    {logoSrc && (
                        <AvatarImage
                            src={logoSrc}
                            alt={name}
                            className="object-contain rounded-md"
                        />
                    )}
                    <AvatarFallback className="rounded-md bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 text-[10px] font-semibold">
                        {companyInitials}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Name & Domain */}
            <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-slate-900 dark:text-white truncate leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {domain}
                </div>
            </div>

            {/* Metadata Chips */}
            {hasMetadata && (
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    {industry && (
                        <span className="flex items-center gap-1 max-w-[100px] truncate">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{industry}</span>
                        </span>
                    )}
                    {employeeCount && (
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 shrink-0" />
                            {formatCompactNumber(employeeCount)}
                        </span>
                    )}
                    {hqCountry && (
                        <span className="flex items-center gap-1 max-w-[80px] truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{hqCountry}</span>
                        </span>
                    )}
                </div>
            )}

            {/* Segment Badge (optional) */}
            {segment && (
                <span className="hidden md:inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium shrink-0">
                    {segment}
                </span>
            )}

            {/* Fit Score (optional) */}
            {fitScore !== null && fitScore !== undefined && (
                <div className="text-sm font-semibold text-slate-900 dark:text-white min-w-[40px] text-right shrink-0">
                    {Math.round(fitScore * 100)}%
                </div>
            )}
        </div>
    );
}

// Loading skeleton for the compact row
export function CompanyRowCompactSkeleton({ showRank = false }: { showRank?: boolean }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            {showRank && <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0" />}
            <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded opacity-60" />
            </div>
            <div className="w-12 h-5 bg-slate-100 dark:bg-slate-800 rounded shrink-0" />
        </div>
    );
}
