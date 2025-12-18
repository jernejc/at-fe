'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Building2, ChevronDown, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CompanyRowCompact } from '../CompanyRowCompact';
import type { CompanySummary } from '@/lib/schemas';

interface StatsCardProps {
    stats: {
        count: number;
        countries: number;
        totalEmployees: number;
    };
    loadingCompanies: boolean;
    matchingCompanies: CompanySummary[];
    onMainAction: () => void;
    saving: boolean;
    mainActionLabel: string;
    onCompanyClick: (domain: string) => void;
}

export function StatsCard({
    stats,
    loadingCompanies,
    matchingCompanies,
    onMainAction,
    saving,
    mainActionLabel,
    onCompanyClick
}: StatsCardProps) {
    const [showCompanyList, setShowCompanyList] = useState(false);

    return (
        <Card className="bg-card/60 dark:bg-card/60 backdrop-blur-sm border-border/60 shadow-md">
            <div className="flex items-center justify-between gap-4 p-3 bg-card rounded-xl border border-border/50 m-1">
                <button
                    onClick={() => setShowCompanyList(!showCompanyList)}
                    className="flex-1 flex items-center gap-4 hover:opacity-80 transition-opacity text-left group"
                >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>

                    <div>
                        <div className="text-base font-bold text-foreground flex items-center gap-2">
                            {loadingCompanies ? '...' : stats.count} companies
                            <ChevronDown className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-300",
                                showCompanyList && "rotate-180"
                            )} />
                        </div>
                        {stats.count > 0 && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{stats.totalEmployees.toLocaleString()} employees</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <span>{stats.countries} countries</span>
                            </div>
                        )}
                    </div>
                </button>

                {/* Primary Action - Always Visible */}
                <Button
                    onClick={onMainAction}
                    disabled={saving}
                    className="h-11 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all whitespace-nowrap"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        mainActionLabel
                    )}
                    {!saving && <ArrowRight className="w-4 h-4 ml-2 opacity-50" />}
                </Button>
            </div>

            {/* Expandable Company List - Detached */}
            {showCompanyList && (
                <div className="px-1 pb-1">
                    <div className="mt-1 bg-background/50 rounded-xl overflow-hidden backdrop-blur-sm animate-in slide-in-from-top-4 fade-in duration-300 origin-top">
                        {matchingCompanies.slice(0, 10).map(company => (
                            <CompanyRowCompact
                                key={company.id}
                                name={company.name}
                                domain={company.domain}
                                logoUrl={company.logo_url}
                                logoBase64={company.logo_base64}
                                industry={company.industry}
                                employeeCount={company.employee_count}
                                onClick={() => onCompanyClick(company.domain)}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                            />
                        ))}
                        {matchingCompanies.length > 10 && (
                            <div className="px-5 py-4 text-sm font-medium text-center text-muted-foreground bg-accent/30 border-t border-border/50">
                                +{matchingCompanies.length - 10} more companies match your criteria
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}
