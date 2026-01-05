"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    Mail,
    Phone,
    MapPin,
    Award,
    Building,
    UserPlus,
    MessageSquare,
    CalendarCheck,
    FileText,
    Activity,
    TrendingUp,
    Plus,
    Send,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PartnerDetail } from "@/lib/schemas/analytics.types";

interface PartnerModalProps {
    partner: PartnerDetail | null;
    open: boolean;
    onClose: () => void;
}

const healthIndicators: Record<string, { emoji: string; label: string }> = {
    green: { emoji: "🟢", label: "Healthy" },
    yellow: { emoji: "🟡", label: "At Risk" },
    red: { emoji: "🔴", label: "Needs Attention" },
};

function Sparkline({ data }: { data: number[] }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 50;
    const width = 200;
    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg width={width} height={height} className="overflow-visible">
            <defs>
                <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4285F4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                fill="url(#sparklineGradient)"
                points={`0,${height} ${points} ${width},${height}`}
            />
            <polyline
                fill="none"
                stroke="#4285F4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
}

export function PartnerModal({ partner, open, onClose }: PartnerModalProps) {
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [localNotes, setLocalNotes] = useState<{ date: string; content: string }[]>([]);

    // Reset state when modal opens with new partner
    const allNotes = partner ? [...localNotes, ...partner.notes] : [];

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        const today = new Date();
        const formattedDate = today.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        setLocalNotes([{ date: formattedDate, content: newNote.trim() }, ...localNotes]);
        setNewNote("");
        setIsAddingNote(false);
        toast.success("Note added successfully");
    };

    if (!partner) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                    {partner.name}
                                </DialogTitle>
                                <span className="text-lg">{healthIndicators[partner.health].emoji}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                                    {partner.tier}
                                </Badge>
                                <span>{partner.type}</span>
                                <span>Partner since {partner.partnerSince}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Partner Overview */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                                    Contact Information
                                </h3>
                                <div className="space-y-3">
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {partner.contact.name}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {partner.contact.title}
                                    </p>
                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Mail className="w-4 h-4" />
                                            <span>{partner.contact.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Phone className="w-4 h-4" />
                                            <span>{partner.contact.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{partner.contact.territory}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Certifications & Verticals */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="w-4 h-4 text-blue-600" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Certifications
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {partner.certifications.map((cert, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    ✓ {cert}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building className="w-4 h-4 text-blue-600" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Preferred Verticals
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {partner.preferredVerticals.map((vertical, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs bg-slate-100 text-slate-700"
                                                >
                                                    {vertical}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {partner.metrics.assigned}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Assigned</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {partner.metrics.engaged}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Engaged ({partner.metrics.engagedPercent}%)
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {partner.metrics.pipeline}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pipeline ({partner.metrics.pipelinePercent}%)
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-green-600">{partner.metrics.ss2}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    SS2 ({partner.metrics.ss2Percent}%)
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ${(partner.metrics.avgDealSize / 1000).toFixed(0)}K
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Avg Deal Size</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Campaign Participation */}
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Campaign Participation
                            </h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign</TableHead>
                                    <TableHead className="text-right">Assigned</TableHead>
                                    <TableHead className="text-right">Pipeline</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partner.campaignParticipation.map((campaign, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{campaign.name}</TableCell>
                                        <TableCell className="text-right">{campaign.assigned}</TableCell>
                                        <TableCell className="text-right">{campaign.pipeline}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    campaign.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-slate-100 text-slate-600"
                                                }
                                            >
                                                {campaign.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Performance Trend */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Performance Trend (30 Days)
                                </h3>
                            </div>
                            <div className="flex items-center justify-center py-4">
                                <Sparkline data={partner.performanceTrend} />
                            </div>
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                Opportunities in Pipeline
                            </p>
                        </CardContent>
                    </Card>

                    {/* Notes & Activity */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* PDM Notes with Add Feature */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-semibold text-slate-900 dark:text-white">PDM Notes</h3>
                                    </div>
                                    {!isAddingNote && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5 h-7 text-xs"
                                            onClick={() => setIsAddingNote(true)}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Note
                                        </Button>
                                    )}
                                </div>

                                {/* Add Note Form */}
                                {isAddingNote && (
                                    <div className="mb-4 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                        <Textarea
                                            placeholder="Write your note here..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            className="mb-2 min-h-[80px] bg-white dark:bg-slate-800 resize-none"
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setIsAddingNote(false);
                                                    setNewNote("");
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="gap-1.5"
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim()}
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                Save Note
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Notes List */}
                                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                    {allNotes.length === 0 ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                            No notes yet. Click &quot;Add Note&quot; to create one.
                                        </p>
                                    ) : (
                                        allNotes.map((note, index) => (
                                            <div
                                                key={index}
                                                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                                            >
                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                    {note.content}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">{note.date}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Recent Activity
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {partner.recentActivity.map((item, index) => (
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
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="outline" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Assign More Opportunities
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Send Message
                    </Button>
                    <Button className="gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        Schedule Review
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
