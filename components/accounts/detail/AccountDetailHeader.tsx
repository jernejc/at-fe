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
        <div className="p-6 border-b bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <div className="flex gap-4 items-start">
                <Avatar className="w-16 h-16 border-2 border-border shadow-sm mt-1">
                    {(company.logo_base64 || company.logo_url) && (
                        <AvatarImage
                            src={company.logo_base64
                                ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
                                : company.logo_url!}
                            alt={company.name}
                        />
                    )}
                    <AvatarFallback className="text-xl font-semibold bg-muted text-foreground">
                        {company.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <SheetHeader className="p-0 space-y-0.5 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                            <SheetTitle className="text-xl font-bold leading-none">{company.name}</SheetTitle>
                            {maturity && (
                                <span className="text-xs flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-transparent">
                                    <span className="text-sm">{maturity.emoji}</span>
                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">{maturity.label}</span>
                                </span>
                            )}
                            {company.ticker && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 rounded uppercase tracking-wide">
                                    {company.stock_exchange ? `${company.stock_exchange}:` : ''}{company.ticker}
                                </span>
                            )}
                        </div>

                        <SheetDescription asChild>
                            <div className="space-y-2 pt-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                    {company.industry && (
                                        <span>{company.industry}</span>
                                    )}
                                    {company.hq_city && (
                                        <>
                                            {company.industry && <span>•</span>}
                                            <span>{company.hq_city}{company.hq_country ? `, ${company.hq_country}` : ''}</span>
                                        </>
                                    )}
                                </div>

                                {/* Social Links Row */}
                                <div className="flex items-center gap-3 border-t pt-2 mt-2 w-fit">
                                    {/* Website/Domain */}
                                    {company.website_url ? (
                                        <a href={company.website_url} target="_blank" rel="noopener"
                                            className="text-foreground hover:text-blue-600 transition-colors font-medium flex items-center gap-1.5 text-xs group"
                                            title="Website">
                                            <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                            </div>
                                            {company.domain}
                                        </a>
                                    ) : (
                                        <a href={`https://${company.domain}`} target="_blank" rel="noopener"
                                            className="text-foreground hover:text-blue-600 transition-colors font-medium text-xs"
                                            title="Website">
                                            {company.domain}
                                        </a>
                                    )}

                                    {company.social_profiles?.find(s => s.platform.toLowerCase() === 'linkedin') && (
                                        <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'linkedin')!.url} target="_blank" rel="noopener"
                                            className="text-muted-foreground hover:text-[#0077b5] transition-colors flex items-center gap-1 text-xs font-medium"
                                            title="LinkedIn">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </a>
                                    )}

                                    {company.social_profiles?.find(s => s.platform.toLowerCase() === 'twitter' || s.platform.toLowerCase() === 'x') && (
                                        <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'twitter' || s.platform.toLowerCase() === 'x')!.url} target="_blank" rel="noopener"
                                            className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-xs font-medium"
                                            title="Twitter/X">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </a>
                                    )}

                                    {company.social_profiles?.find(s => s.platform.toLowerCase() === 'facebook') && (
                                        <a href={company.social_profiles.find(s => s.platform.toLowerCase() === 'facebook')!.url} target="_blank" rel="noopener"
                                            className="text-muted-foreground hover:text-[#1877F2] transition-colors flex items-center gap-1 text-xs font-medium"
                                            title="Facebook">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </SheetDescription>
                    </SheetHeader>

                    {/* Key metrics as pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
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
    );
}
