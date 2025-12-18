// Playbooks Tab Component - Standard List Styling

import { useState, useEffect, useMemo } from 'react';
import type { PlaybookSummary, PlaybookRead, EmployeeRead, PlaybookContactResponse, EmployeeSummary } from '@/lib/schemas';
import { getPlaybook, getEmployee, getEmployees } from '@/lib/api';
import { EmptyState, SectionHeader } from './components';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Search,
    Zap,
    Target,
    ShieldAlert,
    MessageCircle,
    Briefcase,
    Hash,
    ChevronRight,
    FileText,
    Users,
    Lightbulb,
    TrendingUp,
    AlertTriangle,
    Mail,
    Send,
    UserCheck,
    Copy,
    Check,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaybooksTabProps {
    playbooks: PlaybookSummary[];
    availableEmployees?: EmployeeSummary[];
    domain?: string;
}

export function PlaybooksTab({ playbooks, availableEmployees = [], domain }: PlaybooksTabProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Employee Detail State
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(null);
    const [selectedContext, setSelectedContext] = useState<{ role_category?: string | null; value_prop?: string | null; fit_score?: number | null } | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loadingEmployeeDetail, setLoadingEmployeeDetail] = useState(false);

    const handleEmployeeClick = async (contact: PlaybookContactResponse) => {
        setLoadingEmployeeDetail(true);

        // Capture context regardless of full profile
        setSelectedContext({
            role_category: contact.role_category,
            value_prop: contact.value_prop,
            fit_score: contact.fit_score
        });

        // Clean up name if it contains prefixes like "Name:"
        const cleanName = contact.name.replace(/^Name:\s*/i, '').trim();

        // Initialize with available contact data
        // Try to find matching employee ID if missing
        let employeeId = contact.employee_id;
        let matchedEmployee: EmployeeSummary | undefined;

        if (!employeeId && availableEmployees) {
            // Simple match by name - could be improved with fuzziness if needed
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
                // Search specifically for employees in this company
                const response = await getEmployees({
                    search: cleanName,
                    domain: domain,
                    page_size: 5
                });

                if (response.items && response.items.length > 0) {
                    // Start finding best match
                    const bestMatch = response.items.find(e =>
                        e.full_name.toLowerCase() === cleanName.toLowerCase() ||
                        e.current_title?.toLowerCase() === contact.title?.toLowerCase()
                    );

                    if (bestMatch) {
                        employeeId = bestMatch.id;
                    } else if (response.items.length > 0) {
                        // If no exact name match but we found results in this domain with strict search, take the first one
                        // This handles slight name variations
                        employeeId = response.items[0].id;
                    }
                }
            } catch (err) {
                console.error("Search fallback failed:", err);
            }
        }

        // Initialize with available contact data (merging with matched employee preview if found)
        setSelectedEmployee({
            id: employeeId || 0,
            full_name: matchedEmployee?.full_name || cleanName,
            current_title: matchedEmployee?.current_title || contact.title,
            avatar_url: matchedEmployee?.avatar_url,
            // Add other compatible fields if available or leave types loose as partial
        } as unknown as EmployeeRead);

        setDetailModalOpen(true);

        if (employeeId) {
            try {
                const response = await getEmployee(employeeId);
                if (response.employee) {
                    setSelectedEmployee(prev => ({ ...prev, ...response.employee } as EmployeeRead));
                }
            } catch (error) {
                console.error('Failed to load employee details:', error);
            }
        }

        setLoadingEmployeeDetail(false);
    };

    const handleCloseModal = () => {
        setDetailModalOpen(false);
        setTimeout(() => setSelectedEmployee(null), 300);
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
        <div className="flex h-[calc(100vh-220px)] min-h-[500px] rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
            {/* Sidebar - Pro List Style */}
            <div className="w-[300px] flex flex-col border-r border-border/60 bg-muted/10">
                <div className="p-4 border-b border-border/60 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            Strategies
                        </h3>
                        <span className="text-xs text-muted-foreground font-medium">{sortedPlaybooks.length}</span>
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
                    <div className="divide-y divide-border/60">
                        {sortedPlaybooks.map((pb) => {
                            const isSelected = selectedId === pb.id;
                            const score = Number(pb.fit_score) || 0;

                            return (
                                <button
                                    key={pb.id}
                                    onClick={() => setSelectedId(pb.id)}
                                    className={cn(
                                        "w-full text-left p-4 transition-colors group flex items-start gap-4 relative",
                                        isSelected
                                            ? "bg-card z-10"
                                            : "hover:bg-muted/30 bg-muted/5 text-muted-foreground"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
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
                                    {isSelected && <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />}
                                </button>
                            );
                        })}
                        {sortedPlaybooks.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No results found
                            </div>
                        )}
                    </div>
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
                        <div className="p-8 max-w-4xl mx-auto space-y-10 pb-20">

                            {/* Header */}
                            {/* Header */}
                            <div className="border-b border-border/40 pb-8">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                                    {playbookDetail.product_group}
                                </h2>
                                <div className="flex items-center gap-4">
                                    {playbookDetail.fit_score !== null && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                                            <Target className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Fit Score: {Number(playbookDetail.fit_score).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {playbookDetail.fit_urgency && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Urgency: {playbookDetail.fit_urgency}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Signal Basis (Context) */}
                            {playbookDetail.generation_metadata?.signal_basis && (
                                <section>
                                    <SectionHeader title="Why This Account?" />
                                    <div className="space-y-6">
                                        {/* Top Events */}
                                        {playbookDetail.generation_metadata.signal_basis.top_events?.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                                    Recent Signals & Events
                                                </h4>
                                                <div className="grid gap-3">
                                                    {playbookDetail.generation_metadata.signal_basis.top_events.map((event, i) => (
                                                        <div key={i} className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg text-sm">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-medium text-blue-700 dark:text-blue-400 capitalize">
                                                                    {event.category.replace('_', ' ')}
                                                                </span>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <span>Confidence: {(event.confidence * 100).toFixed(0)}%</span>
                                                                    {event.urgency >= 7 && (
                                                                        <span className="flex items-center text-amber-600 dark:text-amber-500 font-medium">
                                                                            <Zap className="w-3 h-3 mr-0.5" /> High Urgency
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-muted-foreground mb-2">{event.influence_on_strategy}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Interests */}
                                        {playbookDetail.generation_metadata.signal_basis.top_interests?.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                                    Strategic Interests
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {playbookDetail.generation_metadata.signal_basis.top_interests.map((interest, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant="outline"
                                                            className="px-3 py-1 bg-amber-50/50 text-amber-800 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/40"
                                                        >
                                                            {interest.category.replace('_', ' ')}
                                                            <span className="ml-1.5 opacity-60 text-xs">
                                                                {interest.strength}/10
                                                            </span>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Elevator Pitch */}
                            {playbookDetail.elevator_pitch && (
                                <section>
                                    <SectionHeader title="Elevator Pitch" />
                                    <blockquote className="pl-4 border-l-2 border-blue-200 dark:border-blue-800 italic text-muted-foreground leading-relaxed">
                                        "{playbookDetail.elevator_pitch}"
                                    </blockquote>
                                </section>
                            )}

                            {/* Reasoning & Value */}
                            <div className="grid md:grid-cols-2 gap-8">
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
                            </div>

                            {/* Key Stakeholders */}
                            {playbookDetail.contacts && playbookDetail.contacts.length > 0 && (
                                <section>
                                    <SectionHeader title="Key Stakeholders to Target" />
                                    <div className="grid gap-6">
                                        {playbookDetail.contacts.map((contact) => (
                                            <div key={contact.id} className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
                                                <div className="p-4 bg-muted/20 border-b border-border/60 flex items-start gap-4">
                                                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 w-10 h-10 flex items-center justify-center shrink-0">
                                                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                                                        className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                                        onClick={() => handleEmployeeClick(contact)}
                                                        title="View Full Profile"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="p-4 space-y-4">
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Discovery Questions */}
                            {playbookDetail.discovery_questions && playbookDetail.discovery_questions.length > 0 && (
                                <section>
                                    <SectionHeader title="Discovery Questions" />
                                    <div className="space-y-2 pl-4">
                                        {(playbookDetail.discovery_questions as string[]).map((q, i) => (
                                            <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                                <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                <span className="text-foreground/90">{q}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Objections */}
                            {playbookDetail.objection_handling && Object.keys(playbookDetail.objection_handling).length > 0 && (
                                <section>
                                    <SectionHeader title="Objection Handling" />
                                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                                        {Object.entries(playbookDetail.objection_handling).map(([obj, response], i) => (
                                            <div key={i} className="p-4 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30">
                                                <div className="flex gap-2 mb-2 font-medium text-sm text-orange-900 dark:text-orange-400">
                                                    <ShieldAlert className="w-4 h-4 shrink-0" />
                                                    "{obj}"
                                                </div>
                                                <p className="text-sm text-muted-foreground ml-6">
                                                    {String(response)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Channels */}
                            {playbookDetail.recommended_channels && playbookDetail.recommended_channels.length > 0 && (
                                <section>
                                    <SectionHeader title="Channels" />
                                    <div className="flex flex-wrap gap-2 pl-4">
                                        {(playbookDetail.recommended_channels as string[]).map((ch, i) => (
                                            <Badge key={i} variant="outline" className="px-3 py-1 font-normal bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                                <Hash className="w-3 h-3 mr-1 opacity-50" />
                                                {ch}
                                            </Badge>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </ScrollArea>
                ) : null}
            </div>

            <EmployeeDetailModal
                employee={selectedEmployee}
                open={detailModalOpen}
                onClose={handleCloseModal}
                isLoading={loadingEmployeeDetail}
                playbookContext={selectedContext}
            />
        </div>
    );
}
