"use client";

import { X, Calendar, User, Activity, Edit, UserPlus, Download, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { CampaignDetail } from "@/lib/schemas/analytics.types";

interface CampaignModalProps {
    campaign: CampaignDetail | null;
    open: boolean;
    onClose: () => void;
}

export function CampaignModal({ campaign, open, onClose }: CampaignModalProps) {
    if (!campaign) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                {campaign.name}
                            </DialogTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created: {campaign.createdDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>PDM: {campaign.pdmName}</span>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        campaign.status === "Active"
                                            ? "bg-green-100 text-green-800"
                                            : campaign.status === "Paused"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-slate-100 text-slate-800"
                                    }
                                >
                                    {campaign.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Campaign Summary */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Campaign Summary
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                {campaign.targetCriteria}
                            </p>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Routing Rules:
                                </h4>
                                <ul className="space-y-1">
                                    {campaign.routingRules.map((rule, index) => (
                                        <li
                                            key={index}
                                            className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                                        >
                                            <span className="text-blue-600">•</span>
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {campaign.metrics.assigned}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Assigned</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {campaign.metrics.engaged}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Engaged ({campaign.metrics.engagedPercent}%)
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {campaign.metrics.pipeline}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pipeline ({campaign.metrics.pipelinePercent}%)
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {campaign.metrics.converted}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Converted ({campaign.metrics.convertedPercent}%)
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Partner Breakdown */}
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Partner Breakdown
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Partner</TableHead>
                                    <TableHead className="text-right">Assigned</TableHead>
                                    <TableHead className="text-right">Engaged</TableHead>
                                    <TableHead className="text-right">Pipeline</TableHead>
                                    <TableHead className="text-right">SS2</TableHead>
                                    <TableHead className="text-right">Conv. Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaign.partnerBreakdown.map((partner, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{partner.name}</TableCell>
                                        <TableCell className="text-right">{partner.assigned}</TableCell>
                                        <TableCell className="text-right">
                                            {partner.engaged} ({partner.engagedPercent}%)
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {partner.pipeline} ({partner.pipelinePercent}%)
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <span>{partner.ss2}</span>
                                                {partner.ss2 === 0 && (
                                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={partner.convRate === 0 ? "text-amber-600" : ""}>
                                                {partner.convRate.toFixed(1)}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Activity Timeline */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Activity Timeline
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {campaign.activityTimeline.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                {item.action}
                                            </p>
                                            <p className="text-xs text-slate-400">{item.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-4 text-sm text-blue-600 hover:underline">
                                View Full Activity Log →
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="outline" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Campaign
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add Partners
                    </Button>
                    <Button className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
