
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SourceDetail, SignalProvenanceResponse, SignalContributor } from '@/lib/schemas/provenance';
import { ExternalLink, Database, Users, Calendar, AlertCircle, Quote } from 'lucide-react';

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
                        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                            <SheetHeader className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="capitalize">
                                            {signal.signal_type}
                                        </Badge>
                                        <Badge variant={signal.confidence > 0.7 ? "default" : "secondary"} className={signal.confidence > 0.7 ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                            {Math.round(signal.confidence * 100)}% Confidence
                                        </Badge>
                                    </div>
                                    <SheetTitle className="text-xl font-bold">
                                        {signal.signal_category}
                                    </SheetTitle>
                                    <SheetDescription>
                                        Detailed provenance and evidence for this detected signal.
                                    </SheetDescription>
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6">
                            <div className="py-6 space-y-8">
                                {/* Summary */}
                                {signal.evidence_summary && (
                                    <section>
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                                <Quote className="h-3 w-3" />
                                                Evidence Summary
                                            </h3>
                                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                {signal.evidence_summary}
                                            </p>
                                        </div>
                                    </section>
                                )}

                                {/* Source Details */}
                                {signal.source_details && signal.source_details.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Database className="h-4 w-4" />
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
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Users className="h-4 w-4" />
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

function SourceCard({ source }: { source: SourceDetail }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {source.title || source.source_type}
                    </div>
                    {source.snippet && (
                        <p className="text-slate-500 line-clamp-2 text-xs leading-relaxed">
                            "{source.snippet}"
                        </p>
                    )}
                </div>
                {source.url && (
                    <a
                        href={source.url}
                        target="_blank"
                        rel="noopener"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
            {source.collected_at && (
                <div className="mt-2 text-[10px] text-slate-400">
                    Collected: {new Date(source.collected_at).toLocaleDateString()}
                </div>
            )}
        </div>
    );
}

function ContributorCard({ contributor }: { contributor: SignalContributor }) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
            <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                    {contributor.employee_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                    {contributor.employee_name}
                </div>
                {(contributor.title || contributor.seniority_level) && (
                    <div className="text-xs text-slate-500 truncate">
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
