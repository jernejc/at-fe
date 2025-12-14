import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';
import { generateMockAgentData } from '@/components/a2a/mock-agent-data';

export interface ParsedDiagram {
    nodes: Node[];
    edges: Edge[];
}

interface RawNode {
    id: string;
    label: string;
    type?: 'entry' | 'orchestrator' | 'service' | 'data' | 'skill';
    parentId?: string;
    skills?: string[];
}

interface RawEdge {
    source: string;
    target: string;
    type: 'flow' | 'skill';
    visualType?: 'normal' | 'thick'; // For ==>
    label?: string;
}

// --- Constants ---

const NODE_WIDTH = 300; // Wider to fit skills
const NODE_HEIGHT_BASE = 120; // Header + Label + Padding
const SKILL_ROW_HEIGHT = 40; // Est height per row of skills

// --- Parser ---

export function parseMermaidToReactFlow(mermaid: string): ParsedDiagram {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const rawNodes: Map<string, RawNode> = new Map();
    const rawEdges: RawEdge[] = [];

    // 1. Clean and normalize input
    const lines = mermaid.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('classDef') && !l.startsWith('class ') && !l.startsWith('flowchart') && !l.startsWith('%%'));

    // 2. State tracking
    let currentSubgraph: string | null = null;
    const subgraphs = new Map<string, string[]>(); // id -> nodeIds
    const subgraphLabels = new Map<string, string>();

    // 3. First pass: Identify nodes, subgraphs, and basic relationships
    for (const line of lines) {
        // Subgraph start
        if (line.startsWith('subgraph')) {
            const match = line.match(/subgraph\s+(\w+)\["(.+)"\]/);
            if (match) {
                currentSubgraph = match[1];
                subgraphLabels.set(currentSubgraph, match[2]);
                subgraphs.set(currentSubgraph, []);
            }
            continue;
        }

        // Subgraph end
        if (line === 'end') {
            currentSubgraph = null;
            continue;
        }

        // Relationships (--> or -.- or ==>)
        if (line.includes('-->') || line.includes('-.-') || line.includes('==>')) {
            const isSkill = line.includes('-.-');
            let operator = '-->';
            if (isSkill) operator = '-.-';
            else if (line.includes('==>')) operator = '==>';

            const parts = line.split(operator).map(p => p.trim());

            if (parts.length === 2) {
                const source = extractNodeId(parts[0]);
                const targetraw = parts[1];

                // Check if target is a node definition (e.g. id["label"])
                const targetMatch = targetraw.match(/^(\w+)\["(.+)"\]$/);
                let targetId = targetraw;
                let targetLabel = targetraw;

                if (targetMatch) {
                    targetId = targetMatch[1];
                    targetLabel = targetMatch[2];
                    if (!rawNodes.has(targetId)) {
                        const type = targetId.startsWith('skills_') ? 'skill' : undefined;
                        rawNodes.set(targetId, { id: targetId, label: targetLabel, type });
                        if (currentSubgraph && !type) { // Don't add skills to subgraphs for now
                            const group = subgraphs.get(currentSubgraph) || [];
                            group.push(targetId);
                            subgraphs.set(currentSubgraph, group);
                        }
                    }
                } else {
                    targetId = extractNodeId(targetraw);
                }

                // Ensure source exists if simply referenced
                if (!rawNodes.has(source)) {
                    rawNodes.set(source, { id: source, label: source }); // Placeholder
                }
                if (!rawNodes.has(targetId) && !targetMatch) {
                    rawNodes.set(targetId, { id: targetId, label: targetId }); // Placeholder
                }


                rawEdges.push({
                    source,
                    target: targetId,
                    type: isSkill ? 'skill' : 'flow',
                    visualType: operator === '==>' ? 'thick' : 'normal'
                });
            }
            continue;
        }

        // Node definitions (e.g. id["label"])
        const nodeMatch = line.match(/^(\w+)\["(.+)"\]$/);
        if (nodeMatch) {
            const id = nodeMatch[1];
            const label = nodeMatch[2];

            // Check if it's a skill node definition specifically
            if (id.startsWith('skills_')) {
                rawNodes.set(id, { id, label, type: 'skill' });
            } else {
                // Determine type based on subgraph if possible, or update existing
                const existing = rawNodes.get(id);
                rawNodes.set(id, { ...existing, id, label });

                if (currentSubgraph) {
                    const group = subgraphs.get(currentSubgraph) || [];
                    if (!group.includes(id)) {
                        group.push(id);
                        subgraphs.set(currentSubgraph, group);
                    }
                }
            }
        }
    }

    // 4. Post-process nodes to assign types based on naming conventions/known tiers if not set
    // In this specific A2A context, we can infer types from subgraph membership
    subgraphs.forEach((nodeIds, subgraphId) => {
        const typeMap: Record<string, 'entry' | 'orchestrator' | 'service' | 'data'> = {
            'entry_group': 'entry',
            'orchestrator_group': 'orchestrator',
            'service_group': 'service',
            'data_group': 'data',
            // Legacy/Fallback support
            'orchestrators': 'orchestrator',
            'services': 'service',
            'data': 'data'
        };
        const type = typeMap[subgraphId] || (subgraphId === 'data' ? 'data' : undefined);

        if (type) {
            nodeIds.forEach(nodeId => {
                const node = rawNodes.get(nodeId);
                if (node) {
                    node.type = type;
                    node.parentId = subgraphId;
                }

            });
        }
    });
    // 4.5. SMART INFERENCE (Self-Healing Layout)
    // Instead of hardcoding, we infer types/groups for floating nodes based on semantics.
    rawNodes.forEach(node => {
        // Only fix if floating (no parent) or untyped
        if (!node.parentId || !node.type) {
            const labelLower = node.label.toLowerCase();
            const idLower = node.id.toLowerCase();

            let inferredType: 'entry' | 'orchestrator' | 'service' | 'data' | undefined;
            let inferredParent: string | undefined;

            // Heuristic Rules
            if (labelLower.includes('analyzer') || labelLower.includes('generator') || labelLower.includes('summarizer') || labelLower.includes('service')) {
                inferredType = 'service';
                inferredParent = 'service_group';
            } else if (labelLower.includes('db') || labelLower.includes('store') || labelLower.includes('cache') || labelLower.includes('vector')) {
                inferredType = 'data';
                inferredParent = 'data_group';
            } else if (labelLower.includes('orchestrator') || labelLower.includes('planner') || labelLower.includes('brain')) {
                inferredType = 'orchestrator';
                inferredParent = 'orchestrator_group';
            }

            // Apply Inference
            if (inferredType && inferredParent) {
                // Update Node Props
                if (!node.type) node.type = inferredType;
                if (!node.parentId) node.parentId = inferredParent;

                // Update Physical Graph Grouping
                // Check if target group exists
                if (subgraphs.has(inferredParent)) {
                    const group = subgraphs.get(inferredParent) || [];
                    if (!group.includes(node.id)) {
                        group.push(node.id);
                        subgraphs.set(inferredParent, group);
                    }
                }
            }
        }
    });

    // 5. Layout with Dagre
    const g = new dagre.graphlib.Graph({ compound: false }); // No compound layout needed for pure DAG
    g.setGraph({
        rankdir: 'TB',   // Top-to-bottom flow
        ranksep: 90,     // Vertical spacing between ranks (rows)
        nodesep: 40,     // Horizontal spacing between nodes in same rank
        marginx: 30,
        marginy: 30
        // No align specified - uses default centering which looks balanced
    });
    g.setDefaultEdgeLabel(() => ({}));



    // Pre-calculate skills
    const agentSkills = new Map<string, string[]>();
    rawNodes.forEach(node => {
        if (node.type !== 'skill') {
            const skillEdges = rawEdges.filter(e => e.source === node.id && e.type === 'skill');
            const skills: string[] = [];
            skillEdges.forEach(edge => {
                const skillNode = rawNodes.get(edge.target);
                if (skillNode && skillNode.label) {
                    skills.push(...skillNode.label.split(',').map(s => s.trim()));
                }
            });
            agentSkills.set(node.id, skills);
        }
    });

    // Add nodes to dagre
    rawNodes.forEach(node => {
        if (node.type !== 'skill') {
            const height = 200;
            g.setNode(node.id, { label: node.label, width: NODE_WIDTH, height: height });
            // NO PARENT ID - Flattening the graph
        }
    });

    // NO GROUPS in Dagre - We want a pure node layout

    // Add edges to dagre - EXCLUDING SKILL EDGES
    rawEdges.forEach(edge => {
        if (edge.type !== 'skill') {
            // Standard edges only
            g.setEdge(edge.source, edge.target);
        }
    });



    dagre.layout(g);

    // 6. POST-PROCESS: Center-align all ranks for perfect visual alignment
    // Group nodes by their Y position (rank)
    const ranks = new Map<number, string[]>();
    g.nodes().forEach(nodeId => {
        const node = g.node(nodeId);
        if (node) {
            const y = Math.round(node.y); // Round to handle floating point
            if (!ranks.has(y)) ranks.set(y, []);
            ranks.get(y)!.push(nodeId);
        }
    });

    // Find global center X (using the widest rank as reference)
    let globalCenterX = 0;
    let maxRankWidth = 0;
    ranks.forEach((nodeIds) => {
        let minX = Infinity, maxX = -Infinity;
        nodeIds.forEach(nodeId => {
            const node = g.node(nodeId);
            if (node) {
                minX = Math.min(minX, node.x - NODE_WIDTH / 2);
                maxX = Math.max(maxX, node.x + NODE_WIDTH / 2);
            }
        });
        const rankWidth = maxX - minX;
        if (rankWidth > maxRankWidth) {
            maxRankWidth = rankWidth;
            globalCenterX = (minX + maxX) / 2;
        }
    });

    // Adjust each rank to be centered around globalCenterX
    ranks.forEach((nodeIds) => {
        if (nodeIds.length === 1) {
            // Single-node rank: position exactly at center for perfect alignment
            const node = g.node(nodeIds[0]);
            if (node) {
                node.x = globalCenterX;
            }
        } else {
            // Multi-node rank: shift the entire group to center
            let minX = Infinity, maxX = -Infinity;
            nodeIds.forEach(nodeId => {
                const node = g.node(nodeId);
                if (node) {
                    minX = Math.min(minX, node.x - NODE_WIDTH / 2);
                    maxX = Math.max(maxX, node.x + NODE_WIDTH / 2);
                }
            });
            const rankCenterX = (minX + maxX) / 2;
            const offsetX = globalCenterX - rankCenterX;

            // Apply offset to all nodes in this rank
            nodeIds.forEach(nodeId => {
                const node = g.node(nodeId);
                if (node) {
                    node.x += offsetX;
                }
            });
        }
    });

    // 7. Convert to React Flow format (FLAT STRUCTURE)

    // No Group Nodes Processing

    // Create Agent Nodes (children)
    rawNodes.forEach(node => {
        if (node.type !== 'skill') {
            const nodeWithPosition = g.node(node.id);
            // Safety check
            if (!nodeWithPosition) return;

            // In flat layout, Dagre gives absolute positions.
            // We shift by width/2 height/2 because Dagre uses center coords, RF uses top-left?
            // Actually Dagre uses top-left usually if configured, but let's stick to standard conversion.
            // Wait, Dagre default is center. React Flow is Top-Left.
            // Let's assume standard center-to-topleft conversion.

            const skills = agentSkills.get(node.id) || [];

            // Hydrate with Mock Data for Rich UI
            const mockData = generateMockAgentData(node.label, node.type);
            const enrichedSkills = [...new Set([...skills, ...mockData.capabilities])];

            const hasSource = rawEdges.some(e => e.source === node.id && e.type !== 'skill');
            const hasTarget = rawEdges.some(e => e.target === node.id && e.type !== 'skill');

            nodes.push({
                id: node.id,
                type: 'agentNode',
                draggable: false,
                position: {
                    x: nodeWithPosition.x - NODE_WIDTH / 2,
                    y: nodeWithPosition.y - (nodeWithPosition.height / 2)
                },
                data: {
                    label: node.label,
                    type: node.type || 'default',
                    skills: enrichedSkills,
                    status: mockData.status,
                    role: mockData.role,
                    currentTask: mockData.currentTask,
                    hasSource,
                    hasTarget
                },
                style: { width: NODE_WIDTH, height: 200 }
            });
        }
    });

    // Create Edges
    rawEdges.forEach((edge, i) => {
        const isSkill = edge.type === 'skill';
        if (isSkill) return; // Don't create edges for merged skills

        const isThick = edge.visualType === 'thick';

        edges.push({
            id: `e-${i}`,
            source: edge.source,
            target: edge.target,
            type: 'smoothstep',
            animated: isThick ? true : false, // Only animate heavy flows? Or all? Let's animate thick ones to emphasize flow.
            style: {
                stroke: isThick ? '#94a3b8' : '#94a3b8', // Normalize color to Slate 400
                strokeWidth: 2, // Normalize width
                strokeDasharray: '5,5', // Make all edges dashed
            },
            markerEnd: {
                type: 'arrowclosed',
                color: isThick ? '#94a3b8' : '#94a3b8', // Normalize marker color
                width: 20,
                height: 20
            },
        });
    });

    return { nodes, edges };
}

function extractNodeId(text: string): string {
    // text might be 'node_id' or 'node_id["label"]'
    const match = text.match(/^(\w+)/);
    return match ? match[1] : text;
}
