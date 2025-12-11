
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, Database, Server, Cpu, BrainCircuit, Share2, Search, FileText } from 'lucide-react';

const CONFIG = {
    orchestrator: {
        color: '#4285F4', // Google Blue
        bg: '#eff6ff', // Blue 50
        borderColor: '#bbdefb',
        icon: BrainCircuit
    },
    service: {
        color: '#DB4437', // Google Red
        bg: '#fef2f2', // Red 50
        borderColor: '#ffcdd2',
        icon: Cpu
    },
    data: {
        color: '#0F9D58', // Google Green
        bg: '#f0fdf4', // Green 50
        borderColor: '#c8e6c9',
        icon: Database
    },
    default: {
        color: '#F4B400', // Google Yellow
        bg: '#fffbeb', // Amber 50
        borderColor: '#ffecb3',
        icon: Server
    }
};

export const AgentNode = memo(({ data, selected }: NodeProps) => {
    const type = (data.type as keyof typeof CONFIG) || 'default';
    const style = CONFIG[type] || CONFIG.default;
    const Icon = style.icon;

    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            border: `1px solid ${selected ? style.color : style.borderColor}`,
            boxShadow: selected ? `0 0 0 2px ${style.bg}, 0 4px 6px -1px rgb(0 0 0 / 0.1)` : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            minWidth: '240px',
            height: '100%', // Fill the fixed height set by parent
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column'
        }} className="group hover:shadow-lg">

            {/* Header with Color Accent */}
            <div style={{ backgroundColor: style.bg, borderBottom: `1px solid ${style.borderColor}` }} className="p-3 flex items-center gap-3">
                <div style={{ backgroundColor: 'white', color: style.color }} className="p-2 rounded-lg shadow-sm">
                    <Icon size={20} />
                </div>
                <div className="font-semibold text-slate-700 text-sm">
                    {String(data.label).toUpperCase()}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-3 bg-white flex-1 overflow-y-auto custom-scrollbar">
                <div className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>{type.toUpperCase()} AGENT</span>
                </div>

                {data.skills && Array.isArray(data.skills) && data.skills.length > 0 && (
                    <div className="mt-3">
                        <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Capabilities</div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-medium text-slate-600">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Connection Handles */}
            {/* Connection Handles */}
            <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3" />
            <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-3 !h-3" />
        </div>
    );
});
