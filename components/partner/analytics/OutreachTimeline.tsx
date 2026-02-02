'use client';

import { Mail, MailOpen, MessageSquare, Calendar, Phone, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/lib/data/crm-analytics.mock';

interface OutreachTimelineProps {
    events: TimelineEvent[];
}

const EVENT_ICONS: Record<TimelineEvent['type'], typeof Mail> = {
    email_sent: Mail,
    email_opened: MailOpen,
    reply: MessageSquare,
    meeting: Calendar,
    call: Phone,
    note: FileText,
};

const EVENT_COLORS: Record<TimelineEvent['type'], { bg: string; text: string }> = {
    email_sent: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    email_opened: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' },
    reply: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    meeting: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    call: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    note: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' },
};

export function OutreachTimeline({ events }: OutreachTimelineProps) {
    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />

            {/* Events */}
            <div className="space-y-4">
                {events.map((event, index) => {
                    const Icon = EVENT_ICONS[event.type];
                    const colors = EVENT_COLORS[event.type];

                    return (
                        <div key={event.id} className="flex gap-3 relative">
                            {/* Icon */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                                    colors.bg
                                )}
                            >
                                <Icon className={cn("w-4 h-4", colors.text)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm text-slate-900 dark:text-white">
                                    {event.event}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {event.date}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
