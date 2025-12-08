// Signals Tab Component

import type { CompanySignalsResponse } from '@/lib/api';
import { EmptyState } from './components';
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

            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500" /> Events</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500" /> Interests</span>
            </div>
        </div>
    );
}
