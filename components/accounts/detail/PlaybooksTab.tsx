// Playbooks Tab Component

import { useState, useEffect } from 'react';
import type { PlaybookSummary, PlaybookRead } from '@/lib/api';
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
                                        {(playbookDetail.discovery_questions as string[]).map((q, i) => (
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
                                                <p className="text-muted-foreground pl-4">→ {String(response)}</p>
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
                                        {(playbookDetail.recommended_channels as string[]).map((ch, i) => (
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
