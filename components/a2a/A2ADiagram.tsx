
'use client'; // Important for client-side interactivity

import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Controls, useNodesState, useEdgesState, Panel, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { parseMermaidToReactFlow } from '@/lib/a2a/parser';
import { AgentNode } from './nodes/AgentNode';
import { SkillNode } from './nodes/SkillNode';
import { Loader2 } from 'lucide-react';
import { AgentDetailSheet } from './AgentDetailSheet';
import { getAgentCard, getAgentInvocations, getAgents } from '@/lib/api';
import { AgentCard, Invocation } from '@/lib/schemas';

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
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [agentCard, setAgentCard] = useState<AgentCard | null>(null);
    const [invocations, setInvocations] = useState<Invocation[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [rfInstance, setRfInstance] = useState<any>(null);
    const [agentMap, setAgentMap] = useState<Record<string, string>>({}); // Label -> ID mapping

    useEffect(() => {
        // Fetch all agents to build a mapping from Name -> Card Name
        getAgents().then(agents => {
            const map: Record<string, string> = {};
            agents.forEach(a => {
                // Map the 'name' (e.g. playbook-generator) to 'card_name' (e.g. agentic-playbook-generator)
                if (a.name && a.card_name) {
                    map[a.name.toLowerCase()] = a.card_name;
                }
            });
            setAgentMap(map);
        }).catch(err => console.error("Failed to fetch agent list", err));
    }, []);

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
        setSelectedNodeId(null);
        setIsSheetOpen(false);
        setAgentCard(null);
        setInvocations([]);
        setDetailsError(null);
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

        if (node.type === 'agentNode') {
            setLoadingDetails(true);
            setDetailsError(null);
            setIsSheetOpen(true);

            // 1. Try simple kebab-case first to derive the 'name'
            const simpleName = node.data.label.toLowerCase().replace(/\s+/g, '-');

            // 2. Lookup the 'card_name' from our map, fallback to simpleName if not found
            const apiAgentId = agentMap[simpleName] || simpleName;

            Promise.all([
                getAgentCard(apiAgentId)
                    .catch(e => {
                        console.error("Failed to fetch agent card", e);
                        return null;
                    }),
                getAgentInvocations(apiAgentId)
                    .catch(e => {
                        console.error("Failed to fetch invocations", e);
                        return [];
                    })
            ]).then(([card, invs]) => {
                setAgentCard(card);
                setInvocations(invs || []);
            }).catch(e => {
                setDetailsError("Failed to load agent details");
            }).finally(() => {
                setLoadingDetails(false);
            });
        }


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

            <AgentDetailSheet
                isOpen={isSheetOpen}
                onClose={resetSelection}
                agentName={selectedNodeId ? (nodes.find(n => n.id === selectedNodeId)?.data.label as string) : null}
                agentCard={agentCard}
                invocations={invocations}
                isLoading={loadingDetails}
                error={detailsError}
            />
        </div >
    );
}
