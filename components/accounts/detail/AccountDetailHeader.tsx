// Enhanced Account Detail Header Component - Fixed

import type { CompanyRead } from '@/lib/schemas';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { MetricPill } from './components';
import { formatCompactNumber } from './utils';

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
        <div className="relative overflow-hidden group">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-blue-900/10 pointer-events-none" />

            <div className="relative p-7 border-b border-border/60">
                <div className="flex gap-6 items-start">
                    {/* Logo with elevated container */}
                    <div className="relative rounded-xl p-1 bg-white dark:bg-slate-800 shadow-sm border border-border/60 shrink-0">
                        <Avatar className="w-20 h-20 rounded-lg">
                            {(company.logo_base64 || company.logo_url) && (
                                <AvatarImage
                                    src={company.logo_base64
                                        ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
                                        : company.logo_url!}
                                    alt={company.name}
                                    className="object-contain"
                                />
                            )}
                            <AvatarFallback className="text-2xl font-bold bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 rounded-lg">
                                {company.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <SheetHeader className="p-0 space-y-2 text-left">
                            <div className="flex items-center gap-3 flex-wrap">
                                <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
                                    {company.name}
                                </SheetTitle>

                                <div className="flex items-center gap-2">
                                    {maturity && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <span className="text-sm leading-none">{maturity.emoji}</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                {maturity.label}
                                            </span>
                                        </div>
                                    )}
                                    {company.ticker && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                                            <span className="text-emerald-600 dark:text-emerald-400 text-xs">📈</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                {company.stock_exchange ? `${company.stock_exchange}:` : ''}{company.ticker}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <SheetDescription asChild>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-medium">
                                        {company.industry && (
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
                                                {company.industry}
                                            </span>
                                        )}
                                        {company.hq_city && (
                                            <>
                                                <span className="text-muted-foreground/40">•</span>
                                                <span>{company.hq_city}{company.hq_country ? `, ${company.hq_country}` : ''}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Links & Socials */}
                                    <div className="flex items-center gap-4">
                                        {/* Website */}
                                        <a
                                            href={(company.website_url || `https://${company.domain}`)}
                                            target="_blank"
                                            rel="noopener"
                                            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </div>
                                            {company.domain}
                                        </a>

                                        {/* Separator */}
                                        <div className="h-4 w-px bg-border/60" />

                                        {/* Social Icons - Refined */}
                                        <div className="flex items-center gap-2">
                                            {company.social_profiles?.find(s => s.platform.toLowerCase() === 'linkedin') && (
                                                <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'linkedin')!.url} target="_blank" rel="noopener"
                                                    className="p-1.5 text-muted-foreground hover:text-[#0077b5] hover:bg-[#0077b5]/10 rounded-md transition-all"
                                                    title="LinkedIn">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                </a>
                                            )}

                                            {company.social_profiles?.find(s => s.platform.toLowerCase() === 'twitter' || s.platform.toLowerCase() === 'x') && (
                                                <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'twitter' || s.platform.toLowerCase() === 'x')!.url} target="_blank" rel="noopener"
                                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-md transition-all"
                                                    title="Twitter/X">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                </a>
                                            )}

                                            {company.social_profiles?.find(s => s.platform.toLowerCase() === 'facebook') && (
                                                <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'facebook')!.url} target="_blank" rel="noopener"
                                                    className="p-1.5 text-muted-foreground hover:text-[#1877F2] hover:bg-[#1877F2]/10 rounded-md transition-all"
                                                    title="Facebook">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SheetDescription>
                        </SheetHeader>

                        {/* Key metrics as pills - Cleaner look */}
                        <div className="flex flex-wrap gap-3 mt-5">
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
