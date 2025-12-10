// Signals Tab Component

import type { CompanySignalsResponse } from '@/lib/schemas';
import { EmptyState, SectionHeader } from './components';
import { cn } from '@/lib/utils';

interface SignalsTabProps {
    signals: CompanySignalsResponse | null;
}

export function SignalsTab({ signals }: SignalsTabProps) {
    if (!signals || (signals.interests.length === 0 && signals.events.length === 0)) {
        return <EmptyState>No signals detected</EmptyState>;
    }

    const allSignals = [
        ...signals.events.map(s => ({ ...s, type: 'event' as const })),
        ...signals.interests.map(s => ({ ...s, type: 'interest' as const }))
    ];

    return (
        <div className="space-y-6">
            <section>
                <SectionHeader title="Detected Signals" count={allSignals.length} color="bg-violet-600" />

                <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-card">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/60">
                        <div className="col-span-1">Type</div>
                        <div className="col-span-3">Category</div>
                        <div className="col-span-6">Evidence</div>
                        <div className="col-span-1 text-center">Str</div>
                        <div className="col-span-1 text-center">Urg</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-border/60">
                        {allSignals.map((s, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors">
                                <div className="col-span-1">
                                    <span className={cn(
                                        "inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-950 shadow-sm",
                                        s.type === 'event' ? 'bg-orange-500' : 'bg-blue-500'
                                    )} />
                                </div>
                                <div className="col-span-3 font-medium text-sm truncate">{s.category}</div>
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
                </div>

                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500" /> Events</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500" /> Interests</span>
                </div>
            </section>
        </div>
    );
}
