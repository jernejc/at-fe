'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { IntegrationCard } from '@/components/partner/integrations/IntegrationCard';
import { IntegrationConnectDialog } from '@/components/partner/integrations/IntegrationConnectDialog';
import {
  integrations,
  getIntegrationsByCategory,
  CATEGORY_LABELS,
  type Integration,
} from '@/components/partner/integrations/integrations-data';

export default function IntegrationsPage() {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const integrationsByCategory = getIntegrationsByCategory();
  const categories = Array.from(integrationsByCategory.keys());

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setDialogOpen(true);
  };

  const handleDisconnect = (integrationId: string) => {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      next.delete(integrationId);
      return next;
    });
  };

  const handleConnectionComplete = (integrationId: string) => {
    setConnectedIds((prev) => new Set(prev).add(integrationId));
  };

  const connectedCount = connectedIds.size;

  return (
    <div className="flex-1">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <h1 className="font-bold text-3xl mb-2">Integrations</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Connect your sales tools to sync data and automate workflows.
        </p>

        {/* Connected summary */}
        {connectedCount > 0 && (
          <div className="flex items-center gap-2 mb-6 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {connectedCount} of {integrations.length} integrations connected
            </span>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryIntegrations = integrationsByCategory.get(category) || [];
            return (
              <section key={category}>
                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                  {CATEGORY_LABELS[category]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categoryIntegrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      isConnected={connectedIds.has(integration.id)}
                      onConnect={() => handleConnect(integration)}
                      onDisconnect={() => handleDisconnect(integration.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <IntegrationConnectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        integration={selectedIntegration}
        onConnect={handleConnectionComplete}
      />
    </div>
  );
}
