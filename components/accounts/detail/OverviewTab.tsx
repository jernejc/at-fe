// Overview Tab Component

import type { CompanyRead } from '@/lib/api';
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
                        <div className="w-1 h-5 bg-blue-600" />
                        <h3 className="font-semibold">About</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed pl-4">{company.description}</p>
                </section>
            )}

            {/* Specialties */}
            {company.specialties && company.specialties.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-cyan-500" />
                        <h3 className="font-semibold">Specialties</h3>
                        <span className="text-sm text-muted-foreground">({company.specialties.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                        {company.specialties.slice(0, 20).map((specialty, i) => (
                            <span key={i} className="px-3 py-1.5 text-sm bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800">
                                {specialty}
                            </span>
                        ))}
                        {company.specialties.length > 20 && (
                            <span className="px-3 py-1.5 text-sm text-muted-foreground">+{company.specialties.length - 20} more</span>
                        )}
                    </div>
                </section>
            )}

            {/* Details grid with alternating colors */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-5 bg-violet-600" />
                    <h3 className="font-semibold">Company Details</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 border rounded overflow-hidden">
                    <DetailCell label="Industry" value={company.industry} />
                    <DetailCell label="Type" value={company.company_type} />
                    <DetailCell label="Size" value={company.employee_count_range} />
                    <DetailCell label="Revenue" value={company.revenue} />
                    <DetailCell label="Headquarters" value={company.hq_city && company.hq_state ? `${company.hq_city}, ${company.hq_state}` : company.hq_city} />
                    <DetailCell label="Country" value={company.hq_country} />
                    <DetailCell label="Founded" value={company.founded_year} />
                    <DetailCell label="Stock" value={company.ticker} />
                </div>
            </section>

            {/* Tech stack with colored tags */}
            {company.technologies && company.technologies.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-emerald-500" />
                        <h3 className="font-semibold">Tech Stack</h3>
                        <span className="text-sm text-muted-foreground">({company.technologies.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-4">
                        {company.technologies.slice(0, 20).map((tech, i) => (
                            <span key={i} className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {tech.technology}
                            </span>
                        ))}
                        {company.technologies.length > 20 && (
                            <span className="px-3 py-1.5 text-sm text-muted-foreground">+{company.technologies.length - 20} more</span>
                        )}
                    </div>
                </section>
            )}

            {/* Ratings visual bars */}
            {company.rating_overall && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-amber-500" />
                        <h3 className="font-semibold">Employee Ratings</h3>
                        {company.reviews_count && <span className="text-sm text-muted-foreground">({company.reviews_count.toLocaleString()} reviews)</span>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                        <RatingBar label="Overall" value={company.rating_overall} color="bg-amber-500" />
                        <RatingBar label="Culture" value={company.rating_culture} color="bg-blue-500" />
                        <RatingBar label="Compensation" value={company.rating_compensation} color="bg-emerald-500" />
                        <RatingBar label="Work-Life" value={company.rating_work_life} color="bg-violet-500" />
                        <RatingBar label="Career" value={company.rating_career} color="bg-pink-500" />
                        <RatingBar label="Management" value={company.rating_management} color="bg-cyan-500" />
                    </div>
                </section>
            )}

            {/* Funding timeline */}
            {company.funding_rounds && company.funding_rounds.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-green-500" />
                        <h3 className="font-semibold">Funding</h3>
                    </div>
                    <div className="pl-4 space-y-0">
                        {company.funding_rounds.map((round, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                                <div className="w-3 h-3 bg-green-500" />
                                <div className="flex-1">
                                    <span className="font-medium">{round.round_type || 'Funding'}</span>
                                    {round.date && <span className="text-muted-foreground ml-2">· {round.date}</span>}
                                </div>
                                {round.amount && (
                                    <span className="text-lg font-bold text-green-600">
                                        ${(round.amount / 1_000_000).toFixed(0)}M
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact */}
            {(company.website_url || company.emails?.length > 0) && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-indigo-500" />
                        <h3 className="font-semibold">Contact</h3>
                    </div>
                    <div className="pl-4 space-y-2">
                        {company.website_url && (
                            <a href={company.website_url} target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                                {company.website_url}
                            </a>
                        )}
                        {company.emails?.map((email, i) => (
                            <a key={i} href={`mailto:${email}`} className="block text-blue-600 hover:underline">{email}</a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
