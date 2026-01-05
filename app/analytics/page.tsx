"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LayoutGrid, Target, Users, BarChart2, UserCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    AnalyticsHeader,
    KPICard,
    CampaignTable,
    PartnerTable,
    WorkloadChart,
    PDMTable,
    CampaignModal,
    PartnerModal,
} from "@/components/analytics";
import {
    kpiData,
    campaignData,
    partnerData,
    workloadData,
    workloadInsights,
    pdmData,
    getCampaignDetail,
    getPartnerDetail,
} from "@/lib/data/analytics.mock";
import type {
    CampaignPerformance,
    PartnerPerformance,
    CampaignDetail,
    PartnerDetail,
} from "@/lib/schemas/analytics.types";

export default function AnalyticsDashboard() {
    const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<PartnerDetail | null>(null);
    const [campaignModalOpen, setCampaignModalOpen] = useState(false);
    const [partnerModalOpen, setPartnerModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>("overview");

    const handleCampaignClick = (campaign: CampaignPerformance) => {
        const detail = getCampaignDetail(campaign.id);
        if (detail) {
            setSelectedCampaign(detail);
            setCampaignModalOpen(true);
        }
    };

    const handlePartnerClick = (partner: PartnerPerformance) => {
        const detail = getPartnerDetail(partner.id);
        if (detail) {
            setSelectedPartner(detail);
            setPartnerModalOpen(true);
        }
    };

    const handleExport = () => {
        toast.success("Report exported successfully", {
            description: "Your analytics report has been downloaded.",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Header */}
                <AnalyticsHeader onExport={handleExport} />

                {/* Tabs Navigation */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-8"
                >
                    <TabsList variant="line" className="mb-6 border-b border-slate-200 dark:border-slate-800 w-full justify-start gap-1 pb-0">
                        <TabsTrigger value="overview" className="gap-2 px-4 py-2.5">
                            <LayoutGrid className="w-4 h-4" />
                            Program Overview
                        </TabsTrigger>
                        <TabsTrigger value="campaigns" className="gap-2 px-4 py-2.5">
                            <Target className="w-4 h-4" />
                            Campaign Performance
                        </TabsTrigger>
                        <TabsTrigger value="partners" className="gap-2 px-4 py-2.5">
                            <Users className="w-4 h-4" />
                            Partner Leaderboard
                        </TabsTrigger>
                        <TabsTrigger value="workload" className="gap-2 px-4 py-2.5">
                            <BarChart2 className="w-4 h-4" />
                            Pipeline by Workload
                        </TabsTrigger>
                        <TabsTrigger value="pdm" className="gap-2 px-4 py-2.5">
                            <UserCheck className="w-4 h-4" />
                            PDM Activity
                        </TabsTrigger>
                    </TabsList>

                    {/* Program Overview Tab */}
                    <TabsContent value="overview">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Program Overview
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {kpiData.map((kpi, index) => (
                                        <KPICard key={index} data={kpi} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Campaign Performance Tab */}
                    <TabsContent value="campaigns">
                        <CampaignTable data={campaignData} onCampaignClick={handleCampaignClick} />
                    </TabsContent>

                    {/* Partner Leaderboard Tab */}
                    <TabsContent value="partners">
                        <PartnerTable data={partnerData} onPartnerClick={handlePartnerClick} />
                    </TabsContent>

                    {/* Pipeline by Workload Tab */}
                    <TabsContent value="workload">
                        <WorkloadChart data={workloadData} insights={workloadInsights} />
                    </TabsContent>

                    {/* PDM Activity Tab */}
                    <TabsContent value="pdm">
                        <PDMTable data={pdmData} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <CampaignModal
                campaign={selectedCampaign}
                open={campaignModalOpen}
                onClose={() => setCampaignModalOpen(false)}
            />
            <PartnerModal
                partner={selectedPartner}
                open={partnerModalOpen}
                onClose={() => setPartnerModalOpen(false)}
            />
        </div>
    );
}
