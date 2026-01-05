"use client";

import { Info, Lightbulb } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { WorkloadData } from "@/lib/schemas/analytics.types";

interface WorkloadChartProps {
    data: WorkloadData[];
    insights: string[];
}

const workloadColors = ["#4285F4", "#34A853", "#EA4335", "#9333EA", "#F59E0B"];

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: WorkloadData;
    }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
                <div className="mt-2 space-y-1 text-sm">
                    <p className="text-slate-600 dark:text-slate-300">
                        Assigned: <span className="font-medium">{data.assigned}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                        Pipeline: <span className="font-medium">{data.pipeline}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                        Value: <span className="font-medium">{formatCurrency(data.value)}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                        Conv. Rate: <span className="font-medium">{data.conversionRate}%</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
}

export function WorkloadChart({ data, insights }: WorkloadChartProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Pipeline by Workload
                            </h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-4 h-4 text-slate-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs max-w-[250px]">
                                            Comparison of opportunity progression across different Google Cloud workloads.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-500" />
                                <span>Pipeline Value</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                                <XAxis
                                    type="number"
                                    tickFormatter={(value) => formatCurrency(value)}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#1e293b", fontSize: 13, fontWeight: 500 }}
                                    width={95}
                                />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {data.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={workloadColors[index % workloadColors.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary stats */}
                    <div className="mt-4 grid grid-cols-5 gap-4">
                        {data.map((item, index) => (
                            <div
                                key={item.name}
                                className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                            >
                                <div className="text-lg font-bold" style={{ color: workloadColors[index] }}>
                                    {item.conversionRate}%
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {item.pipeline} in pipeline
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Key Insights
                        </h3>
                    </div>
                    <ul className="space-y-3">
                        {insights.map((insight, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                </span>
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
