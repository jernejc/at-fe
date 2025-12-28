'use client';

import { useMemo } from 'react';
import { MembershipWithProgress, OutreachStatus } from '@/lib/schemas/campaign';
import { cn } from '@/lib/utils';
import {
    Clock,
    FileEdit,
    Send,
    MessageSquare,
    CalendarCheck,
    Activity,
} from 'lucide-react';

interface RecentActivityProps {
    accounts: MembershipWithProgress[];
    onAccountClick: (domain: string) => void;
}

interface ActivityEvent {
    id: string;
    type: OutreachStatus;
    companyName: string;
    domain: string;
    timestamp: Date;
    description: string;
}

const STATUS_CONFIG: Record<OutreachStatus, {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    verb: string;
}> = {
    not_started: {
        icon: Clock,
        color: 'text-slate-500',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        verb: 'Added to queue',
    },
    draft: {
        icon: FileEdit,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-900/30',
        verb: 'Draft created',
    },
    sent: {
        icon: Send,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/30',
        verb: 'Outreach sent',
    },
    replied: {
        icon: MessageSquare,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
        verb: 'Reply received',
    },
    meeting_booked: {
        icon: CalendarCheck,
        color: 'text-violet-500',
        bgColor: 'bg-violet-50 dark:bg-violet-900/30',
        verb: 'Meeting booked',
    },
};

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentActivity({ accounts, onAccountClick }: RecentActivityProps) {
    // Generate activity events from account data
    const activities = useMemo<ActivityEvent[]>(() => {
        const events: ActivityEvent[] = [];

        accounts.forEach((account) => {
            // Add event for current status based on last_activity
            if (account.last_activity) {
                events.push({
                    id: `${account.id}-${account.outreach_status}`,
                    type: account.outreach_status,
                    companyName: account.company_name || account.domain,
                    domain: account.domain,
                    timestamp: new Date(account.last_activity),
                    description: STATUS_CONFIG[account.outreach_status].verb,
                });
            }

            // Add sent event if we have outreach_sent_at
            if (account.outreach_sent_at && account.outreach_status !== 'sent') {
                events.push({
                    id: `${account.id}-sent`,
                    type: 'sent',
                    companyName: account.company_name || account.domain,
                    domain: account.domain,
                    timestamp: new Date(account.outreach_sent_at),
                    description: 'Outreach sent',
                });
            }
        });

        // Sort by timestamp descending and take top 6
        return events
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 6);
    }, [accounts]);

    if (activities.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Recent Activity
                    </h3>
                </div>
                <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Recent Activity
                </h3>
            </div>

            <div className="space-y-1">
                {activities.map((activity, idx) => {
                    const config = STATUS_CONFIG[activity.type];
                    const Icon = config.icon;
                    const isLast = idx === activities.length - 1;

                    return (
                        <button
                            key={activity.id}
                            onClick={() => onAccountClick(activity.domain)}
                            className="w-full flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                        >
                            {/* Timeline indicator */}
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    config.bgColor
                                )}>
                                    <Icon className={cn("w-4 h-4", config.color)} />
                                </div>
                                {!isLast && (
                                    <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-700 mt-1" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                        {activity.companyName}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                                        {formatRelativeTime(activity.timestamp)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {activity.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
