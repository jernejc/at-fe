'use client';

import { cn } from '@/lib/utils';
import { PendingDataWrapper } from '../performance/DataPendingOverlay';
import { ArrowUpRight, TrendingUp, DollarSign, Users, Target } from 'lucide-react';

// --- VISUAL UTILS ---

// Smooth Line (Bezier)
function getSmoothPath(points: [number, number][]) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;

    let d = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
}

function AreaSparkline({ data, color = "#3b82f6" }: { data: number[], color?: string }) {
    const width = 100;
    const height = 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Map data to coordinate points
    const points: [number, number][] = data.map((d, i) => [
        (i / (data.length - 1)) * width,
        height - ((d - min) / range) * height * 0.8 - (height * 0.1) // Add padding
    ]);

    const lineCurved = getSmoothPath(points);
    const areaPath = `${lineCurved} L ${width},${height} L 0,${height} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {/* Soft grid line */}
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" strokeDasharray="4 4" />
            
            <path d={areaPath} fill={`url(#gradient-${color})`} />
            <path d={lineCurved} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* End dot */}
            <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={color} stroke="white" strokeWidth="1.5" />
        </svg>
    );
}

function DonutChart({ value, color = "#a855f7" }: { value: number, color?: string }) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r={radius} fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="3" />
                <circle 
                    cx="18" 
                    cy="18" 
                    r={radius} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="3" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round" 
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700 dark:text-slate-300">
                {value}%
            </div>
        </div>
    );
}

function BarChartSimple({ data, color = "#f59e0b" }: { data: number[], color?: string }) {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-1 h-8 w-20">
            {data.map((d, i) => (
                <div 
                    key={i} 
                    className="flex-1 rounded-[1px]"
                    style={{ 
                        height: `${(d / max) * 100}%`,
                        backgroundColor: color,
                        opacity: i === data.length - 1 ? 1 : 0.4
                    }} 
                />
            ))}
        </div>
    );
}


function KPICompact({ 
    label, 
    value, 
    trend, 
    trendUp, 
    visual 
}: { 
    label: string, 
    value: string, 
    trend?: string, 
    trendUp?: boolean,
    visual: React.ReactNode 
}) {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg py-4 px-5 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col h-full justify-center">
                <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">{label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight mb-2">{value}</div>
                
                {trend ? (
                    <div className={cn(
                        "text-[10px] font-medium inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full w-fit",
                        trendUp 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {trend}
                    </div>
                ) : <div className="h-4" />}
            </div>
            <div className="flex items-center justify-end w-24">
                {visual}
            </div>
        </div>
    );
}

export function PerformancePreviewCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Campaign Performance</h3>
                </div>
            </div>
            
            <div className="p-0 relative">
                <PendingDataWrapper 
                    isPending={true} 
                    message="Waiting for partner data"
                    description="Performance metrics will appear here soon"
                    className="w-full"
                >
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-90 grayscale-[0.05]">
                        <KPICompact 
                            label="Avg. Pipeline Value"
                            value="$42.5K"
                            trend="12% vs last mo"
                            trendUp={true}
                            visual={<AreaSparkline data={[20, 25, 45, 30, 40, 35, 55, 60, 45, 75]} color="#3b82f6" />}
                        />
                        <KPICompact 
                            label="Partner Conversion"
                            value="18.2%"
                            trend="3.1% vs last mo"
                            trendUp={true}
                            visual={<DonutChart value={68} color="#8b5cf6" />}
                        />
                        <KPICompact 
                            label="Active Deals"
                            value="142"
                            trend="5% vs last mo"
                            trendUp={false}
                            visual={<BarChartSimple data={[30, 45, 40, 60, 50, 70, 65, 55]} color="#f59e0b" />}
                        />
                    </div>
                </PendingDataWrapper>
            </div>
        </div>
    );
}
