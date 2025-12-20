export interface AgentCard {
    name: string;
    description: string;
    // Add other fields based on API response if known, otherwise generic
    type: string;
    invocations_count?: number;
    // ...
}

export interface Invocation {
    id: string;
    agent_name: string;
    timestamp: string;
    input: any;
    output: any;
    status: 'success' | 'failure' | 'running';
    duration_ms?: number;
}
