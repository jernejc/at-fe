import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Loader2, Brain, Activity, Clock, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { AgentCard, Invocation } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AgentDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    agentName: string | null;
    agentCard: AgentCard | null;
    invocations: Invocation[];
    isLoading: boolean;
    error?: string | null;
}

export function AgentDetailSheet({
    isOpen,
    onClose,
    agentName,
    agentCard,
    invocations,
    isLoading,
    error
}: AgentDetailSheetProps) {

    return (
        <Sheet modal={false} open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="left"
                showCloseButton={false}
                className="!z-10 !top-16 !h-[calc(100vh-4rem)] w-[400px] sm:w-[540px] !overflow-visible p-0 shadow-2xl border-r border-slate-200 bg-white/95 backdrop-blur-sm"
                overlayClassName="hidden"
            >
                {/* Custom Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 -right-9 p-2 bg-white/90 backdrop-blur border border-slate-200 shadow-md rounded-full text-slate-500 hover:text-slate-800 hover:bg-white transition-all z-50 group border-l-0 rounded-l-none"
                    title="Close Sidebar"
                >
                    <X size={20} />
                </button>

                <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p>Loading agent details...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2">
                            <AlertCircle size={32} />
                            <p>Error loading agent details</p>
                            <p className="text-sm text-slate-500">{error}</p>
                        </div>
                    ) : (
                        <>
                            <SheetHeader className="pb-6 border-b mb-6 border-slate-200">
                                <div className="flex items-center gap-2 mb-2 pt-4">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-600 border-slate-200">
                                        {agentCard?.type || 'AGENT'}
                                    </span>
                                </div>
                                <SheetTitle className="text-2xl">{agentCard?.name || agentName}</SheetTitle>
                                <SheetDescription>
                                    {agentCard?.description || 'No description available for this agent.'}
                                </SheetDescription>

                                {/* Stats from Card if available */}
                                {agentCard?.invocations_count !== undefined && (
                                    <div className="flex gap-4 mt-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Activity size={14} />
                                            <span>{agentCard.invocations_count} total invocations</span>
                                        </div>
                                    </div>
                                )}
                            </SheetHeader>

                            <div className="space-y-8">
                                {/* Invocations List */}
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <Clock size={16} className="text-blue-500" /> Recent Invocations
                                    </h3>

                                    {invocations.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No recent invocations found.</p>
                                    ) : (
                                        <div className="relative border-l border-slate-200 pl-4 space-y-6 ml-2">
                                            {invocations.map((invocation) => (
                                                <div key={invocation.id} className="relative">
                                                    <div className={cn(
                                                        "absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                                                        invocation.status === 'success' ? "bg-emerald-400" :
                                                            invocation.status === 'failure' ? "bg-red-400" : "bg-blue-400"
                                                    )}></div>

                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-slate-400 font-mono">
                                                                {invocation.timestamp ? formatDistanceToNow(new Date(invocation.timestamp), { addSuffix: true }) : 'Unknown time'}
                                                            </span>
                                                            <span className={cn(
                                                                "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                                                                invocation.status === 'success' ? "bg-emerald-100 text-emerald-700" :
                                                                    invocation.status === 'failure' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {invocation.status}
                                                            </span>
                                                        </div>

                                                        <div className="bg-slate-50 border border-slate-100 rounded p-2 text-xs font-mono text-slate-600 overflow-x-auto">
                                                            <div className="mb-1 font-bold text-slate-400">INPUT</div>
                                                            {JSON.stringify(invocation.input, null, 2)}
                                                        </div>

                                                        {invocation.output && (
                                                            <div className="bg-slate-50 border border-slate-100 rounded p-2 text-xs font-mono text-slate-600 overflow-x-auto mt-1">
                                                                <div className="mb-1 font-bold text-slate-400">OUTPUT</div>
                                                                {JSON.stringify(invocation.output, null, 2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
