
'use client'; // Important for client-side interactivity

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, BackgroundVariant, Panel, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { parseMermaidToReactFlow } from '@/lib/a2a/parser';
import { AgentNode, AGENT_CONFIG } from './nodes/AgentNode';
import { SkillNode } from './nodes/SkillNode';
import { Loader2, Brain, Activity, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { generateMockAgentData, AgentDetail } from './mock-agent-data';

import { GroupNode } from './nodes/GroupNode';

const nodeTypes = {
    agentNode: AgentNode,
    skillNode: SkillNode,
    groupNode: GroupNode,
};

interface A2ADiagramProps {
    mermaid: string;
}

export function A2ADiagram({ mermaid }: A2ADiagramProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [agentDetail, setAgentDetail] = useState<AgentDetail | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [rfInstance, setRfInstance] = useState<any>(null);

    // Initial init
    const onInitWrapped = useCallback((instance: any) => {
        setRfInstance(instance);
        instance.fitView({ padding: 0.2, duration: 400 });
    }, []);

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
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    }, []);

    const resetSelection = useCallback(() => {
        setSelectedNodeId(null);
        setIsSheetOpen(false);
        setNodes((nds) => nds.map((n) => ({
            ...n,
            selected: false,
            data: { ...n.data, dimmed: false, opacity: 1 }
        })));
        setEdges((eds) => eds.map((e) => ({
            ...e,
            style: { ...e.style, opacity: 1, stroke: '#64748b', strokeWidth: 2 },
            animated: true
        })));
        if (rfInstance) {
            rfInstance.fitView({ padding: 0.2, duration: 800 });
        }
    }, [setNodes, setEdges, rfInstance]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
        event.stopPropagation(); // Prevent pane click

        // If clicking the same node, do nothing or maybe re-open sheet?
        // if (node.id === selectedNodeId) { setIsSheetOpen(true); return; }

        setSelectedNodeId(node.id);

        // Generate Details
        const details = generateMockAgentData(node.data.label, node.data.type);
        setAgentDetail(details);
        setIsSheetOpen(true);

        // Calculate Connections
        const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
        const connectedNodeIds = new Set(connectedEdges.flatMap(e => [e.source, e.target]));
        connectedNodeIds.add(node.id);

        setNodes((nds) => nds.map((n) => {
            const isSelected = n.id === node.id;
            const isConnected = connectedNodeIds.has(n.id) && !isSelected;

            // Opacity Logic
            let opacity = 0.4; // Default to dimmed
            if (isSelected) opacity = 1;
            else if (isConnected) opacity = 0.7; // Slightly lowered for connected nodes

            return {
                ...n,
                selected: isSelected,
                data: { ...n.data, opacity, dimmed: false } // We use explicit opacity now
            };
        }));

        setEdges((eds) => eds.map((e) => {
            const isConnected = e.source === node.id || e.target === node.id;
            return {
                ...e,
                style: {
                    ...e.style,
                    ...e.style,
                    opacity: isConnected ? 1 : 0.05,
                    stroke: isConnected ? '#3b82f6' : '#64748b', // Highlight connected edges blue
                    strokeWidth: isConnected ? 2 : 1
                },
                animated: isConnected
            };
        }));
    }, [edges, setNodes, setEdges]);


    useEffect(() => {
        if (selectedNodeId && rfInstance) {
            const node = nodes.find(n => n.id === selectedNodeId);
            if (node) {
                rfInstance.fitView({
                    nodes: [{ id: selectedNodeId }],
                    padding: 4.5, // Increased padding to zoom in less
                    duration: 800
                });
            }
        } else if (!selectedNodeId && rfInstance) {
            // Optional: Reset view on deselect? Maybe annoying. Let's keep current view.
        }
    }, [selectedNodeId, rfInstance]); // nodes dependency might cause loops if not careful, better to just rely on ID


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
                onInit={onInitWrapped}
                onNodeClick={onNodeClick}
                onPaneClick={resetSelection}
                minZoom={0.1}
                attributionPosition="bottom-right"
            >
                <Controls showInteractive={false} className="bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-lg p-1" />

                <Panel position="top-right" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F97316]"></div> Gateway</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#4285F4]"></div> Orchestrator</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#DB4437]"></div> Service</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0F9D58]"></div> Data</div>
                    </div>
                </Panel>
            </ReactFlow>

            <Sheet modal={false} open={isSheetOpen} onOpenChange={(open) => !open && resetSelection()}>
                <SheetContent
                    overlay={false}
                    side="left"
                    hideClose={true}
                    className="!z-10 !top-16 !h-[calc(100vh-4rem)] w-[400px] sm:w-[540px] !overflow-visible p-0 shadow-2xl border-r border-slate-200 bg-white/95 backdrop-blur-sm"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    {/* Custom Close Button outside the sheet content flow but visually attached or floating */}
                    <button
                        onClick={() => resetSelection()}
                        className="absolute top-4 -right-9 p-2 bg-white/90 backdrop-blur border border-slate-200 shadow-md rounded-full text-slate-500 hover:text-slate-800 hover:bg-white transition-all z-50 group border-l-0 rounded-l-none"
                        title="Close Sidebar"
                    >
                        <X size={20} />
                    </button>

                    {agentDetail && (
                        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                            <SheetHeader className="pb-6 border-b mb-6" style={{ borderTop: `4px solid ${AGENT_CONFIG[agentDetail.type as keyof typeof AGENT_CONFIG]?.color || '#cbd5e1'}` }}>
                                <div className="flex items-center gap-2 mb-2 pt-4">
                                    <span style={{
                                        color: AGENT_CONFIG[agentDetail.type as keyof typeof AGENT_CONFIG]?.color,
                                        backgroundColor: AGENT_CONFIG[agentDetail.type as keyof typeof AGENT_CONFIG]?.bg,
                                        borderColor: AGENT_CONFIG[agentDetail.type as keyof typeof AGENT_CONFIG]?.borderColor,
                                    }} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border">
                                        {agentDetail.type} AGENT
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                        ${agentDetail.status === 'thinking' ? 'bg-amber-100 text-amber-700' :
                                            agentDetail.status === 'executing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {agentDetail.status}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">{agentDetail.role}</span>
                                </div>
                                <SheetTitle className="text-2xl">{agentDetail.name}</SheetTitle>
                                <SheetDescription>
                                    Agent ID: <span className="font-mono text-xs">{agentDetail.id}</span>
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-8">
                                {/* Current Task / Thought */}
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <Brain size={16} className="text-violet-500" /> Current Process
                                    </h3>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-3">
                                        {agentDetail.currentTask && (
                                            <div className="flex items-start gap-3">
                                                <Loader2 size={16} className="text-blue-500 animate-spin mt-0.5 shrink-0" />
                                                <p className="text-sm text-slate-700">{agentDetail.currentTask}</p>
                                            </div>
                                        )}
                                        <div className="pl-7">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Chain of Thought</div>
                                            <div className="space-y-2">
                                                {agentDetail.thoughts.map((thought, i) => (
                                                    <div key={i} className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3 py-1">
                                                        "{thought}"
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Activity Log */}
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <Activity size={16} className="text-emerald-500" /> Recent Activity
                                    </h3>
                                    <div className="relative border-l border-slate-200 pl-4 space-y-6 ml-2">
                                        {agentDetail.recentActivity.map((activity, i) => (
                                            <div key={i} className="relative">
                                                <div className={`absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full border-2 border-white 
                                                    ${activity.type === 'action' ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-slate-400 font-mono">{activity.timestamp}</span>
                                                    <p className="text-sm text-slate-700 text-pretty">{activity.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
}
