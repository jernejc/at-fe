import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Handle, Position, NodeProps, type Node } from '@xyflow/react';
import { Bot, Database, Server, Cpu, BrainCircuit, Share2, Search, FileText } from 'lucide-react';

export const AGENT_CONFIG = {
    entry: {
        color: '#f97316', // Orange
        bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        borderColor: '#fdba74',
        icon: Share2,
        shadow: '0 10px 15px -3px rgba(249, 115, 22, 0.1)',
        accent: 'bg-orange-500'
    },
    orchestrator: {
        color: '#3b82f6', // Blue
        bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderColor: '#bfdbfe',
        icon: BrainCircuit,
        shadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1)',
        accent: 'bg-blue-500'
    },
    service: {
        color: '#ec4899', // Pink (changed from Red for less "error" feel)
        bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        borderColor: '#fbcfe8',
        icon: Cpu,
        shadow: '0 10px 15px -3px rgba(236, 72, 153, 0.1)',
        accent: 'bg-pink-500'
    },
    data: {
        color: '#10b981', // Emerald
        bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderColor: '#a7f3d0',
        icon: Database,
        shadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)',
        accent: 'bg-emerald-500'
    },
    default: {
        color: '#64748b', // Slate
        bg: '#f8fafc',
        borderColor: '#e2e8f0',
        icon: Server,
        shadow: 'none',
        accent: 'bg-slate-500'
    }
};


interface AgentNodeData extends Record<string, unknown> {
    label: string;
    type?: string;
    dimmed?: boolean;
    skills?: string[];
    hasSource?: boolean;
    hasTarget?: boolean;
    opacity?: number;
}

type AgentNodeType = Node<AgentNodeData>;

export const AgentNode = memo(({ data, selected }: NodeProps<AgentNodeType>) => {
    const type = (data.type as keyof typeof AGENT_CONFIG) || 'default';
    const style = AGENT_CONFIG[type] || AGENT_CONFIG.default;
    const Icon = style.icon;

    return (
        <div style={{
            background: style.bg,
            borderRadius: '16px',
            border: `1px solid ${style.borderColor}`,
            boxShadow: style.shadow,
            minWidth: '240px',
            height: '100%', // Fill the fixed height set by parent
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: data.opacity ?? (data.dimmed ? 0.3 : 1),
            display: 'flex',
            flexDirection: 'column',
            transform: selected ? 'scale(1.02)' : 'scale(1)',
        }} className="group relative">

            {/* Top Accent Line */}
            <div className={`h-1 w-full ${style.accent}`} />

            {/* Header */}
            <div className="p-4 pb-2 flex items-center gap-3">
                <div style={{ backgroundColor: 'white', color: style.color }} className="p-2.5 rounded-xl shadow-sm border border-white/50 relative">
                    <Icon size={22} strokeWidth={2.5} />
                    {/* Status Dot */}
                    {data.status === 'Thinking' && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white"></span>
                        </span>
                    )}
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5" style={{ color: style.color }}>
                        {type.toUpperCase()}
                    </div>
                    <div className="font-bold text-slate-800 text-sm leading-tight">
                        {String(data.label)}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-3 bg-white flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">

                {/* Capabilities */}
                {data.skills && Array.isArray(data.skills) && data.skills.length > 0 && (
                    <div>
                        <div className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Capabilities</div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.skills.slice(0, 4).map((skill: unknown, i: number) => ( // Limit to 4 pills
                                <Badge key={i} variant="secondary" className="px-2 py-0.5 rounded-md text-[9px] font-semibold text-slate-500 whitespace-nowrap bg-slate-50 border border-slate-100 hover:bg-slate-100 h-auto">
                                    {String(skill)}
                                </Badge>
                            ))}
                            {data.skills.length > 4 && (
                                <Badge variant="outline" className="px-2 py-0.5 rounded-md text-[9px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 h-auto">
                                    +{data.skills.length - 4}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Connection Handles - Top/Bottom for TB layout */}
            {data.hasTarget && <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-300 !opacity-0 group-hover:!opacity-100 transition-opacity duration-300" />}
            {data.hasSource && <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-300 !opacity-0 group-hover:!opacity-100 transition-opacity duration-300" />}
        </div>
    );
});
