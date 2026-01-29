'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { integrations } from '@/components/partner/integrations/integrations-data';

interface CRMConnectionContextValue {
    connectedIds: Set<string>;
    connect: (id: string) => void;
    disconnect: (id: string) => void;
    isConnectedById: (id: string) => boolean;
}

const CRMConnectionContext = createContext<CRMConnectionContextValue | null>(null);

// Get all CRM integration IDs
const crmIntegrationIds = integrations
    .filter(i => i.category === 'crm')
    .map(i => i.id);

export function CRMConnectionProvider({ children }: { children: ReactNode }) {
    const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

    const connect = useCallback((id: string) => {
        setConnectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    }, []);

    const disconnect = useCallback((id: string) => {
        setConnectedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);

    const isConnectedById = useCallback((id: string) => {
        return connectedIds.has(id);
    }, [connectedIds]);

    return (
        <CRMConnectionContext.Provider value={{ connectedIds, connect, disconnect, isConnectedById }}>
            {children}
        </CRMConnectionContext.Provider>
    );
}

export function useCRMConnectionContext() {
    const context = useContext(CRMConnectionContext);
    if (!context) {
        throw new Error('useCRMConnectionContext must be used within a CRMConnectionProvider');
    }
    return context;
}

export function useCRMConnection() {
    // For demo purposes, always return disconnected state
    // This can be wired to actual integration state later
    const isConnected = false;
    const connectedCRM: string | null = null;
    const connectedCRMs: string[] = [];

    return {
        isConnected,
        connectedCRM,
        connectedCRMs,
    };
}
