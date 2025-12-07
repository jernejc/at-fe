'use client';

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import {
    getCompany,
    getCompanySignals,
    getCompanyPlaybooks,
    getPlaybook,
    getCompanyJobs,
    getCompanyNews,
    DomainResult,
    CompanySignalsResponse,
    PlaybookSummary,
    PlaybookRead,
    JobPostingSummary,
    NewsArticleSummary,
    EmployeeSummary,
    CompanyRead
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface AccountDetailProps {
    domain: string;
    open: boolean;
    onClose: () => void;
}

export function AccountDetail({ domain, open, onClose }: AccountDetailProps) {
    const [data, setData] = useState<DomainResult | null>(null);
    const [signals, setSignals] = useState<CompanySignalsResponse | null>(null);
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>([]);
    const [jobs, setJobs] = useState<JobPostingSummary[]>([]);
    const [news, setNews] = useState<NewsArticleSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!open || !domain) return;

        async function fetchDetails() {
            setLoading(true);
            try {
                const [companyData, playbooksData] = await Promise.all([
                    getCompany(domain),
                    getCompanyPlaybooks(domain).catch(() => ({ playbooks: [] })),
                ]);

                setData(companyData);
                setPlaybooks(playbooksData.playbooks);

                const [signalsData, jobsData, newsData] = await Promise.all([
                    companyData.company.id ? getCompanySignals(companyData.company.id).catch(() => null) : null,
                    getCompanyJobs(domain, 1, 10).catch(() => ({ items: [] })),
                    getCompanyNews(domain, 1, 10).catch(() => ({ items: [] })),
                ]);

                setSignals(signalsData);
                setJobs(jobsData.items);
                setNews(newsData.items);
            } catch (err) {
                console.error('Error fetching company details:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [domain, open]);

    const company = data?.company;
    const employees = data?.employees || [];
    const decisionMakers = employees.filter(e => e.is_decision_maker);
    const otherEmployees = employees.filter(e => !e.is_decision_maker);

    return (
        <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
                {loading ? (
                    <>
                        <SheetHeader className="sr-only"><SheetTitle>Loading</SheetTitle></SheetHeader>
                        <div className="p-8 space-y-6 animate-pulse">
                            <div className="flex gap-5">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-7 w-56 bg-muted" />
                                    <div className="h-4 w-80 bg-muted" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : company ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="p-6 border-b">
                            <div className="flex gap-5">
                                <Avatar className="w-16 h-16 border-2 border-border">
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
                                    <SheetHeader className="p-0 space-y-1">
                                        <SheetTitle className="text-2xl font-bold">{company.name}</SheetTitle>
                                        <SheetDescription asChild>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                                <a href={`https://${company.domain}`} target="_blank" rel="noopener"
                                                    className="text-foreground hover:underline font-medium">
                                                    {company.domain}
                                                </a>
                                                {company.industry && (
                                                    <>
                                                        <span className="text-muted-foreground">•</span>
                                                        <span className="text-muted-foreground">{company.industry}</span>
                                                    </>
                                                )}
                                                {company.hq_city && (
                                                    <>
                                                        <span className="text-muted-foreground">•</span>
                                                        <span className="text-muted-foreground">{company.hq_city}{company.hq_country ? `, ${company.hq_country}` : ''}</span>
                                                    </>
                                                )}
                                            </div>
                                        </SheetDescription>
                                    </SheetHeader>

                                    {/* Key metrics */}
                                    <div className="flex flex-wrap gap-6 mt-4">
                                        {company.employee_count && (
                                            <div>
                                                <p className="text-2xl font-bold">{company.employee_count.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Employees</p>
                                            </div>
                                        )}
                                        {company.founded_year && (
                                            <div>
                                                <p className="text-2xl font-bold">{company.founded_year}</p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Founded</p>
                                            </div>
                                        )}
                                        {company.rating_overall && (
                                            <div>
                                                <p className="text-2xl font-bold text-amber-500">★ {company.rating_overall.toFixed(1)}</p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                    Glassdoor{company.reviews_count ? ` (${company.reviews_count.toLocaleString()})` : ''}
                                                </p>
                                            </div>
                                        )}
                                        {company.revenue && (
                                            <div>
                                                <p className="text-2xl font-bold">{company.revenue}</p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs with color indicator */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <div className="border-y bg-muted/30">
                                <TabsList className="h-11 bg-transparent px-6 gap-0">
                                    <TabBtn value="overview" active={activeTab}>Overview</TabBtn>
                                    <TabBtn value="playbooks" active={activeTab}>Playbooks ({playbooks.length})</TabBtn>
                                    <TabBtn value="people" active={activeTab}>People ({data?.employees_total || 0})</TabBtn>
                                    <TabBtn value="signals" active={activeTab}>Signals ({signals?.total_signals || 0})</TabBtn>
                                    <TabBtn value="jobs" active={activeTab}>Jobs ({data?.jobs_total || 0})</TabBtn>
                                    <TabBtn value="news" active={activeTab}>News ({data?.news_total || 0})</TabBtn>
                                    <TabBtn value="updates" active={activeTab}>Updates ({company.updates?.length || 0})</TabBtn>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-muted/20">
                                <TabsContent value="overview" className="m-0">
                                    <OverviewContent company={company} />
                                </TabsContent>
                                <TabsContent value="playbooks" className="m-0">
                                    <PlaybooksContent playbooks={playbooks} />
                                </TabsContent>
                                <TabsContent value="people" className="m-0">
                                    <PeopleContent decisionMakers={decisionMakers} employees={otherEmployees} total={data?.employees_total || 0} />
                                </TabsContent>
                                <TabsContent value="signals" className="m-0">
                                    <SignalsContent signals={signals} />
                                </TabsContent>
                                <TabsContent value="jobs" className="m-0">
                                    <JobsContent jobs={jobs} total={data?.jobs_total || 0} />
                                </TabsContent>
                                <TabsContent value="news" className="m-0">
                                    <NewsContent news={news} total={data?.news_total || 0} />
                                </TabsContent>
                                <TabsContent value="updates" className="m-0">
                                    <UpdatesContent updates={company.updates || []} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                ) : (
                    <>
                        <SheetHeader className="sr-only"><SheetTitle>Not found</SheetTitle></SheetHeader>
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Company not found</div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

// Custom tab button with color accent
function TabBtn({ value, active, children }: { value: string; active: string; children: React.ReactNode }) {
    const isActive = active === value;
    return (
        <TabsTrigger
            value={value}
            className={cn(
                "h-11 px-4 rounded-none border-b-2 transition-colors",
                isActive
                    ? "border-blue-600 text-blue-600 font-semibold bg-transparent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
            )}
        >
            {children}
        </TabsTrigger>
    );
}

// Overview
function OverviewContent({ company }: { company: CompanyRead }) {
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

// People
function PeopleContent({ decisionMakers, employees, total }: { decisionMakers: EmployeeSummary[]; employees: EmployeeSummary[]; total: number }) {
    if (decisionMakers.length === 0 && employees.length === 0) {
        return <EmptyState>No employees found</EmptyState>;
    }

    return (
        <div className="p-6 space-y-6">
            {decisionMakers.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-amber-500" />
                        <h3 className="font-semibold">Key Contacts</h3>
                    </div>
                    <div className="border divide-y">
                        {decisionMakers.map((e) => <PersonRow key={e.id} person={e} highlight />)}
                    </div>
                </section>
            )}

            {employees.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-blue-600" />
                        <h3 className="font-semibold">Team</h3>
                        <span className="text-sm text-muted-foreground">
                            Showing {employees.length} of {total - decisionMakers.length}
                        </span>
                    </div>
                    <div className="border divide-y">
                        {employees.map((e) => <PersonRow key={e.id} person={e} />)}
                    </div>
                </section>
            )}
        </div>
    );
}

// Playbooks
function PlaybooksContent({ playbooks }: { playbooks: PlaybookSummary[] }) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        if (selectedId === null) {
            setPlaybookDetail(null);
            return;
        }
        setLoadingDetail(true);
        getPlaybook(selectedId)
            .then(setPlaybookDetail)
            .catch(console.error)
            .finally(() => setLoadingDetail(false));
    }, [selectedId]);

    if (playbooks.length === 0) {
        return <EmptyState>No playbooks generated yet</EmptyState>;
    }

    return (
        <div className="p-6">
            <div className="flex gap-6">
                {/* Playbook list */}
                <div className="w-64 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-violet-600" />
                        <h3 className="font-semibold">Product Groups</h3>
                    </div>
                    <div className="border divide-y">
                        {playbooks.map((pb) => (
                            <button
                                key={pb.id}
                                onClick={() => setSelectedId(pb.id)}
                                className={cn(
                                    "w-full p-3 text-left transition-colors",
                                    selectedId === pb.id ? "bg-violet-50" : "hover:bg-muted/50"
                                )}
                            >
                                <p className="font-medium text-sm">{pb.product_group}</p>
                                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                    {pb.fit_score !== null && (
                                        <span className="text-green-600">Score: {pb.fit_score}</span>
                                    )}
                                    {pb.fit_urgency !== null && (
                                        <span className="text-orange-600">Urgency: {pb.fit_urgency}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Playbook details */}
                <div className="flex-1 min-w-0">
                    {selectedId === null ? (
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            Select a playbook to view details
                        </div>
                    ) : loadingDetail ? (
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            Loading...
                        </div>
                    ) : playbookDetail ? (
                        <div className="space-y-6">
                            {/* Scores */}
                            <div className="flex gap-6">
                                {playbookDetail.fit_score !== null && (
                                    <div>
                                        <span className="text-3xl font-bold text-green-600">{playbookDetail.fit_score}</span>
                                        <span className="text-sm text-muted-foreground ml-2">Fit Score</span>
                                    </div>
                                )}
                                {playbookDetail.fit_urgency !== null && (
                                    <div>
                                        <span className="text-3xl font-bold text-orange-600">{playbookDetail.fit_urgency}</span>
                                        <span className="text-sm text-muted-foreground ml-2">Urgency</span>
                                    </div>
                                )}
                            </div>

                            {/* Reasoning */}
                            {playbookDetail.fit_reasoning && (
                                <section>
                                    <h4 className="text-sm font-semibold mb-2">Fit Reasoning</h4>
                                    <p className="text-sm text-muted-foreground">{playbookDetail.fit_reasoning}</p>
                                </section>
                            )}

                            {/* Value Proposition */}
                            {playbookDetail.value_proposition && (
                                <section>
                                    <h4 className="text-sm font-semibold mb-2">Value Proposition</h4>
                                    <p className="text-sm text-muted-foreground">{playbookDetail.value_proposition}</p>
                                </section>
                            )}

                            {/* Elevator Pitch */}
                            {playbookDetail.elevator_pitch && (
                                <section className="p-4 bg-violet-50 border-l-4 border-violet-500">
                                    <h4 className="text-sm font-semibold mb-2">Elevator Pitch</h4>
                                    <p className="text-sm">{playbookDetail.elevator_pitch}</p>
                                </section>
                            )}

                            {/* Discovery Questions */}
                            {playbookDetail.discovery_questions && playbookDetail.discovery_questions.length > 0 && (
                                <section>
                                    <h4 className="text-sm font-semibold mb-2">Discovery Questions</h4>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                        {playbookDetail.discovery_questions.map((q, i) => (
                                            <li key={i}>{q}</li>
                                        ))}
                                    </ol>
                                </section>
                            )}

                            {/* Objection Handling */}
                            {playbookDetail.objection_handling && Object.keys(playbookDetail.objection_handling).length > 0 && (
                                <section>
                                    <h4 className="text-sm font-semibold mb-2">Objection Handling</h4>
                                    <div className="space-y-2">
                                        {Object.entries(playbookDetail.objection_handling).map(([obj, response]) => (
                                            <div key={obj} className="text-sm">
                                                <p className="font-medium text-orange-700">"{obj}"</p>
                                                <p className="text-muted-foreground pl-4">→ {response}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Recommended Channels */}
                            {playbookDetail.recommended_channels && playbookDetail.recommended_channels.length > 0 && (
                                <section>
                                    <h4 className="text-sm font-semibold mb-2">Recommended Channels</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {playbookDetail.recommended_channels.map((ch, i) => (
                                            <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-700">{ch}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Contacts */}
                            {playbookDetail.contacts && playbookDetail.contacts.length > 0 && (
                                <section>
                                    <h4 className="text-sm font-semibold mb-2">Recommended Contacts</h4>
                                    <div className="border divide-y">
                                        {playbookDetail.contacts.map((contact) => (
                                            <div key={contact.id} className="p-3">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm">{contact.name}</p>
                                                        <p className="text-xs text-muted-foreground">{contact.title}</p>
                                                    </div>
                                                    {contact.fit_score !== null && (
                                                        <span className="text-sm text-green-600">Score: {contact.fit_score}</span>
                                                    )}
                                                </div>
                                                {contact.value_prop && (
                                                    <p className="text-xs text-muted-foreground mt-1">{contact.value_prop}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// Signals - compact table view
function SignalsContent({ signals }: { signals: CompanySignalsResponse | null }) {
    if (!signals || (signals.interests.length === 0 && signals.events.length === 0)) {
        return <EmptyState>No signals detected</EmptyState>;
    }

    const allSignals = [
        ...signals.events.map(s => ({ ...s, type: 'event' as const })),
        ...signals.interests.map(s => ({ ...s, type: 'interest' as const }))
    ];

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-violet-600" />
                <h3 className="font-semibold">Detected Signals</h3>
                <span className="text-sm text-muted-foreground">({allSignals.length})</span>
            </div>

            <div className="border">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <div className="col-span-1">Type</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-6">Evidence</div>
                    <div className="col-span-1 text-center">Str</div>
                    <div className="col-span-1 text-center">Urg</div>
                </div>

                {/* Rows */}
                {allSignals.map((s, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 border-t items-center hover:bg-muted/30">
                        <div className="col-span-1">
                            <span className={cn(
                                "inline-block w-2 h-2",
                                s.type === 'event' ? 'bg-orange-500' : 'bg-blue-500'
                            )} />
                        </div>
                        <div className="col-span-3 font-medium text-sm truncate">{s.signal_category}</div>
                        <div className="col-span-6 text-sm text-muted-foreground truncate">{s.evidence_summary}</div>
                        <div className="col-span-1 text-center">
                            <span className={cn(
                                "text-sm font-semibold",
                                s.strength >= 7 ? "text-green-600" : s.strength >= 4 ? "text-amber-600" : "text-muted-foreground"
                            )}>{s.strength}</span>
                        </div>
                        <div className="col-span-1 text-center">
                            {s.urgency_impact ? (
                                <span className={cn(
                                    "text-sm font-semibold",
                                    s.urgency_impact >= 7 ? "text-red-600" : s.urgency_impact >= 4 ? "text-orange-600" : "text-muted-foreground"
                                )}>{s.urgency_impact}</span>
                            ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500" /> Events</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500" /> Interests</span>
            </div>
        </div>
    );
}

// Jobs - enhanced with more data
function JobsContent({ jobs, total }: { jobs: JobPostingSummary[]; total: number }) {
    if (jobs.length === 0) return <EmptyState>No open positions</EmptyState>;

    // Group by department
    const byDept = jobs.reduce((acc, job) => {
        const dept = job.department || 'Other';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(job);
        return acc;
    }, {} as Record<string, JobPostingSummary[]>);

    const departments = Object.keys(byDept);

    return (
        <div className="p-6 space-y-6">
            {/* Summary stats */}
            <div className="flex gap-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600">{total}</span>
                    <span className="text-muted-foreground">open positions</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-violet-600">{departments.length}</span>
                    <span className="text-muted-foreground">departments hiring</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600">{jobs.filter(j => j.is_remote).length}</span>
                    <span className="text-muted-foreground">remote</span>
                </div>
            </div>

            {/* Jobs by department */}
            {departments.map(dept => (
                <section key={dept}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-4 bg-blue-600" />
                        <h4 className="font-semibold text-sm">{dept}</h4>
                        <span className="text-xs text-muted-foreground">({byDept[dept].length})</span>
                    </div>
                    <div className="border divide-y">
                        {byDept[dept].map((job) => (
                            <div key={job.id} className="flex items-center justify-between p-3 hover:bg-muted/30">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{job.title}</p>
                                    <div className="flex gap-3 mt-0.5 text-sm text-muted-foreground">
                                        {job.location && <span>{job.location}</span>}
                                        {job.employment_type && <span className="text-blue-600">{job.employment_type}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {job.is_remote && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">Remote</span>
                                    )}
                                    {job.posted_at && (
                                        <span className="text-xs text-muted-foreground">{formatRelativeDate(job.posted_at)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {total > jobs.length && (
                <p className="text-sm text-muted-foreground text-center">Showing {jobs.length} of {total} positions</p>
            )}
        </div>
    );
}

// News - enhanced with better layout
function NewsContent({ news, total }: { news: NewsArticleSummary[]; total: number }) {
    if (news.length === 0) return <EmptyState>No news articles</EmptyState>;

    // Group by event type
    const eventTypes = [...new Set(news.map(n => n.event_type).filter(Boolean))];

    return (
        <div className="p-6 space-y-6">
            {/* Event type filters/summary */}
            {eventTypes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {eventTypes.map(type => (
                        <span key={type} className="px-3 py-1 text-xs font-medium bg-violet-100 text-violet-700">
                            {type}
                        </span>
                    ))}
                </div>
            )}

            {/* News list */}
            <div className="space-y-4">
                {news.map((article) => (
                    <article key={article.id} className="group">
                        <div className="flex gap-4">
                            {/* Date column */}
                            <div className="shrink-0 w-16 text-right">
                                {article.published_at && (
                                    <div className="text-xs text-muted-foreground">
                                        {formatRelativeDate(article.published_at)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4 border-b">
                                {article.url ? (
                                    <a href={article.url} target="_blank" rel="noopener"
                                        className="font-medium text-foreground group-hover:text-violet-600 transition-colors">
                                        {article.title || 'Untitled'}
                                        <span className="text-violet-500 ml-1">↗</span>
                                    </a>
                                ) : (
                                    <p className="font-medium">{article.title || 'Untitled'}</p>
                                )}
                                <div className="flex gap-3 mt-1 text-sm">
                                    {article.source && (
                                        <span className="text-muted-foreground">{article.source}</span>
                                    )}
                                    {article.event_type && (
                                        <span className="text-violet-600 font-medium">{article.event_type}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {total > news.length && (
                <p className="text-sm text-muted-foreground text-center">Showing {news.length} of {total} articles</p>
            )}
        </div>
    );
}

// Updates - company social posts (LinkedIn updates)
interface UpdatePost {
    urn?: string;
    followers?: number;
    date?: string;
    description?: string;
    reactionsCount?: number;
    commentsCount?: number;
    resharedPostAuthor?: string | null;
    resharedPostAuthorUrl?: string | null;
    resharedPostAuthorHeadline?: string | null;
    resharedPostDescription?: string | null;
    resharedPostDate?: string | null;
    resharedPostFollowers?: number | null;
}

function UpdatesContent({ updates }: { updates: unknown[] }) {
    // Cast updates to our expected shape
    const posts = updates as UpdatePost[];

    if (posts.length === 0) return <EmptyState>No recent updates</EmptyState>;

    return (
        <div className="p-6 space-y-6">
            {/* Summary stats */}
            <div className="flex gap-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-pink-600">{posts.length}</span>
                    <span className="text-muted-foreground">recent updates</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600">
                        {posts.reduce((sum, p) => sum + (p.reactionsCount || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">total reactions</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600">
                        {posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">total comments</span>
                </div>
            </div>

            {/* Updates list */}
            <div className="space-y-4">
                {posts.map((post, i) => (
                    <article key={`update-${i}`} className="group border rounded-lg overflow-hidden bg-background">
                        <div className="p-4">
                            {/* Header with date */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {post.followers && (
                                        <span className="text-xs text-muted-foreground">
                                            {post.followers.toLocaleString()} followers
                                        </span>
                                    )}
                                </div>
                                {post.date && (
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {post.date}
                                    </span>
                                )}
                            </div>

                            {/* Post content */}
                            {post.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
                                    {post.description}
                                </p>
                            )}

                            {/* Reshared post indicator */}
                            {post.resharedPostAuthor && (
                                <div className="mt-3 p-3 border-l-2 border-pink-500 bg-muted/30 rounded">
                                    <p className="text-xs text-pink-600 font-medium mb-1">
                                        Reshared from {post.resharedPostAuthor}
                                    </p>
                                    {post.resharedPostDescription && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {post.resharedPostDescription}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Engagement metrics */}
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                                {post.reactionsCount !== undefined && post.reactionsCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                        </svg>
                                        {post.reactionsCount.toLocaleString()}
                                    </span>
                                )}
                                {post.commentsCount !== undefined && post.commentsCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                        </svg>
                                        {post.commentsCount.toLocaleString()}
                                    </span>
                                )}
                                {post.urn && (
                                    <a
                                        href={`https://www.linkedin.com/feed/update/${post.urn}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto text-xs text-blue-600 hover:underline"
                                    >
                                        View on LinkedIn →
                                    </a>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

// Helper for relative dates
function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
// Helper Components
function DetailCell({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="p-4 bg-background">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="font-medium mt-1">{value || '—'}</p>
        </div>
    );
}

function RatingBar({ label, value, color }: { label: string; value: number | null | undefined; color: string }) {
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

function PersonRow({ person, highlight = false }: { person: EmployeeSummary; highlight?: boolean }) {
    const hasMetadata = person.department || person.city || person.country;

    return (
        <div className={cn(
            "flex items-center gap-4 p-4 bg-background transition-colors",
            highlight ? "hover:bg-amber-50/50" : "hover:bg-muted/50"
        )}>
            <Avatar className="w-10 h-10">
                {person.avatar_url && <AvatarImage src={person.avatar_url} />}
                <AvatarFallback className={cn(
                    "text-xs font-medium",
                    highlight ? "bg-amber-100 text-amber-700" : "bg-muted"
                )}>
                    {person.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{person.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{person.current_title}</p>
                {hasMetadata && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {person.department && <span className="text-blue-600">{person.department}</span>}
                        {person.department && (person.city || person.country) && <span>·</span>}
                        {(person.city || person.country) && (
                            <span>{[person.city, person.country].filter(Boolean).join(', ')}</span>
                        )}
                    </div>
                )}
            </div>
            {highlight && <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1">Key Contact</span>}
            {person.profile_url && (
                <a href={person.profile_url} target="_blank" rel="noopener"
                    className="text-blue-600 hover:text-blue-700 p-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                </a>
            )}
        </div>
    );
}

function EmptyState({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground">{children}</div>;
}
