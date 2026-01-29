'use client';

import { useState } from 'react';
import { CheckCircle2, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Integration } from './integrations-data';

interface IntegrationCardProps {
  integration: Integration;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function IntegrationCard({
  integration,
  isConnected,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`
        bg-white dark:bg-slate-900 rounded-xl border p-4 flex flex-col gap-3 transition-colors
        ${isConnected
          ? 'border-emerald-400 dark:border-emerald-800'
          : 'border-slate-200 dark:border-slate-700/80'
        }
      `}
    >
      {/* Header with logo and name */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          {imgError ? (
            <Plug className="w-5 h-5 text-slate-400" />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={integration.logoUrl}
              alt={`${integration.name} logo`}
              className="w-8 h-8 object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900 dark:text-white truncate">
              {integration.name}
            </h3>
            {isConnected && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
            {integration.description}
          </p>
          {/* Keywords */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {integration.keywords.map((keyword) => (
              <Badge key={keyword} variant="default" className="text-xs bg-slate-100 text-slate-700">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-auto pt-1 text-right">
        {isConnected ? (
          <Button
            variant="outline"
            onClick={onDisconnect}
            className="w-full"
          >
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            className="w-full"
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
