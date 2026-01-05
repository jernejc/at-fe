"use client";

import { Info } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PDMActivity } from "@/lib/schemas/analytics.types";

interface PDMTableProps {
    data: PDMActivity[];
}

export function PDMTable({ data }: PDMTableProps) {
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        PDM Activity Summary
                    </h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs max-w-[250px]">
                                    Overview of Partner Development Manager workload and response metrics.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead>PDM Name</TableHead>
                        <TableHead className="text-right">Active Campaigns</TableHead>
                        <TableHead className="text-right">Opps Assigned</TableHead>
                        <TableHead className="text-right">Partners Managed</TableHead>
                        <TableHead className="text-right">Avg Response Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((pdm) => (
                        <TableRow key={pdm.id}>
                            <TableCell className="font-medium text-slate-900 dark:text-white">
                                {pdm.name}
                            </TableCell>
                            <TableCell className="text-right">{pdm.activeCampaigns}</TableCell>
                            <TableCell className="text-right font-medium">
                                {pdm.oppsAssigned.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">{pdm.partnersManaged}</TableCell>
                            <TableCell className="text-right">
                                <span
                                    className={
                                        parseFloat(pdm.avgResponseTime) <= 4
                                            ? "text-green-600 font-medium"
                                            : parseFloat(pdm.avgResponseTime) <= 5
                                                ? "text-amber-600"
                                                : "text-red-600"
                                    }
                                >
                                    {pdm.avgResponseTime}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
