
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SourceDetail, SignalProvenanceResponse, SignalContributor } from '@/lib/schemas/provenance';
import { ExternalLink, Database, Users, Calendar, Quote, Signal, SignalHigh, SignalMedium, SignalLow, SignalZero } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalProvenanceSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    signal: SignalProvenanceResponse | null;
    isLoading?: boolean;
}

export function SignalProvenanceSheet({ open, onOpenChange, signal, isLoading }: SignalProvenanceSheetProps) {
    if (!signal && !isLoading) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-l shadow-xl"
                style={{ width: '100%', maxWidth: '650px', zIndex: 60 }}
                overlayClassName="!z-[60]"
            >
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                ) : signal ? (
                    <>
                        <div className="p-6 pb-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                            <SheetHeader className="space-y-4">
                                <div className="space-y-3">
                                    {/* Signal type and confidence badges */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="capitalize text-xs">
                                            {signal.signal_type}
                                        </Badge>
                                        <Badge variant={signal.confidence > 0.7 ? "default" : "secondary"} className="text-xs">
                                            {Math.round(signal.confidence * 100)}% Confidence
                                        </Badge>
                                        {signal.source_types && signal.source_types.length > 0 && (
                                            signal.source_types.slice(0, 3).map((sourceType, i) => (
                                                <Badge key={i} variant="secondary" className="capitalize text-xs">
                                                    {sourceType.replace(/_/g, ' ')}
                                                </Badge>
                                            ))
                                        )}
                                    </div>

                                    {/* Main title with strength badge */}
                                    <div className="flex items-center justify-between gap-2">
                                        <SheetTitle className="text-2xl font-bold tracking-tight">
                                            {signal.display_name || signal.signal_category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </SheetTitle>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold shrink-0",
                                            Math.round(signal.strength) >= 8
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                                : Math.round(signal.strength) >= 6
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                    : Math.round(signal.strength) >= 4
                                                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        )}>
                                            <SignalStrengthIcon strength={signal.strength} className="w-4 h-4" />
                                            {Math.round(signal.strength)}/10
                                        </span>
                                    </div>

                                    {/* Category subtitle if display_name is different from category */}
                                    <div className="flex items-center gap-3">
                                        {signal.display_name && signal.display_name !== signal.signal_category && (
                                            <SheetDescription className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                                                {signal.signal_category.replace(/_/g, ' ')}
                                            </SheetDescription>
                                        )}
                                        {signal.component_count !== undefined && signal.component_count > 0 && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {signal.component_count} component{signal.component_count !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6">
                            <div className="py-6 space-y-8">
                                {/* Summary */}
                                {signal.evidence_summary && (
                                    <section>
                                        <div className="bg-muted/30 border border-border rounded-lg p-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                                                <Quote className="h-3 w-3" />
                                                Evidence Summary
                                            </h3>
                                            <p className="text-sm leading-relaxed text-foreground">
                                                {signal.evidence_summary}
                                            </p>
                                        </div>
                                    </section>
                                )}

                                {/* Source Details */}
                                {signal.source_details && signal.source_details.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Database className="h-4 w-4 text-primary" />
                                            Primary Sources
                                        </h3>
                                        <div className="space-y-3">
                                            {signal.source_details.map((source, i) => (
                                                <SourceCard key={i} source={source} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Contributors (Employees) */}
                                {signal.contributors && signal.contributors.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            Contributing Employees ({signal.contributors.length})
                                        </h3>
                                        <div className="grid gap-3">
                                            {signal.contributors.map((contributor, i) => (
                                                <ContributorCard key={i} contributor={contributor} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Metadata */}
                                <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                                        <div className="space-y-1">
                                            <span className="block font-medium text-slate-700 dark:text-slate-400">Detected At</span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(signal.detected_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {signal.aggregation_method && (
                                            <div className="space-y-1">
                                                <span className="block font-medium text-slate-700 dark:text-slate-400">Aggregation</span>
                                                <span className="capitalize">{signal.aggregation_method.replace(/_/g, ' ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        Failed to load signal provenance.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function SignalStrengthIcon({ strength, className }: { strength: number; className?: string }) {
    if (strength >= 8) return <Signal className={className} />;
    if (strength >= 6) return <SignalHigh className={className} />;
    if (strength >= 4) return <SignalMedium className={className} />;
    if (strength >= 2) return <SignalLow className={className} />;
    return <SignalZero className={className} />;
}

function SourceCard({ source }: { source: SourceDetail }) {
    return (
        <div className="bg-card border border-border rounded-lg p-3 text-sm hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                        {source.title || source.source_type}
                    </div>
                    {source.snippet && (
                        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                            &quot;{source.snippet}&quot;
                        </p>
                    )}
                </div>
                {source.url && (
                    <a
                        href={source.url}
                        target="_blank"
                        rel="noopener"
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
            {source.collected_at && (
                <div className="mt-2 text-[10px] text-muted-foreground">
                    Collected: {new Date(source.collected_at).toLocaleDateString()}
                </div>
            )}
        </div>
    );
}

function ContributorCard({ contributor }: { contributor: SignalContributor }) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                    {contributor.employee_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                    {contributor.employee_name}
                </div>
                {(contributor.title || contributor.seniority_level) && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                        {contributor.title}
                        {contributor.title && contributor.seniority_level && " • "}
                        <span className="capitalize">{contributor.seniority_level}</span>
                    </div>
                )}
            </div>
            {contributor.evidence && (
                <Badge variant="outline" className="text-[10px] max-w-[120px] truncate" title={contributor.evidence}>
                    Has Evidence
                </Badge>
            )}
        </div>
    );
}
