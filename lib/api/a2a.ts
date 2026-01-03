import { fetchAPI } from './core';
import type { AgentCard, Invocation } from '../schemas';

export async function getA2ADiagram(): Promise<string> {
    const response = await fetch('https://at-data.cogitech.dev/a2a/diagram');
    if (!response.ok) {
        throw new Error(`Failed to fetch diagram: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    // Remove markdown code fences if present, handling potential whitespace
    return text.replaceAll('```mermaid', '').replaceAll('```', '').trim();
}

export async function getAgents(): Promise<AgentCard[]> {
    return fetchAPI<AgentCard[]>('/admin/v1/a2a/agents');
}

export async function getAgentCard(agentName: string): Promise<AgentCard> {
    return fetchAPI<AgentCard>(`/admin/v1/a2a/agents/${encodeURIComponent(agentName)}`);
}

export async function getAgentInvocations(agentName: string): Promise<Invocation[]> {
    return fetchAPI<Invocation[]>(`/admin/v1/a2a/tracking/agents/${encodeURIComponent(agentName)}/invocations`);
}

export async function getA2AHealth(): Promise<any> {
    return fetchAPI('/processing/a2a/status');
}
