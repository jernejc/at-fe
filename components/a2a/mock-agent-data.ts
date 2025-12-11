
import { Brain, CheckCircle2, Clock, Terminal } from 'lucide-react';

export interface AgentActivity {
    id: string;
    type: 'log' | 'thought' | 'action'; // removed 'error' to match usage
    content: string;
    timestamp: string;
}

export interface AgentDetail {
    id: string;
    name: string;
    role: string;
    type: string;
    status: 'idle' | 'thinking' | 'executing';
    currentTask?: string;
    thoughts: string[];
    recentActivity: AgentActivity[];
    capabilities: string[];
}

const ROLES = ['Orchestrator', 'Service Agent', 'Data Handler', 'Monitor'];
const TASKS = [
    "Analyzing user request pattern...",
    "Querying vector database for context...",
    "Generating plan for multi-step execution...",
    "Validating output against schema...",
    "Syncing state with central ledger...",
    "Waiting for sub-agent response..."
];

const THOUGHTS = [
    "User intent seems ambiguous, defaulting to standard retrieval.",
    "Confidence score is 0.85, proceeding without clarification.",
    "Detected potential conflict in resource allocation.",
    "Optimizing query for lower latency.",
    "Received signal from upstream agent, initiating callback."
];

export function generateMockAgentData(nodeLabel: string, type: string = 'default'): AgentDetail {
    const isOrchestrator = type === 'orchestrator' || nodeLabel.toLowerCase().includes('orch');

    // Deterministic-ish random based on string length
    const seed = nodeLabel.length;
    const role = isOrchestrator ? 'Orchestrator' : ROLES[seed % ROLES.length];
    const status = seed % 3 === 0 ? 'thinking' : seed % 3 === 1 ? 'executing' : 'idle';

    return {
        id: `agent-${nodeLabel}`,
        name: nodeLabel,
        role,
        type, // Pass the type (orchestrator, service, etc) so UI can color code
        status,
        currentTask: status !== 'idle' ? TASKS[seed % TASKS.length] : undefined,
        capabilities: ["Context Awareness", "Tool Use", "Memory Access", "Reasoning"],
        thoughts: [
            THOUGHTS[seed % THOUGHTS.length],
            THOUGHTS[(seed + 1) % THOUGHTS.length]
        ],
        recentActivity: [
            { id: '1', type: 'action', content: 'Initialized context window', timestamp: '2ms ago' },
            { id: '2', type: 'log', content: 'Connected to shared memory bus', timestamp: '15ms ago' },
            { id: '3', type: 'thought', content: 'Ready to process incoming signals', timestamp: '45ms ago' },
            { id: '4', type: 'action', content: 'Registered capability manifest', timestamp: '120ms ago' },
        ]
    };
}
