// Playbooks Tab Component - Standard List Styling

import { useState, useEffect, useMemo } from 'react';
import type { PlaybookSummary, PlaybookRead } from '@/lib/schemas';
import { getPlaybook } from '@/lib/api';
import { EmptyState, SectionHeader } from './components';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
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
    FileText
} from 'lucide-react';

interface PlaybooksTabProps {
    playbooks: PlaybookSummary[];
}

export function PlaybooksTab({ playbooks }: PlaybooksTabProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
                            <div>
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

                            <Separator />

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
        </div>
    );
}
