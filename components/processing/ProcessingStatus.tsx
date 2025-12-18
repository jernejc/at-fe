'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Play, Loader2, CheckCircle2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { startProcessing, API_BASE } from '@/lib/api';

export function ProcessingStatus() {
    const [isOpen, setIsOpen] = useState(false);
    const [domain, setDomain] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Improved Log State: Store full objects to allow styling
    interface LogMessage {
        timestamp: string;
        text: string;
        type: 'info' | 'success' | 'error' | 'warning';
    }
    const [logs, setLogs] = useState<LogMessage[]>([]);

    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error' | 'stopped'>('idle');
    const [options, setOptions] = useState({
        force: false,
        include_posts: false,
        full_details: false
    });
    const [showOptions, setShowOptions] = useState(false);

    // Store event source in ref to handle stopping
    const eventSourceRef = useRef<EventSource | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const addLog = (text: string, type: LogMessage['type'] = 'info') => {
        setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            text,
            type
        }]);
    };

    const parseMessage = (rawMessage: string): { text: string, type: LogMessage['type'], isComplete: boolean, isError: boolean } => {
        let text = rawMessage;
        let type: LogMessage['type'] = 'info';
        let isComplete = false;
        let isError = false;

        try {
            // Try parsing as JSON first
            const data = JSON.parse(rawMessage);

            // Handle structured JSON event
            if (typeof data === 'object' && data !== null) {
                // Determine type from event type field
                const eventType = (data.type || '').toLowerCase();
                const status = (data.status || '').toLowerCase();

                // Handle 'complete' event type - format a summary instead of raw JSON
                if (eventType === 'complete' && data.data) {
                    isComplete = true;
                    type = 'success';
                    const result = data.data;
                    const signals = result.signals;

                    // Build readable summary
                    const parts: string[] = [];
                    if (signals) {
                        parts.push(`Interests: ${signals.interests_detected || 0}`);
                        parts.push(`Events: ${signals.events_detected || 0}`);
                        parts.push(`Signals stored: ${signals.signals_stored || 0}`);
                        if (signals.fit_scores?.length) {
                            parts.push(`Fit scores calculated: ${signals.fit_scores.length}`);
                        }
                    }
                    text = parts.length > 0 ? parts.join(', ') : 'Processing complete';
                    return { text, type, isComplete, isError };
                }

                // Handle error events
                if (status === 'error' || eventType === 'error') {
                    isError = true;
                    type = 'error';
                    text = data.error || data.message || 'Processing failed';
                    return { text, type, isComplete, isError };
                }

                // Handle progress/status events
                if (eventType === 'progress' || eventType === 'status') {
                    text = data.message || data.status || 'Processing...';
                    type = 'info';
                    return { text, type, isComplete, isError };
                }

                // Other structured messages
                if (status === 'completed' || status === 'done') {
                    isComplete = true;
                    type = 'success';
                    text = data.message || 'Processing completed';
                } else if (status === 'queued') {
                    type = 'warning';
                    text = data.message || 'Queued';
                } else if (status === 'processing') {
                    type = 'info';
                    text = data.message || 'Processing...';
                } else {
                    // Fallback: use message or status field, avoid raw JSON dump
                    text = data.message || data.status || data.step || 'Processing...';
                }

                // If we have a payload with more details, append it
                if (data.payload && typeof data.payload === 'string') {
                    text += `: ${data.payload}`;
                }

                return { text, type, isComplete, isError };
            }
        } catch (e) {
            // Not JSON, continue with string parsing
        }

        const cleanMessage = rawMessage.replace(/^"|"$/g, '');
        const lowerMsg = cleanMessage.toLowerCase();

        // Define patterns
        isError = lowerMsg.includes('failed') || lowerMsg.includes('error') || lowerMsg.includes('exception');
        isComplete = cleanMessage === 'completed' || cleanMessage.includes('Processing completed');
        const isSuccess = lowerMsg.includes('success') || lowerMsg.includes('saved') || lowerMsg.includes('done');

        if (isError) type = 'error';
        else if (isComplete) type = 'success';
        else if (isSuccess) type = 'success';

        return { text: cleanMessage, type, isComplete, isError };
    };

    const handleStart = async () => {
        if (!domain) return;

        // Reset state
        setIsProcessing(true);
        setStatus('running');
        setLogs([]); // Clear previous logs
        addLog(`Starting processing for ${domain}...`, 'info');

        // Close existing stream if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        try {
            // 1. Start processing with options
            const response = await startProcessing(domain, options);
            const processId = response?.process_id;

            if (!processId) {
                throw new Error('No process_id returned from API');
            }

            // 2. Listen for updates via SSE
            const streamPath = `/processing/${encodeURIComponent(processId)}/stream`;

            const evtSource = new EventSource(`${API_BASE}${streamPath}`);
            eventSourceRef.current = evtSource;

            evtSource.onmessage = (event) => {
                const { text, type, isComplete, isError } = parseMessage(event.data);

                addLog(text, type);

                if (isError) {
                    console.error('Processing failed:', text);
                    setStatus('error');
                    setIsProcessing(false);
                    evtSource.close();
                    eventSourceRef.current = null;
                    return; // Stop further processing
                }

                if (isComplete) {
                    setStatus('completed');
                    setIsProcessing(false);
                    evtSource.close();
                    eventSourceRef.current = null;
                }
            };

            evtSource.onerror = (err) => {
                // If we are already in error or completed state, ignore
                if (status !== 'running') return;

                console.error('EventSource error:', err);

                // NOTE: EventSource often fires 'error' when connection closes normally or interupts.
                // We should be careful not to trigger full 'error' state unless it's persistent.
                // For now, we log a warning.
                addLog('Connection interrupted. Waiting for updates...', 'warning');
            };

        } catch (error) {
            console.error('Failed to start processing:', error);
            addLog('Failed to start processing command.', 'error');
            setStatus('error');
            setIsProcessing(false);
        }
    };

    const handleStop = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsProcessing(false);
        setStatus('stopped');
        addLog('Processing stopped by user.', 'warning');
    };

    // Clear logs explicitly to reset view
    const clearLogs = () => {
        setLogs([]);
        setStatus('idle');
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${isProcessing ? 'border-primary/50 bg-primary/5 text-primary' : ''}`}
                onClick={toggleOpen}
            >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                {isProcessing ? 'Processing' : 'Process Domain'}
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 top-full mt-2 w-[520px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-border/80 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 space-y-4">

                            {/* Controls */}
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="example.com"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            disabled={isProcessing}
                                            className="pr-8 font-mono text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleStart()}
                                        />
                                        {domain && !isProcessing && (
                                            <button
                                                onClick={() => setDomain('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {isProcessing ? (
                                        <Button
                                            onClick={handleStop}
                                            variant="secondary"
                                            className="w-24 gap-2 shadow-sm border border-border/50"
                                        >
                                            <div className="w-2 h-2 bg-slate-500 rounded-[1px]" />
                                            Stop
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleStart}
                                            disabled={!domain}
                                            className="w-24 gap-2 shadow-sm"
                                        >
                                            <Play className="w-3 h-3 fill-current" />
                                            Run
                                        </Button>
                                    )}
                                </div>

                                {/* Options Toggle */}
                                <div>
                                    <button
                                        onClick={() => setShowOptions(!showOptions)}
                                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors select-none"
                                    >
                                        <span className={`transition-transform duration-200 ${showOptions ? 'rotate-90' : ''}`}>
                                            ▶
                                        </span>
                                        Configure Processing Options
                                    </button>

                                    {showOptions && (
                                        <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-border/50">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={options.full_details}
                                                    onChange={(e) => setOptions({ ...options, full_details: e.target.checked })}
                                                    disabled={isProcessing}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary"
                                                />
                                                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">Full Details</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={options.include_posts}
                                                    onChange={(e) => setOptions({ ...options, include_posts: e.target.checked })}
                                                    disabled={isProcessing}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary"
                                                />
                                                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">Fetch Posts</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={options.force}
                                                    onChange={(e) => setOptions({ ...options, force: e.target.checked })}
                                                    disabled={isProcessing}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary"
                                                />
                                                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">Force Re-process</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Logs Console - Only show when we have logs */}
                            {logs.length > 0 && (
                                <div className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner relative group">
                                    <div className="h-40 overflow-y-auto p-3 font-mono text-xs space-y-1">
                                        {logs.map((log, i) => (
                                            <div key={i} className="break-all pb-0.5 last:pb-0 animate-in fade-in slide-in-from-left-1 duration-100 flex gap-2">
                                                <span className="text-slate-600 dark:text-slate-500 shrink-0 select-none">
                                                    [{log.timestamp}]
                                                </span>
                                                <span className={`
                                                    ${log.type === 'error' ? 'text-red-400 font-medium' : ''}
                                                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                                                    ${log.type === 'warning' ? 'text-yellow-400' : ''}
                                                    ${log.type === 'info' ? 'text-slate-300' : ''}
                                                `}>
                                                    {log.text}
                                                </span>
                                            </div>
                                        ))}

                                        {/* Status Footer Indicators */}
                                        {status === 'completed' && (
                                            <div className="text-emerald-400 flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10 font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Processing Completed Successfully
                                            </div>
                                        )}
                                        {status === 'stopped' && (
                                            <div className="text-yellow-400 mt-2 pt-2 border-t border-white/10 font-bold">
                                                ⚠ Processing Stopped
                                            </div>
                                        )}
                                        {status === 'error' && (
                                            <div className="text-red-400 mt-2 pt-2 border-t border-white/10 font-bold">
                                                ✖ Processing Failed
                                            </div>
                                        )}
                                        <div ref={logsEndRef} />
                                    </div>

                                    {/* Quick clear button that shows on hover */}
                                    {!isProcessing && (
                                        <button
                                            onClick={clearLogs}
                                            className="absolute top-2 right-2 text-[10px] text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/50 px-1.5 py-0.5 rounded"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
