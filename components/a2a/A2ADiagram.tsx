
'use client'; // Important for client-side interactivity

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, BackgroundVariant, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { parseMermaidToReactFlow } from '@/lib/a2a/parser';
import { AgentNode } from './nodes/AgentNode';
import { SkillNode } from './nodes/SkillNode';
import { Loader2 } from 'lucide-react';

const nodeTypes = {
    agentNode: AgentNode,
    skillNode: SkillNode,
};

interface A2ADiagramProps {
    mermaid: string;
}

export function A2ADiagram({ mermaid }: A2ADiagramProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mermaid) {
            try {
                const { nodes: parsedNodes, edges: parsedEdges } = parseMermaidToReactFlow(mermaid);
                setNodes(parsedNodes);
                setEdges(parsedEdges);
            } catch (e) {
                console.error("Failed to parse diagram:", e);
            } finally {
                setLoading(false);
            }
        }
    }, [mermaid, setNodes, setEdges]);

    const onInit = useCallback((reactFlowInstance: any) => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="animate-spin" /> Preparing Visualization...
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[600px] bg-slate-50 dark:bg-slate-900">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                onInit={onInit}
                minZoom={0.1}
                attributionPosition="bottom-right"
            >
                <Background color="#94a3b8" variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls showInteractive={false} className="bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-lg p-1" />

                <Panel position="top-right" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#4285F4]"></div> Orchestrator</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#DB4437]"></div> Service</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0F9D58]"></div> Data</div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
