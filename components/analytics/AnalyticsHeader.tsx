"use client";

import { useState } from "react";
import { Calendar, Filter, Download, BarChart3, Users, Settings, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AnalyticsHeaderProps {
    onExport?: () => void;
}

export function AnalyticsHeader({ onExport }: AnalyticsHeaderProps) {
    const [dateRange, setDateRange] = useState("30days");
    const [workloadFilter, setWorkloadFilter] = useState("all");
    const [pdmFilter, setPdmFilter] = useState("all");

    return (
        <div className="space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                        Partner Intelligence Platform
                    </span>
                </div>
                <nav className="flex items-center gap-1">
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span>Campaigns</span>
                        </div>
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Partners</span>
                        </div>
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Analytics</span>
                        </div>
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </div>
                    </button>
                </nav>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    manager@google.com
                </div>
            </div>

            {/* Page Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Analytics Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Last updated: Today at 2:43 PM PST
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={(value) => value && setDateRange(value)}>
                        <SelectTrigger className="w-[160px]">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 90 Days</SelectItem>
                            <SelectItem value="ytd">Year to Date</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={workloadFilter} onValueChange={(value) => value && setWorkloadFilter(value)}>
                        <SelectTrigger className="w-[160px]">
                            <Filter className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Workloads</SelectItem>
                            <SelectItem value="gemini">Gemini</SelectItem>
                            <SelectItem value="gcp">GCP</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="workspace">Workspace</SelectItem>
                            <SelectItem value="looker">Looker</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={pdmFilter} onValueChange={(value) => value && setPdmFilter(value)}>
                        <SelectTrigger className="w-[160px]">
                            <Users className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All PDMs</SelectItem>
                            <SelectItem value="sarah">Sarah Chen</SelectItem>
                            <SelectItem value="james">James Park</SelectItem>
                            <SelectItem value="maria">Maria Lopez</SelectItem>
                            <SelectItem value="david">David Kim</SelectItem>
                            <SelectItem value="alex">Alex Rivera</SelectItem>
                            <SelectItem value="chris">Chris Taylor</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={onExport}
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
