'use client';

import { Partner } from '@/lib/schemas/campaign';
import { Building2, Zap, Briefcase, Globe, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PartnerOverviewCardProps {
    partner: Partner;
    onClick?: () => void;
    isSelected?: boolean;
}

export function PartnerOverviewCard({ partner, onClick, isSelected }: PartnerOverviewCardProps) {
    const getIcon = (type: Partner['type']) => {
        switch (type) {
            case 'agency': return Zap;
            case 'technology': return Building2;
            case 'consulting': return Briefcase;
            case 'reseller': return Globe;
            default: return Building2;
        }
    };

    const TypeIcon = getIcon(partner.type);
    const capacity = partner.capacity ?? 10;
    const assigned = partner.assigned_count ?? 0;
    const utilizationPercent = Math.min((assigned / capacity) * 100, 100);

    return (
        <Card
            onClick={onClick}
            className={cn(
                "group relative transition-all duration-200 overflow-hidden border rounded-xl shadow-sm",
                onClick && "cursor-pointer",
                isSelected
                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500/20 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    {/* Logo / Icon */}
                    {partner.logo_url ? (
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors border overflow-hidden bg-white",
                            isSelected
                                ? "border-blue-200 dark:border-blue-800"
                                : "border-slate-200 dark:border-slate-700 group-hover:border-blue-200"
                        )}>
                            <img
                                src={partner.logo_url}
                                alt={partner.name}
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                    // Fallback to initials on error
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <span className="hidden text-sm font-bold text-slate-400">
                                {partner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </span>
                        </div>
                    ) : (
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors border",
                            isSelected
                                ? "bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300"
                                : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600"
                        )}>
                            <TypeIcon className="w-6 h-6" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate">
                                {partner.name}
                            </h3>
                            <Badge variant="secondary" className="capitalize text-xs">
                                {partner.type}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                            {partner.description}
                        </p>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{assigned}</span>
                                <span className="text-slate-400">/ {capacity}</span>
                            </div>
                            {/*partner.match_score >= 90 && (
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="font-medium">{partner.match_score}%</span>
                                </div>
                            )*/}
                        </div>

                        {/* Capacity Bar */}
                        <div className="mt-3">
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        utilizationPercent >= 90 ? "bg-red-500" :
                                            utilizationPercent >= 70 ? "bg-amber-500" :
                                                "bg-emerald-500"
                                    )}
                                    style={{ width: `${utilizationPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Industries */}
                        {partner.industries && partner.industries.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {partner.industries.slice(0, 3).map((industry, index) => (
                                    <Badge key={`${industry}-${index}`} variant="outline" className="text-xs font-normal">
                                        {industry}
                                    </Badge>
                                ))}
                                {partner.industries.length > 3 && (
                                    <Badge variant="outline" className="text-xs font-normal text-slate-400">
                                        +{partner.industries.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
