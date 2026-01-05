"use client";

import { TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { KPIData } from "@/lib/schemas/analytics.types";

interface KPICardProps {
    data: KPIData;
}

function Sparkline({ data }: { data: number[] }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 100;
    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke="#4285F4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            {/* End dot */}
            <circle
                cx={(data.length - 1) / (data.length - 1) * width}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="3"
                fill="#4285F4"
            />
        </svg>
    );
}

export function KPICard({ data }: KPICardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {data.title}
                            </p>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs max-w-[200px]">
                                            {data.title === "Total Opportunities Assigned" &&
                                                "Total number of sales opportunities assigned to partners in the selected period."}
                                            {data.title === "Active Pipeline" &&
                                                "Total value of opportunities currently in the sales pipeline."}
                                            {data.title === "Converted to SS2" &&
                                                "Opportunities that have reached Sales Stage 2 (qualified)."}
                                            {data.title === "Partner Engagement Rate" &&
                                                "Percentage of assigned opportunities where partners have taken action."}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {data.value}
                        </p>
                        {data.subtitle && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {data.subtitle}
                            </p>
                        )}
                    </div>
                    {data.sparklineData && (
                        <div className="hidden sm:block">
                            <Sparkline data={data.sparklineData} />
                        </div>
                    )}
                </div>

                {data.trend && (
                    <div className="mt-4 flex items-center gap-1.5">
                        {data.trend.direction === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span
                            className={`text-sm font-medium ${data.trend.direction === "up"
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            {data.trend.direction === "up" ? "↑" : "↓"} {data.trend.value}%
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {data.trend.label}
                        </span>
                    </div>
                )}

                {data.progress && (
                    <div className="mt-4 space-y-1.5">
                        <Progress value={data.progress.value} className="h-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {data.progress.value}% {data.progress.label}
                        </p>
                    </div>
                )}

                {data.warning && (
                    <div className="mt-4 flex items-center gap-1.5 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">{data.warning}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
