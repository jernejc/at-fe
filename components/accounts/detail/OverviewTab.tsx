// Overview Tab Component

import type { CompanyRead } from '@/lib/schemas';
import { DetailCell, RatingBar } from './components';

interface OverviewTabProps {
    company: CompanyRead;
}

export function OverviewTab({ company }: OverviewTabProps) {
    return (
        <div className="p-6 space-y-8">
            {/* About with accent line */}
            {company.description && (
                <section>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                        <h3 className="font-semibold">About</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed pl-4 text-sm">{company.description}</p>
                </section>
            )}

            {/* Specialties */}
            {company.specialties && company.specialties.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                        <h3 className="font-semibold">Specialties</h3>
                        <span className="text-sm text-muted-foreground">({company.specialties.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                        {company.specialties.slice(0, 20).map((specialty, i) => (
                            <span key={i} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50 rounded-md">
                                {specialty}
                            </span>
                        ))}
                        {company.specialties.length > 20 && (
                            <span className="px-3 py-1.5 text-xs text-muted-foreground">+{company.specialties.length - 20} more</span>
                        )}
                    </div>
                </section>
            )}

            {/* Details grid with alternating colors */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-5 bg-blue-600 rounded-full" />
                    <h3 className="font-semibold">Company Details</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 border rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
                    {company.industry && <DetailCell label="Industry" value={company.industry} />}
                    {company.company_type && <DetailCell label="Type" value={company.company_type} />}
                    {company.employee_count_range && <DetailCell label="Size" value={company.employee_count_range} />}
                    {company.revenue && <DetailCell label="Revenue" value={company.revenue} />}
                    {(company.hq_city || company.hq_state) && (
                        <DetailCell label="Headquarters" value={`${company.hq_city || ''}${company.hq_city && company.hq_state ? ', ' : ''}${company.hq_state || ''}`} />
                    )}
                    {company.hq_country && company.hq_country !== 'Other' && (
                        <DetailCell label="Country" value={company.hq_country} />
                    )}
                    {company.founded_year && <DetailCell label="Founded" value={company.founded_year} />}
                    {company.ticker && <DetailCell label="Stock" value={company.ticker} />}
                </div>
            </section>

            {/* Tech stack with colored tags */}
            {company.technologies && company.technologies.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                        <h3 className="font-semibold">Tech Stack</h3>
                        <span className="text-sm text-muted-foreground">({company.technologies.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                        {company.technologies.slice(0, 20).map((tech, i) => (
                            <span key={i} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50 rounded-md">
                                {tech.technology}
                            </span>
                        ))}
                        {company.technologies.length > 20 && (
                            <span className="px-3 py-1.5 text-xs text-muted-foreground">+{company.technologies.length - 20} more</span>
                        )}
                    </div>
                </section>
            )}

            {/* Ratings visual bars - Unified Colors */}
            {company.rating_overall && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                        <h3 className="font-semibold">Employee Ratings</h3>
                        {company.reviews_count && <span className="text-sm text-muted-foreground">({company.reviews_count.toLocaleString()} reviews)</span>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                        <RatingBar label="Overall" value={company.rating_overall} color="bg-blue-600" />
                        <RatingBar label="Culture" value={company.rating_culture} color="bg-blue-500" />
                        <RatingBar label="Compensation" value={company.rating_compensation} color="bg-blue-500" />
                        <RatingBar label="Work-Life" value={company.rating_work_life} color="bg-blue-500" />
                        <RatingBar label="Career" value={company.rating_career} color="bg-blue-500" />
                        <RatingBar label="Management" value={company.rating_management} color="bg-blue-500" />
                    </div>
                </section>
            )}

            {/* Funding timeline */}
            {company.funding_rounds && company.funding_rounds.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                        <h3 className="font-semibold">Funding</h3>
                    </div>
                    <div className="pl-4 space-y-0">
                        {company.funding_rounds.map((round, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0 border-dashed">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500/50 ring-4 ring-blue-500/10" />
                                <div className="flex-1">
                                    <span className="font-medium text-sm">{round.round_type || 'Funding'}</span>
                                    {round.date && <span className="text-muted-foreground ml-2 text-xs">· {round.date}</span>}
                                </div>
                                {round.amount && (
                                    <span className="text-sm font-bold text-foreground font-mono">
                                        ${(round.amount / 1_000_000).toFixed(0)}M
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact */}
            {(company.website_url || (company.emails && company.emails.length > 0)) && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                        <h3 className="font-semibold">Contact</h3>
                    </div>
                    <div className="pl-4 space-y-2">
                        {company.website_url && (
                            <a href={(company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`)} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-blue-600 hover:underline w-fit">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                {company.website_url}
                            </a>
                        )}
                        {company.emails?.map((email, i) => (
                            <a key={i} href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline w-fit">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {email}
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
