
import { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';

// --- Types ---

export interface ParsedDiagram {
    nodes: Node[];
    edges: Edge[];
}

interface RawNode {
    id: string;
    label: string;
    type?: 'orchestrator' | 'service' | 'data' | 'skill';
    parentId?: string;
    skills?: string[];
}

interface RawEdge {
    source: string;
    target: string;
    type: 'flow' | 'skill';
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

        // Relationships (--> or -.-)
        if (line.includes('-->') || line.includes('-.-')) {
            const isSkill = line.includes('-.-');
            const operator = isSkill ? '-.-' : '-->';
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
                    type: isSkill ? 'skill' : 'flow'
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
        const typeMap: Record<string, 'orchestrator' | 'service' | 'data'> = {
            'orchestrators': 'orchestrator',
            'services': 'service',
            'data': 'data' // 'Data Layer' -> data
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

    // 5. Layout with Dagre
    const g = new dagre.graphlib.Graph({ compound: true });
    g.setGraph({ rankdir: 'TB', align: 'DL', ranksep: 80, nodesep: 50 }); // Tighter, more professional spacing
    g.setDefaultEdgeLabel(() => ({}));

    // Pre-calculate skills (needed for AgentNode data, even if not for sizing)
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
            // User requested FIXED HEIGHT - Adjusted to 200px
            const height = 200;

            g.setNode(node.id, { label: node.label, width: NODE_WIDTH, height: height });

            if (node.parentId) {
                g.setParent(node.id, node.parentId);
            }
        }
    });

    // Add Groups (Subgraphs) to dagre
    subgraphs.forEach((_, id) => {
        g.setNode(id, { label: subgraphLabels.get(id), clusterLabelPos: 'top', style: 'fill: #fdfdfd' });
    });

    // Add edges to dagre - EXCLUDING SKILL EDGES
    rawEdges.forEach(edge => {
        if (edge.type !== 'skill') {
            g.setEdge(edge.source, edge.target);
        }
    });

    dagre.layout(g);

    // 6. Convert to React Flow format

    // Create Agent Nodes (with merged skills)
    rawNodes.forEach(node => {
        if (node.type !== 'skill') {
            const nodeWithPos = g.node(node.id);
            if (!nodeWithPos) return;

            const skills = agentSkills.get(node.id) || [];

            const hasSource = rawEdges.some(e => e.source === node.id && e.type !== 'skill');
            const hasTarget = rawEdges.some(e => e.target === node.id && e.type !== 'skill');

            nodes.push({
                id: node.id,
                type: 'agentNode',
                draggable: false,
                data: {
                    label: node.label,
                    type: node.type || 'default',
                    skills: skills,
                    hasSource,
                    hasTarget
                },
                position: { x: nodeWithPos.x - NODE_WIDTH / 2, y: nodeWithPos.y - nodeWithPos.height / 2 },
                // Force consistent Width AND Height in style
                style: { width: NODE_WIDTH, height: 200 }
            });
        }
    });

    // Create Edges
    rawEdges.forEach((edge, i) => {
        const isSkill = edge.type === 'skill';
        if (isSkill) return; // Don't create edges for merged skills

        edges.push({
            id: `e-${i}`,
            source: edge.source,
            target: edge.target,
            type: 'smoothstep',
            animated: true,
            style: {
                stroke: '#64748b',
                strokeWidth: 2,
            },
            markerEnd: { type: 'arrowclosed', color: '#64748b' },
        });
    });

    return { nodes, edges };
}

function extractNodeId(text: string): string {
    // text might be 'node_id' or 'node_id["label"]'
    const match = text.match(/^(\w+)/);
    return match ? match[1] : text;
}
