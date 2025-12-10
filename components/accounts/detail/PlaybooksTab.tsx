// Playbooks Tab Component

import { useState, useEffect } from 'react';
import type { PlaybookSummary, PlaybookRead } from '@/lib/schemas';
import { getPlaybook } from '@/lib/api';
import { EmptyState } from './components';
import { cn } from '@/lib/utils';

interface PlaybooksTabProps {
    playbooks: PlaybookSummary[];
}

export function PlaybooksTab({ playbooks }: PlaybooksTabProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        // Preselect the first playbook if none is selected and playbooks are available
        if (selectedId === null && playbooks.length > 0) {
            setSelectedId(playbooks[0].id);
            return;
        }

        if (selectedId === null) {
            setPlaybookDetail(null);
            return;
        }
        setLoadingDetail(true);
        getPlaybook(selectedId)
            .then(setPlaybookDetail)
            .catch(console.error)
            .finally(() => setLoadingDetail(false));
    }, [selectedId, playbooks]);

    if (playbooks.length === 0) {
        return <EmptyState>No playbooks generated yet</EmptyState>;
    }

    return (
        <div className="p-6">
            <div className="flex gap-6 h-full items-start">
                {/* Playbook list */}
                <div className="w-64 shrink-0 space-y-4 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                        <h3 className="font-semibold">Product Groups</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border">
                        {playbooks.map((pb) => (
                            <button
                                key={pb.id}
                                onClick={() => setSelectedId(pb.id)}
                                className={cn(
                                    "w-full p-3 text-left transition-colors border-b last:border-0",
                                    selectedId === pb.id ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-4 border-l-blue-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-l-transparent"
                                )}
                            >
                                <p className="font-semibold text-sm text-foreground">{pb.product_group}</p>
                                <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground/80 font-medium">
                                    {pb.fit_score !== null && (
                                        <span className="text-emerald-600 dark:text-emerald-400">Score: {Number(pb.fit_score).toFixed(2)}</span>
                                    )}
                                    {pb.fit_urgency !== null && (
                                        <span className="text-amber-600 dark:text-amber-400">Urgency: {pb.fit_urgency}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Playbook details */}
                <div className="flex-1 min-w-0 bg-white dark:bg-slate-900/50 rounded-xl border p-6 shadow-sm">
                    {selectedId === null ? (
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            Select a playbook to view details
                        </div>
                    ) : loadingDetail ? (
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                            Loading logic...
                        </div>
                    ) : playbookDetail ? (
                        <div className="space-y-8 animate-in fade-in-50 duration-500">
                            {/* Scores */}
                            <div className="flex gap-8 pb-6 border-b border-dashed">
                                {playbookDetail.fit_score !== null && (
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{Number(playbookDetail.fit_score).toFixed(2)}</span>
                                        <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-1">Fit Score</span>
                                    </div>
                                )}
                                {playbookDetail.fit_urgency !== null && (
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-bold text-amber-500 dark:text-amber-400 tracking-tight">{playbookDetail.fit_urgency}</span>
                                        <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-1">Urgency</span>
                                    </div>
                                )}
                            </div>

                            {/* Reasoning */}
                            {playbookDetail.fit_reasoning && (
                                <section>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Fit Reasoning
                                    </h4>
                                    <p className="text-sm text-foreground leading-relaxed">{playbookDetail.fit_reasoning}</p>
                                </section>
                            )}

                            {/* Value Proposition */}
                            {playbookDetail.value_proposition && (
                                <section>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Value Proposition
                                    </h4>
                                    <p className="text-sm text-foreground leading-relaxed">{playbookDetail.value_proposition}</p>
                                </section>
                            )}

                            {/* Elevator Pitch */}
                            {playbookDetail.elevator_pitch && (
                                <section className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                    <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Elevator Pitch</h4>
                                    <p className="text-sm text-blue-900/80 dark:text-blue-200/90 leading-relaxed italic">"{playbookDetail.elevator_pitch}"</p>
                                </section>
                            )}

                            {/* Discovery Questions */}
                            {playbookDetail.discovery_questions && playbookDetail.discovery_questions.length > 0 && (
                                <section>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Discovery Questions
                                    </h4>
                                    <ul className="space-y-3">
                                        {(playbookDetail.discovery_questions as string[]).map((q, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-foreground bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <span className="font-bold text-blue-500/50 select-none min-w-[20px]">{i + 1}.</span>
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Objection Handling */}
                            {playbookDetail.objection_handling && Object.keys(playbookDetail.objection_handling).length > 0 && (
                                <section>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Objection Handling
                                    </h4>
                                    <div className="grid gap-4">
                                        {Object.entries(playbookDetail.objection_handling).map(([obj, response]) => (
                                            <div key={obj} className="text-sm bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                                <p className="font-semibold text-orange-900 dark:text-orange-300 mb-2">🛑 "{obj}"</p>
                                                <p className="text-muted-foreground leading-relaxed pl-1">💡 {String(response)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Recommended Channels */}
                            {playbookDetail.recommended_channels && playbookDetail.recommended_channels.length > 0 && (
                                <section>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Recommended Channels
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(playbookDetail.recommended_channels as string[]).map((ch, i) => (
                                            <span key={i} className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                                                {ch}
                                            </span>
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
