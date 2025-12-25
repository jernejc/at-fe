// Playbooks Tab Component - Updated styling to match Explainability tab

import { useState, useEffect, useMemo } from 'react';
import type { PlaybookSummary, PlaybookRead, PlaybookContactResponse, EmployeeSummary } from '@/lib/schemas';
import { getCompanyPlaybook, getEmployees } from '@/lib/api';
import { SectionHeader } from './components';
import { TabHeaderWithAction } from './EnrichedEmptyState';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search,
    Zap,
    Target,
    ShieldAlert,
    Briefcase,
    Hash,
    ChevronRight,
    FileText,
    Users,
    Lightbulb,
    TrendingUp,
    Mail,
    Copy,
    ExternalLink,
    Clock,
    Sparkles,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export interface PlaybookContext {
    role_category?: string | null;
    value_prop?: string | null;
    fit_score?: number | null;
}

interface PlaybooksTabProps {
    playbooks: PlaybookSummary[];
    availableEmployees?: EmployeeSummary[];
    domain?: string;
    onSelectEmployee: (employeeId: number | null, preview: { name: string; title?: string }, context: PlaybookContext) => void;
    onProcess?: () => Promise<void>;
}

export function PlaybooksTab({ playbooks, availableEmployees = [], domain, onSelectEmployee, onProcess }: PlaybooksTabProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0, transition: { duration: 0.2 } }
    };

    const detailContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const detailItem = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const handleEmployeeClick = async (contact: PlaybookContactResponse) => {
        // Capture context
        const context: PlaybookContext = {
            role_category: contact.role_category,
            value_prop: contact.value_prop,
            fit_score: contact.fit_score
        };

        // Clean up name if it contains prefixes like "Name:"
        const cleanName = contact.name.replace(/^Name:\s*/i, '').trim();

        // Try to find matching employee ID if missing
        let employeeId = contact.employee_id;
        let matchedEmployee: EmployeeSummary | undefined;

        if (!employeeId && availableEmployees) {
            matchedEmployee = availableEmployees.find(e =>
                e.full_name.toLowerCase() === cleanName.toLowerCase()
            );
            if (matchedEmployee) {
                employeeId = matchedEmployee.id;
            }
        }

        // If still no ID, try searching via API as a fallback
        if (!employeeId && domain) {
            try {
                const response = await getEmployees({
                    search: cleanName,
                    domain: domain,
                    page_size: 5
                });

                if (response.items && response.items.length > 0) {
                    const bestMatch = response.items.find(e =>
                        e.full_name.toLowerCase() === cleanName.toLowerCase() ||
                        e.current_title?.toLowerCase() === contact.title?.toLowerCase()
                    );

                    if (bestMatch) {
                        employeeId = bestMatch.id;
                    } else if (response.items.length > 0) {
                        employeeId = response.items[0].id;
                    }
                }
            } catch (err) {
                console.error("Search fallback failed:", err);
            }
        }

        // Call the parent-provided handler with the employee info
        onSelectEmployee(
            employeeId || null,
            { name: matchedEmployee?.full_name || cleanName, title: matchedEmployee?.current_title || contact.title || undefined },
            context
        );
    };

    const sortedPlaybooks = useMemo(() => {
        return [...playbooks]
            .sort((a, b) => (Number(b.fit_score) || 0) - (Number(a.fit_score) || 0))
            .filter(p => !searchQuery || p.product_group.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [playbooks, searchQuery]);

    useEffect(() => {
        if (selectedId === null && sortedPlaybooks.length > 0) {
            setSelectedId(sortedPlaybooks[0].id);
        }
    }, [sortedPlaybooks, selectedId]);

    useEffect(() => {
        if (selectedId === null) {
            setPlaybookDetail(null);
            return;
        }

        if (!domain) {
            console.warn('Cannot fetch playbook detail: domain is missing');
            return;
        }

        setLoadingDetail(true);
        getCompanyPlaybook(domain, selectedId)
            .then(setPlaybookDetail)
            .catch(console.error)
            .finally(() => setLoadingDetail(false));
    }, [selectedId, domain]);

    return (
        <div className="flex h-[calc(100vh-220px)] min-h-[500px] rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm animate-in fade-in duration-700">
            {/* Sidebar - Pro List Style */}
            <div className="w-[300px] flex flex-col border-r border-border/60 bg-muted/10">
                <div className="p-4 border-b border-border/60 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Strategies
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">{sortedPlaybooks.length}</span>
                            {onProcess && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => onProcess()}
                                    title="Regenerate Playbooks"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Find a strategy..."
                            className="pl-8 h-8 text-sm bg-muted/30 border-input shadow-none focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="divide-y divide-border/60"
                    >
                        {sortedPlaybooks.map((pb) => {
                            const isSelected = selectedId === pb.id;
                            const score = Number(pb.fit_score) || 0;

                            return (
                                <motion.button
                                    key={pb.id}
                                    variants={item}
                                    onClick={() => setSelectedId(pb.id)}
                                    className={cn(
                                        "w-full text-left p-4 transition-all group flex items-start gap-4 relative",
                                        isSelected
                                            ? "bg-card z-10 shadow-sm"
                                            : "hover:bg-muted/30 bg-muted/5 text-muted-foreground"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className={cn("font-medium text-sm truncate mb-1.5", isSelected ? "text-foreground" : "text-foreground/80")}>
                                            {pb.product_group}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className={cn(
                                                "font-semibold",
                                                score >= 0.7 ? "text-emerald-600 dark:text-emerald-500" :
                                                    score >= 0.4 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
                                            )}>
                                                {score.toFixed(2)} Match
                                            </span>
                                            {pb.fit_urgency && (
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <Zap className="w-3 h-3" />
                                                    {pb.fit_urgency}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className={cn(
                                        "w-4 h-4 mt-1 transition-all",
                                        isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground/50 group-hover:translate-x-0.5"
                                    )} />
                                </motion.button>
                            );
                        })}
                        {sortedPlaybooks.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No results found
                            </div>
                        )}
                    </motion.div>
                </ScrollArea>
            </div>

            {/* Detail View */}
            <div className="flex-1 flex flex-col min-w-0 bg-card">
                {selectedId === null ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <Briefcase className="w-12 h-12 stroke-[1.5] mb-4 opacity-20" />
                        <p>Select a strategy to view details</p>
                    </div>
                ) : loadingDetail ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : playbookDetail ? (
                    <ScrollArea className="h-full">
                        <motion.div
                            variants={detailContainer}
                            initial="hidden"
                            animate="show"
                            className="p-8 max-w-4xl mx-auto space-y-10 pb-20"
                        >

                            {/* Header */}
                            <motion.div variants={detailItem} className="flex items-start justify-between gap-4 mb-6">
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-foreground mb-1">
                                        {playbookDetail.product_group}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {playbookDetail.contacts?.length || 0} stakeholders identified
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {playbookDetail.fit_score !== null && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-800/30">
                                            <Target className="w-3 h-3" />
                                            {(Number(playbookDetail.fit_score) * 100).toFixed(0)}%
                                        </div>
                                    )}
                                    {playbookDetail.fit_urgency && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-md border border-amber-100 dark:border-amber-800/30">
                                            <Zap className="w-3 h-3" />
                                            {playbookDetail.fit_urgency}/10
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Signal Basis (Context) */}
                            {playbookDetail.generation_metadata?.signal_basis && (
                                <motion.section variants={detailItem}>
                                    <SectionHeader title="Why This Account?" />
                                    <div className="space-y-5 pl-4">
                                        {/* Top Events */}
                                        {playbookDetail.generation_metadata.signal_basis.top_events?.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Recent Signals
                                                </h4>
                                                <div className="space-y-2">
                                                    {playbookDetail.generation_metadata.signal_basis.top_events.map((event, i) => (
                                                        <div key={i} className="flex items-start gap-3 text-sm group">
                                                            <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-medium text-foreground capitalize">
                                                                        {event.category.replace('_', ' ')}
                                                                    </span>
                                                                    {event.urgency >= 7 && (
                                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                            <Zap className="w-2.5 h-2.5 mr-0.5" /> Urgent
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">{event.influence_on_strategy}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Interests */}
                                        {playbookDetail.generation_metadata.signal_basis.top_interests?.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                    Strategic Interests
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {playbookDetail.generation_metadata.signal_basis.top_interests.map((interest, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-muted/50 text-foreground/80 rounded-md"
                                                        >
                                                            {interest.category.replace('_', ' ')}
                                                            <span className="ml-1.5 text-muted-foreground font-normal">
                                                                {interest.strength}/10
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {/* Elevator Pitch */}
                            {playbookDetail.elevator_pitch && (
                                <motion.section variants={detailItem}>
                                    <SectionHeader title="Elevator Pitch" />
                                    <blockquote className="pl-4 border-l-2 border-primary/30 italic text-muted-foreground leading-relaxed">
                                        "{playbookDetail.elevator_pitch}"
                                    </blockquote>
                                </motion.section>
                            )}

                            {/* Reasoning & Value */}
                            <motion.div variants={detailItem} className="grid md:grid-cols-2 gap-8">
                                {playbookDetail.fit_reasoning && (
                                    <section>
                                        <SectionHeader title="Strategic Rationale" />
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                                            {playbookDetail.fit_reasoning}
                                        </p>
                                    </section>
                                )}
                                {playbookDetail.value_proposition && (
                                    <section>
                                        <SectionHeader title="Value Proposition" />
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                                            {playbookDetail.value_proposition}
                                        </p>
                                    </section>
                                )}
                            </motion.div>

                            {/* Key Stakeholders */}
                            {playbookDetail.contacts && playbookDetail.contacts.length > 0 && (
                                <motion.section variants={detailItem} className="pt-8 border-t border-border/40">
                                    <SectionHeader title="Key Stakeholders to Target" count={playbookDetail.contacts.length} />
                                    <div className="grid gap-4">
                                        {playbookDetail.contacts.map((contact) => (
                                            <Card
                                                key={contact.id}
                                                className="overflow-hidden group transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                                            >
                                                <div className="p-4 bg-muted/20 border-b border-border/60 flex items-start gap-4">
                                                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center shrink-0">
                                                        <Users className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-4 mb-1">
                                                            <h4 className="font-semibold text-foreground truncate">{contact.name}</h4>
                                                            {contact.fit_score !== null && (
                                                                <Badge variant="secondary" className={cn(
                                                                    "ml-auto shrink-0",
                                                                    (contact.fit_score ?? 0) >= 0.8 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : ""
                                                                )}>
                                                                    {((contact.fit_score ?? 0) * 100).toFixed(0)}% Match
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-foreground/80 mb-0.5">{contact.title}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                                                                {contact.role_category}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => handleEmployeeClick(contact)}
                                                        title="View Full Profile"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <CardContent className="p-4 space-y-4">
                                                    {contact.value_prop && (
                                                        <div className="text-sm">
                                                            <span className="font-medium text-foreground/90 block mb-1">Why them?</span>
                                                            <p className="text-muted-foreground leading-relaxed">{contact.value_prop}</p>
                                                        </div>
                                                    )}

                                                    {contact.outreach_templates && contact.outreach_templates.length > 0 && (
                                                        <div className="space-y-3 pt-2">
                                                            <div className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Outreach Drafts</div>
                                                            {contact.outreach_templates.map(template => (
                                                                <div key={template.id} className="space-y-2">
                                                                    {template.draft_message && (
                                                                        <div className="text-sm p-3 bg-muted/30 rounded-md border border-border/50">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="font-medium flex items-center gap-1.5 text-xs text-foreground/70">
                                                                                    <Mail className="w-3.5 h-3.5" /> Email Draft
                                                                                </span>
                                                                                <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]" onClick={() => navigator.clipboard.writeText(template.draft_message || '')}>
                                                                                    <Copy className="w-3 h-3" /> Copy
                                                                                </Button>
                                                                            </div>
                                                                            <div className="text-muted-foreground whitespace-pre-wrap font-mono text-xs leading-relaxed">
                                                                                {template.draft_message}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Discovery Questions */}
                            {playbookDetail.discovery_questions && playbookDetail.discovery_questions.length > 0 && (
                                <motion.section variants={detailItem}>
                                    <SectionHeader title="Discovery Questions" count={playbookDetail.discovery_questions.length} />
                                    <div className="space-y-2 pl-4">
                                        {(playbookDetail.discovery_questions as string[]).map((q, i) => (
                                            <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                                <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                <span className="text-foreground/90">{q}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Objections */}
                            {playbookDetail.objection_handling && Object.keys(playbookDetail.objection_handling).length > 0 && (
                                <motion.section variants={detailItem}>
                                    <SectionHeader title="Objection Handling" count={Object.keys(playbookDetail.objection_handling).length} />
                                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                                        {Object.entries(playbookDetail.objection_handling).map(([obj, response], i) => (
                                            <Card key={i} className="overflow-hidden bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/30 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex gap-2 mb-2 font-medium text-sm text-orange-900 dark:text-orange-400">
                                                        <ShieldAlert className="w-4 h-4 shrink-0" />
                                                        "{obj}"
                                                    </div>
                                                    <p className="text-sm text-muted-foreground ml-6">
                                                        {String(response)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Channels */}
                            {playbookDetail.recommended_channels && playbookDetail.recommended_channels.length > 0 && (
                                <motion.section variants={detailItem}>
                                    <SectionHeader title="Recommended Channels" count={playbookDetail.recommended_channels.length} />
                                    <div className="flex flex-wrap gap-2 pl-4">
                                        {(playbookDetail.recommended_channels as string[]).map((ch, i) => (
                                            <Badge key={i} variant="outline" className="px-3 py-1.5 font-normal bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                <Hash className="w-3 h-3 mr-1 opacity-50" />
                                                {ch}
                                            </Badge>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Generation Metadata Footer */}
                            {playbookDetail.generation_metadata && (
                                <motion.div variants={detailItem} className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground bg-muted/20 -mx-8 px-8 pb-6 -mb-20">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2" title="AI Generated">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            <span>AI-Generated Playbook</span>
                                        </div>
                                        {playbookDetail.contacts && (
                                            <div className="flex items-center gap-2" title="Stakeholders">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{playbookDetail.contacts.length} Stakeholders Identified</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Last updated: {playbookDetail.regenerated_at ? new Date(playbookDetail.regenerated_at).toLocaleDateString() : 'Unknown'}</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </ScrollArea>
                ) : null}
            </div>
        </div>
    );
}
