'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { SourceDetail, SignalProvenanceResponse, SignalContributor } from '@/lib/schemas/provenance';
import {
  ExternalLink, Database, Users, Calendar, Quote,
  Signal, SignalHigh, SignalMedium, SignalLow, SignalZero,
  Briefcase, FileText, User, ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalProvenanceDetailProps {
  signal: SignalProvenanceResponse | null;
  isLoading?: boolean;
}

/** Standalone signal provenance detail content. Usable inside DetailSidePanel or Sheet. */
export function SignalProvenanceDetail({ signal, isLoading }: SignalProvenanceDetailProps) {
  const [showAllSources, setShowAllSources] = useState(false);

  const visibleSourceTypes = (signal?.source_types ?? []).filter((sourceType) => {
    const normalized = sourceType.toLowerCase();
    return normalized !== 'apollo_industry' && normalized !== 'apollo_growth' && normalized !== 'apollo_revenue';
  });

  const uniqueContributors = (signal?.contributors ?? []).filter((contributor, index, contributors) => {
    const contributorName = contributor.employee_name.trim().toLowerCase();
    return contributors.findIndex((c) => c.employee_name.trim().toLowerCase() === contributorName) === index;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load signal provenance.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="pb-4 border-b border-border mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="grey" className="capitalize text-xs">
              {signal.signal_type}
            </Badge>
            <Badge variant={signal.confidence > 0.7 ? 'default' : 'grey'} className="text-xs">
              {Math.round(signal.confidence * 100)}% Confidence
            </Badge>
            {visibleSourceTypes.slice(0, 3).map((sourceType, i) => (
              <Badge key={i} variant="grey" className="capitalize text-xs">
                {sourceType.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {signal.display_name || signal.signal_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </h2>
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold shrink-0',
              Math.round(signal.strength) >= 8
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : Math.round(signal.strength) >= 6
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : Math.round(signal.strength) >= 4
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'bg-muted text-muted-foreground',
            )}>
              <SignalStrengthIcon strength={signal.strength} className="w-4 h-4" />
              {Math.round(signal.strength)}/10
            </span>
          </div>

          <div className="flex items-center gap-3">
            {signal.display_name && signal.display_name !== signal.signal_category && (
              <span className="text-sm text-muted-foreground capitalize">
                {signal.signal_category.replace(/_/g, ' ')}
              </span>
            )}
            {signal.component_count != null && signal.component_count > 0 && (
              <span className="text-xs text-muted-foreground">
                {signal.component_count} component{signal.component_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Evidence Summary */}
        {signal.evidence_summary && (
          <section>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Quote className="h-3 w-3" />
                Evidence Summary
              </h3>
              <p className="text-sm leading-relaxed text-foreground">
                {signal.evidence_summary}
              </p>
            </div>
          </section>
        )}

        {/* Source Details */}
        {signal.source_details && signal.source_details.length > 0 && (() => {
          const sortedSources = [...signal.source_details].sort((a, b) => {
            const dateA = a.collected_at ? new Date(a.collected_at).getTime() : 0;
            const dateB = b.collected_at ? new Date(b.collected_at).getTime() : 0;
            return dateB - dateA;
          });
          const visibleSources = showAllSources ? sortedSources : sortedSources.slice(0, 5);
          const remainingCount = sortedSources.length - 5;

          return (
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Primary Sources
                <span className="text-xs text-muted-foreground font-normal">({sortedSources.length})</span>
              </h3>
              <div className="space-y-3">
                {visibleSources.map((source, i) => (
                  <SourceCard key={i} source={source} />
                ))}
              </div>
              {remainingCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSources(!showAllSources)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  {showAllSources ? (
                    <><ChevronUp className="h-4 w-4 mr-1" /> Show less</>
                  ) : (
                    <><ChevronDown className="h-4 w-4 mr-1" /> Show {remainingCount} more</>
                  )}
                </Button>
              )}
            </section>
          );
        })()}

        {/* Contributors */}
        {uniqueContributors.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Contributing Employees ({uniqueContributors.length})
            </h3>
            <div className="grid gap-3">
              {uniqueContributors.map((contributor, i) => (
                <ContributorCard key={`${contributor.employee_id}-${contributor.employee_name}-${i}`} contributor={contributor} />
              ))}
            </div>
          </section>
        )}

        {/* Metadata */}
        <section className="pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <span className="block font-medium text-foreground">Detected At</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {new Date(signal.detected_at).toLocaleDateString()}
              </span>
            </div>
            {signal.aggregation_method && (
              <div className="space-y-1">
                <span className="block font-medium text-foreground">Aggregation</span>
                <span className="capitalize">{signal.aggregation_method.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SignalStrengthIcon({ strength, className }: { strength: number; className?: string }) {
  if (strength >= 8) return <Signal className={className} />;
  if (strength >= 6) return <SignalHigh className={className} />;
  if (strength >= 4) return <SignalMedium className={className} />;
  if (strength >= 2) return <SignalLow className={className} />;
  return <SignalZero className={className} />;
}

function getSourceTypeConfig(sourceType: string) {
  const type = sourceType.toLowerCase();
  if (type.includes('job') || type === 'job_posting') {
    return {
      icon: <Briefcase className="h-3 w-3" />,
      label: 'Job Posting',
      className: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      isPost: false,
    };
  }
  if (type.includes('employee') || type === 'employee_profile') {
    return {
      icon: <User className="h-3 w-3" />,
      label: 'Employee',
      className: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      isPost: false,
    };
  }
  if (type.includes('post') || type === 'linkedin_post') {
    return {
      icon: <FileText className="h-3 w-3" />,
      label: 'Post',
      className: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      isPost: true,
    };
  }
  return {
    icon: <Database className="h-3 w-3" />,
    label: sourceType.replace(/_/g, ' '),
    className: 'bg-muted text-muted-foreground border-border',
    isPost: false,
  };
}

function SourceCard({ source }: { source: SourceDetail }) {
  const typeConfig = getSourceTypeConfig(source.source_type);

  return (
    <div className="bg-card border border-border rounded-lg p-3 text-sm hover:bg-muted/20 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border',
          typeConfig.className,
        )}>
          {typeConfig.icon}
          {typeConfig.label}
        </span>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener"
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      <div className="space-y-1 min-w-0">
        {source.title && !typeConfig.isPost && (
          <p className="font-medium text-sm text-foreground line-clamp-1">
            {source.title}
          </p>
        )}
        {source.snippet && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            &quot;{source.snippet}&quot;
          </p>
        )}
      </div>
      {source.collected_at && (
        <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
          <Calendar className="h-2.5 w-2.5" />
          Collected: {new Date(source.collected_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

function ContributorCard({ contributor }: { contributor: SignalContributor }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {contributor.employee_name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground truncate">
          {contributor.employee_name}
        </div>
        {(contributor.title || contributor.seniority_level) && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {contributor.title}
            {contributor.title && contributor.seniority_level && ' \u2022 '}
            <span className="capitalize">{contributor.seniority_level}</span>
          </div>
        )}
      </div>
      {contributor.evidence && (
        <Badge variant="grey" className="text-[10px] max-w-[120px] truncate" title={contributor.evidence}>
          Has Evidence
        </Badge>
      )}
    </div>
  );
}
