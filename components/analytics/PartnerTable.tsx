"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Star, Info } from "lucide-react";
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
import type { PartnerPerformance, SortDirection } from "@/lib/schemas/analytics.types";

interface PartnerTableProps {
    data: PartnerPerformance[];
    onPartnerClick: (partner: PartnerPerformance) => void;
}

type SortField = keyof PartnerPerformance;

const tierColors: Record<string, string> = {
    Strategic: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    Disti: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    Service: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const healthIndicators: Record<string, { emoji: string; label: string; color: string }> = {
    green: { emoji: "🟢", label: "Healthy - meeting or exceeding targets", color: "text-green-600" },
    yellow: { emoji: "🟡", label: "At risk - below target but improving", color: "text-yellow-600" },
    red: { emoji: "🔴", label: "Needs attention - significantly below target", color: "text-red-600" },
};

export function PartnerTable({ data, onPartnerClick }: PartnerTableProps) {
    const [sortField, setSortField] = useState<SortField>("rank");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
                        Partner Performance Leaderboard
                    </h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs max-w-[250px]">
                                    Top performing partners ranked by conversion rate and pipeline value. Click any row to view partner details.
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
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-16"
                            onClick={() => handleSort("rank")}
                        >
                            <div className="flex items-center gap-1">
                                # <SortIcon field="rank" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => handleSort("name")}
                        >
                            <div className="flex items-center gap-1">
                                Partner <SortIcon field="name" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => handleSort("tier")}
                        >
                            <div className="flex items-center gap-1">
                                Tier <SortIcon field="tier" />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => handleSort("type")}
                        >
                            <div className="flex items-center gap-1">
                                Type <SortIcon field="type" />
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
                            onClick={() => handleSort("convRate")}
                        >
                            <div className="flex items-center gap-1 justify-end">
                                Conv. Rate <SortIcon field="convRate" />
                            </div>
                        </TableHead>
                        <TableHead className="text-center w-20">Health</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((partner) => (
                        <TableRow
                            key={partner.id}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => onPartnerClick(partner)}
                        >
                            <TableCell className="font-medium text-slate-500">{partner.rank}</TableCell>
                            <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                                {partner.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={tierColors[partner.tier]}>
                                    {partner.tier}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                                {partner.type}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {partner.assigned.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <span className="font-medium">{partner.engaged}</span>
                                <span className="text-slate-500 ml-1">({partner.engagedPercent}%)</span>
                            </TableCell>
                            <TableCell className="text-right">
                                <span className="font-medium">{partner.pipeline}</span>
                                <span className="text-slate-500 ml-1">({partner.pipelinePercent}%)</span>
                            </TableCell>
                            <TableCell className="text-right font-medium">{partner.ss2}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <span className={partner.convRate >= 4 ? "text-amber-600 font-medium" : ""}>
                                        {partner.convRate.toFixed(1)}%
                                    </span>
                                    {partner.convRate >= 4 && (
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span className="cursor-help text-lg">
                                                {healthIndicators[partner.health].emoji}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{healthIndicators[partner.health].label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
