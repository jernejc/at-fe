'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface PipelineTrendData {
    month: string;
    value: number;
}

interface PipelineTrendChartProps {
    data: PipelineTrendData[];
    title?: string;
}

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: PipelineTrendData;
    }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {data.payload.month}
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(data.value)}
                </p>
            </div>
        );
    }
    return null;
}

export function PipelineTrendChart({ data, title = 'Pipeline Trend' }: PipelineTrendChartProps) {
    return (
        <Card>
            <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                    {title}
                </h3>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={(value) => formatCurrency(value)}
                                width={50}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#pipelineGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
