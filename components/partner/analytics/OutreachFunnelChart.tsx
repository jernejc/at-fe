'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { OUTREACH_CONFIG, type OutreachStatus } from '@/lib/config/outreach';

interface OutreachFunnelChartProps {
    data: Record<OutreachStatus, number>;
    title?: string;
}

// Map outreach status to chart-friendly colors (hex values)
const FUNNEL_COLORS: Record<OutreachStatus, string> = {
    not_started: '#94A3B8', // slate-400
    draft: '#F59E0B',       // amber-500
    sent: '#3B82F6',        // blue-500
    replied: '#10B981',     // emerald-500
    meeting_booked: '#8B5CF6', // violet-500
};

interface ChartDataItem {
    name: string;
    value: number;
    status: OutreachStatus;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ChartDataItem;
    }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const config = OUTREACH_CONFIG[data.status];
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {config.label}
                </p>
                <p className="text-lg font-bold" style={{ color: FUNNEL_COLORS[data.status] }}>
                    {data.value} companies
                </p>
            </div>
        );
    }
    return null;
}

export function OutreachFunnelChart({ data, title = 'Outreach Funnel' }: OutreachFunnelChartProps) {
    // Filter to show only the main funnel stages (exclude draft for cleaner visualization)
    const funnelStatuses: OutreachStatus[] = ['not_started', 'sent', 'replied', 'meeting_booked'];

    const chartData: ChartDataItem[] = funnelStatuses.map(status => ({
        name: OUTREACH_CONFIG[status].shortLabel,
        value: data[status] || 0,
        status,
    }));

    return (
        <Card>
            <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                    {title}
                </h3>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 500 }}
                                width={55}
                            />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                {chartData.map((entry) => (
                                    <Cell
                                        key={entry.status}
                                        fill={FUNNEL_COLORS[entry.status]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-3 justify-center">
                    {chartData.map((item) => (
                        <div key={item.status} className="flex items-center gap-1.5">
                            <div
                                className="w-2.5 h-2.5 rounded-sm"
                                style={{ backgroundColor: FUNNEL_COLORS[item.status] }}
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
