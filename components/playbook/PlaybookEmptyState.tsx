'use client';

import { Button } from '@/components/ui/button';
import { Briefcase, Sparkles, RefreshCw } from 'lucide-react';

interface PlaybookEmptyStateProps {
  productName?: string | null;
  isGenerating: boolean;
  generationError: string | null;
  onGenerate: () => void;
}

/** Empty state shown when no playbook exists, with a generate button. */
export function PlaybookEmptyState({
  productName,
  isGenerating,
  generationError,
  onGenerate,
}: PlaybookEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="rounded-full bg-muted/30 p-4">
        <Briefcase className="size-10 stroke-[1.5] text-muted-foreground" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">No Playbook Available</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          {productName
            ? `Generate a sales playbook for ${productName} to get tailored outreach strategies for this account.`
            : 'Generate a sales playbook to get tailored outreach strategies for this account.'}
        </p>
      </div>

      {generationError && (
        <p className="text-sm text-destructive">{generationError}</p>
      )}

      <Button variant="secondary" onClick={onGenerate} disabled={isGenerating} className="gap-2">
        {isGenerating ? (
          <>
            <RefreshCw className="size-4 animate-spin" />
            Generating Playbook...
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            Generate Playbook
          </>
        )}
      </Button>

      {isGenerating && (
        <p className="text-xs text-muted-foreground">This may take a few minutes...</p>
      )}
    </div>
  );
}
