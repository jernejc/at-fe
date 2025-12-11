
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Lightbulb } from 'lucide-react';

export const SkillNode = memo(({ data }: NodeProps) => {
    const skills = String(data.label).split(',').map(s => s.trim());

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm min-w-[200px] max-w-[300px]">
            <div className="bg-amber-100/50 px-3 py-2 border-b border-amber-200 flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Capabilities</span>
            </div>
            <div className="p-2">
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-amber-100 rounded text-[10px] font-medium text-amber-800 shadow-sm">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
            <Handle type="target" position={Position.Bottom} className="!bg-amber-400 !w-2 !h-2 !rounded-sm" />
        </div>
    );
});
