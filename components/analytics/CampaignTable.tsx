"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Check, Info } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CampaignPerformance, SortDirection } from "@/lib/schemas/analytics.types";

interface CampaignTableProps {
    data: CampaignPerformance[];
    onCampaignClick: (campaign: CampaignPerformance) => void;
}

type SortField = keyof CampaignPerformance;

const workloadColors: Record<string, string> = {
    Gemini: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    GCP: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Workspace: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Looker: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
}

export function CampaignTable({ data, onCampaignClick }: CampaignTableProps) {
    const [sortField, setSortField] = useState<SortField>("assigned");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const sortedData = [...data].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
            return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDirection === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (field !== sortField) return null;
        return sortDirection === "asc" ? (
            <ChevronUp className="w-4 h-4" />
        ) : (
            <ChevronDown className="w-4 h-4" />
        );
    };

    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Campaign Performance
                    </h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs max-w-[250px]">
                                    Performance metrics for all active campaigns. Click any row to view detailed breakdown.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => handleSort("name")}
                        >
                            <div className="flex items-center gap-1">
                                Campaign <SortIcon field="name" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => handleSort("workload")}
                        >
                            <div className="flex items-center gap-1">
                                Workload <SortIcon field="workload" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                            onClick={() => handleSort("assigned")}
                        >
                            <div className="flex items-center gap-1 justify-end">
                                Assigned <SortIcon field="assigned" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                            onClick={() => handleSort("engaged")}
                        >
                            <div className="flex items-center gap-1 justify-end">
                                Engaged <SortIcon field="engaged" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                            onClick={() => handleSort("pipeline")}
                        >
                            <div className="flex items-center gap-1 justify-end">
                                Pipeline <SortIcon field="pipeline" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                            onClick={() => handleSort("ss2")}
                        >
                            <div className="flex items-center gap-1 justify-end">
                                SS2 <SortIcon field="ss2" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                            onClick={() => handleSort("pipelineValue")}
                        >
                            <div className="flex items-center gap-1 justify-end">
                                Pipeline $ <SortIcon field="pipelineValue" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                            onClick={() => handleSort("convRate")}
                        >
                            <div className="flex items-center gap-1 justify-end">
                                Conv. Rate <SortIcon field="convRate" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => handleSort("pdm")}
                        >
                            <div className="flex items-center gap-1">
                                PDM <SortIcon field="pdm" />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((campaign) => (
                        <TableRow
                            key={campaign.id}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => onCampaignClick(campaign)}
                        >
                            <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                                {campaign.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={workloadColors[campaign.workload]}>
                                    {campaign.workload}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {campaign.assigned.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <span className="font-medium">{campaign.engaged}</span>
                                <span className="text-slate-500 ml-1">({campaign.engagedPercent}%)</span>
                            </TableCell>
                            <TableCell className="text-right">
                                <span className="font-medium">{campaign.pipeline}</span>
                                <span className="text-slate-500 ml-1">({campaign.pipelinePercent}%)</span>
                            </TableCell>
                            <TableCell className="text-right font-medium">{campaign.ss2}</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(campaign.pipelineValue)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <span className={campaign.convRate >= 2.5 ? "text-green-600 font-medium" : ""}>
                                        {campaign.convRate.toFixed(1)}%
                                    </span>
                                    {campaign.convRate >= 2.5 && (
                                        <Check className="w-4 h-4 text-green-600" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{campaign.pdm}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
