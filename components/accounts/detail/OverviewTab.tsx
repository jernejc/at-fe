// Overview Tab Component

import { useState } from 'react';
import type { CompanyRead } from '@/lib/schemas';
import { DetailCell, RatingBar, SectionHeader } from './components';

interface OverviewTabProps {
    company: CompanyRead;
}

export function OverviewTab({ company }: OverviewTabProps) {
    const [showAllSpecialties, setShowAllSpecialties] = useState(false);
    const [showAllTech, setShowAllTech] = useState(false);

    return (
        <div className="space-y-8">
            {/* About */}
            {company.description && (
                <section>
                    <SectionHeader title="About" />
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{company.description}</p>
                </section>
            )}

            {/* Company Details - grid card */}
            <section>
                <SectionHeader title="Company Details" />
                <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
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

            {/* Specialties */}
            {company.specialties && company.specialties.length > 0 && (
                <section>
                    <SectionHeader title="Specialties" count={company.specialties.length} />
                    <div className="flex flex-wrap gap-2">
                        {(showAllSpecialties ? company.specialties : company.specialties.slice(0, 20)).map((specialty, i) => (
                            <span key={i} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md">
                                {specialty}
                            </span>
                        ))}
                        {company.specialties.length > 20 && (
                            <button type="button" onClick={() => setShowAllSpecialties(v => !v)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                {showAllSpecialties ? 'Show less' : `+${company.specialties.length - 20} more`}
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* Tech stack */}
            {company.technologies && company.technologies.length > 0 && (
                <section>
                    <SectionHeader title="Tech Stack" count={company.technologies.length} color="bg-emerald-600" />
                    <div className="flex flex-wrap gap-2">
                        {(showAllTech ? company.technologies : company.technologies.slice(0, 20)).map((tech, i) => (
                            <span key={i} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md">
                                {tech.technology}
                            </span>
                        ))}
                        {company.technologies.length > 20 && (
                            <button type="button" onClick={() => setShowAllTech(v => !v)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                {showAllTech ? 'Show less' : `+${company.technologies.length - 20} more`}
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* Ratings */}
            {company.rating_overall && (
                <section>
                    <SectionHeader title="Employee Ratings" count={company.reviews_count ? `${company.reviews_count.toLocaleString()} reviews` : undefined} color="bg-amber-500" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <RatingBar label="Overall" value={company.rating_overall} color="bg-blue-600" />
                        <RatingBar label="Culture" value={company.rating_culture} color="bg-blue-500" />
                        <RatingBar label="Compensation" value={company.rating_compensation} color="bg-blue-500" />
                        <RatingBar label="Work-Life" value={company.rating_work_life} color="bg-blue-500" />
                        <RatingBar label="Career" value={company.rating_career} color="bg-blue-500" />
                        <RatingBar label="Management" value={company.rating_management} color="bg-blue-500" />
                    </div>
                </section>
            )}

            {/* Contact */}
            {(company.website_url || (company.emails && company.emails.length > 0)) && (
                <section>
                    <SectionHeader title="Contact" color="bg-sky-500" />
                    <div className="space-y-2">
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
