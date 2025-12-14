import { memo } from 'react';
import { NodeProps, Node } from '@xyflow/react';

interface GroupNodeData extends Record<string, unknown> {
    label: string;
}

export const GroupNode = memo(({ data }: NodeProps<Node<GroupNodeData>>) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.4) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
            borderRadius: '24px',
            overflow: 'hidden'
        }}>
            {/* Header/Label Area */}
            <div className="h-[40px] border-b border-white/50 bg-slate-50/30 flex items-center px-6">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pointer-events-none select-none">
                    {data.label}
                </div>
            </div>
        </div>
    );
});
