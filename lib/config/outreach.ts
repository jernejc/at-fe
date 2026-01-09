import { Clock, FileEdit, Send, MessageSquare, CalendarCheck } from 'lucide-react';

export type OutreachStatus = 'not_started' | 'draft' | 'sent' | 'replied' | 'meeting_booked';

export const OUTREACH_CONFIG: Record<OutreachStatus, {
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}> = {
    not_started: { label: 'Not Started', shortLabel: 'Pending', icon: Clock, color: 'text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800' },
    draft: { label: 'Draft', shortLabel: 'Draft', icon: FileEdit, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
    sent: { label: 'Sent', shortLabel: 'Sent', icon: Send, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    replied: { label: 'Replied', shortLabel: 'Replied', icon: MessageSquare, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
    meeting_booked: { label: 'Meeting', shortLabel: 'Meeting', icon: CalendarCheck, color: 'text-violet-500', bgColor: 'bg-violet-50 dark:bg-violet-900/20' },
};
