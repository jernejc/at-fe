import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MetricPill } from './components';
import { formatCompactNumber } from './utils';
import type { CompanyRead } from '@/lib/schemas';

interface AccountDetailHeaderProps {
    company: CompanyRead;
}

export function AccountDetailHeader({ company }: AccountDetailHeaderProps) {
    // Company maturity indicator based on founded year
    const getMaturityIndicator = () => {
        if (!company.founded_year) return null;
        const foundedYear = parseInt(company.founded_year, 10);
        if (isNaN(foundedYear)) return null;
        const age = new Date().getFullYear() - foundedYear;
        if (age >= 50) return { emoji: '🏛️', label: 'Established' };
        if (age >= 20) return { emoji: '🏢', label: 'Mature' };
        if (age >= 5) return { emoji: '🚀', label: 'Growth' };
        return { emoji: '💫', label: 'Startup' };
    };

    const maturity = getMaturityIndicator();

    return (
        <div className="relative overflow-hidden group border-b border-border/60">

            <div className="relative p-5 py-7 pt-8 max-w-7xl mx-auto w-full">
                <div className="flex gap-5 items-start">
                    {/* Logo with elevated container - Compact */}
                    <div className="relative rounded-lg p-1 bg-white dark:bg-slate-800 shadow-sm border border-border/60 shrink-0">
                        <Avatar className="w-16 h-16 rounded-md">
                            {(company.logo_base64 || company.logo_url) && (
                                <AvatarImage
                                    src={company.logo_base64
                                        ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
                                        : company.logo_url!}
                                    alt={company.name}
                                    className="object-contain"
                                />
                            )}
                            <AvatarFallback className="text-xl font-bold bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 rounded-md">
                                {(company.name || '??').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                        <SheetHeader className="p-0 space-y-1 text-left gap-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                                    {company.name}
                                </SheetTitle>

                                {maturity && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <span className="text-xs">{maturity.emoji}</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                            {maturity.label}
                                        </span>
                                    </div>
                                )}
                                {company.ticker && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">📈</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                            {company.stock_exchange ? `${company.stock_exchange}:` : ''}{company.ticker}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {company.industry && (
                                    <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
                                        {company.industry}
                                    </span>
                                )}

                                {company.hq_city && (
                                    <span className="flex items-center gap-1">
                                        {company.hq_city}{company.hq_country ? `, ${company.hq_country}` : ''}
                                    </span>
                                )}

                                {/* Website */}
                                <a
                                    href={(company.website_url || `https://${company.domain}`)}
                                    target="_blank"
                                    rel="noopener"
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span className="underline decoration-muted-foreground/30 hover:decoration-blue-600/50 underline-offset-2">{company.domain}</span>
                                </a>

                                {/* Social Icons - Minimal */}
                                <div className="flex items-center gap-1">
                                    {company.social_profiles?.find(s => s.platform.toLowerCase() === 'linkedin') && (
                                        <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'linkedin')!.url} target="_blank" rel="noopener"
                                            className="text-muted-foreground hover:text-[#0077b5] transition-colors"
                                            title="LinkedIn">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </a>
                                    )}
                                    {company.social_profiles?.find(s => s.platform.toLowerCase() === 'twitter' || s.platform.toLowerCase() === 'x') && (
                                        <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'twitter' || s.platform.toLowerCase() === 'x')!.url} target="_blank" rel="noopener"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                            title="Twitter/X">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </SheetHeader>

                        {/* Key metrics as pills - Compact */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {company.employee_count && (
                                <MetricPill
                                    icon="👥"
                                    value={formatCompactNumber(company.employee_count)}
                                    label="employees"
                                />
                            )}
                            {company.rating_overall && (
                                <MetricPill
                                    icon="⭐"
                                    value={company.rating_overall.toFixed(1)}
                                    label="rating"
                                    highlight
                                />
                            )}
                            {company.followers_count && company.followers_count > 1000 && (
                                <MetricPill
                                    icon="📢"
                                    value={formatCompactNumber(company.followers_count)}
                                    label="followers"
                                />
                            )}
                            {company.founded_year && (
                                <MetricPill
                                    icon="📅"
                                    value={String(company.founded_year)}
                                    label="founded"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
