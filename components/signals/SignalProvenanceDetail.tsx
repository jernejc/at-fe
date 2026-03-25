'use client';

import { Badge } from '@/components/ui/badge';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { SignalStrengthIndicator } from '@/components/ui/signal-strength-indicator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { PersonRow } from '@/components/ui/person-row';
import { Separator } from '@/components/ui/separator';
import type { SourceDetail, SignalProvenanceResponse, SignalContributor } from '@/lib/schemas/provenance';
import type { EmployeeSummary } from '@/lib/schemas';
import {
  ExternalLink, Database, Calendar,
  Briefcase, FileText, User,
} from 'lucide-react';


interface SignalProvenanceDetailProps {
  signal: SignalProvenanceResponse | null;
  isLoading?: boolean;
}

/** Standalone signal provenance detail content. Usable inside DetailSidePanel or Sheet. */
export function SignalProvenanceDetail({ signal, isLoading }: SignalProvenanceDetailProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Card 1 skeleton */}
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        </div>
        {/* Card 2 skeleton */}
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-4">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Card 3 skeleton */}
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-1">
          <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
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

  const visibleSourceTypes = (signal.source_types ?? []).filter((sourceType) => {
    const normalized = sourceType.toLowerCase();
    return normalized !== 'apollo_industry' && normalized !== 'apollo_growth' && normalized !== 'apollo_revenue';
  });

  const uniqueContributors = (signal.contributors ?? []).filter((contributor, index, contributors) => {
    const contributorName = contributor.employee_name.trim().toLowerCase();
    return contributors.findIndex((c) => c.employee_name.trim().toLowerCase() === contributorName) === index;
  });

  const sortedSources = [...(signal.source_details ?? [])].sort((a, b) => {
    const dateA = a.collected_at ? new Date(a.collected_at).getTime() : 0;
    const dateB = b.collected_at ? new Date(b.collected_at).getTime() : 0;
    return dateB - dateA;
  });

  const previewSources = sortedSources.slice(0, 3);
  const remainingSources = sortedSources.slice(3);
  const previewContributors = uniqueContributors.slice(0, 3);
  const remainingContributors = uniqueContributors.slice(3);

  const displayName = signal.display_name
    || signal.signal_category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-4">
      {/* Card 1: Signal Overview */}
      <ExpandableCard>
        <ExpandableCardHeader className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            {displayName}
          </h2>

          <Dashboard className="grid-cols-2">
            <DashboardCell size="half" className="lg:col-span-1" height="auto" gradient={signal.strength > 7 ? 'green' : undefined}>
              <DashboardCellTitle>Strength</DashboardCellTitle>
              <DashboardCellBody className="flex items-end justify-between">
                <span>{signal.strength} / 10</span>
                <SignalStrengthIndicator value={signal.strength} size={56} showValue={false} />
              </DashboardCellBody>
            </DashboardCell>
            <DashboardCell size="half" className="lg:col-span-1 text-right" height="auto" gradient={Math.round(signal.confidence * 100) > 75 ? 'green' : undefined}>
              <DashboardCellTitle>Confidence</DashboardCellTitle>
              <DashboardCellBody className="flex items-end justify-between">
                <CircularProgress value={Math.round(signal.confidence * 100)} size={56} />
                <span>{Math.round(signal.confidence * 100)}%</span>
              </DashboardCellBody>
            </DashboardCell>
          </Dashboard>

          {signal.evidence_summary && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {signal.evidence_summary}
            </p>
          )}
        </ExpandableCardHeader>

        <ExpandableCardDetails className="pt-5 space-y-5">
          <Separator />

          {/* Badges: signal_type + source_types */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="grey" className="capitalize text-xs">
              {signal.signal_type}
            </Badge>
            {visibleSourceTypes.map((sourceType, i) => (
              <Badge key={i} variant="grey" className="capitalize text-xs">
                {sourceType.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <span className="block font-medium text-foreground">Detected</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {new Date(signal.detected_at).toLocaleDateString()}
              </span>
            </div>
            {signal.aggregation_method && (
              <div className="space-y-1">
                <span className="block font-medium text-foreground">Aggregation</span>
                <span className="capitalize">
                  {signal.aggregation_method.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </ExpandableCardDetails>
      </ExpandableCard>

      {/* Card 2: Source Details */}
      {sortedSources.length > 0 && (
        <ExpandableCard>
          <ExpandableCardHeader className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Sources ({sortedSources.length})
            </h3>
            <div className="divide-y divide-border">
              {previewSources.map((source, i) => (
                <SourceCard key={source.source_id ?? i} source={source} />
              ))}
            </div>
          </ExpandableCardHeader>

          {remainingSources.length > 0 && (
            <ExpandableCardDetails>
              <div className="divide-y divide-border">
                {remainingSources.map((source, i) => (
                  <SourceCard key={source.source_id ?? i} source={source} />
                ))}
              </div>
            </ExpandableCardDetails>
          )}
        </ExpandableCard>
      )}

      {/* Card 3: Contributors */}
      {uniqueContributors.length > 0 && (
        <ExpandableCard>
          <ExpandableCardHeader>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Contributors ({uniqueContributors.length})
            </h3>
            <div className="-mx-6">
              {previewContributors.map((contributor, i) => (
                <PersonRow
                  key={`${contributor.employee_id}-${i}`}
                  person={mapContributorToEmployee(contributor)}
                  hideMetrics
                />
              ))}
            </div>
          </ExpandableCardHeader>

          {remainingContributors.length > 0 && (
            <ExpandableCardDetails>
              <div className="-mx-6">
                {remainingContributors.map((contributor, i) => (
                  <PersonRow
                    key={`${contributor.employee_id}-${i}`}
                    person={mapContributorToEmployee(contributor)}
                    hideMetrics
                  />
                ))}
              </div>
            </ExpandableCardDetails>
          )}
        </ExpandableCard>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

/** Maps a SignalContributor to an EmployeeSummary for use with PersonRow. */
function mapContributorToEmployee(contributor: SignalContributor): EmployeeSummary {
  return {
    id: contributor.employee_id,
    full_name: contributor.employee_name,
    headline: contributor.title ?? null,
    current_title: contributor.title ?? null,
    department: null,
    company_id: 0,
    city: null,
    country: null,
    profile_url: null,
    avatar_url: null,
    is_decision_maker: false,
    is_currently_employed: true,
  };
}

function getSourceTypeConfig(sourceType: string) {
  const type = sourceType.toLowerCase();
  if (type.includes('job') || type === 'job_posting') {
    return { icon: <Briefcase className="h-3 w-3" />, label: 'Job Posting', variant: 'orange' as const, isPost: false };
  }
  if (type.includes('employee') || type === 'employee_profile') {
    return { icon: <User className="h-3 w-3" />, label: 'Employee', variant: 'blue' as const, isPost: false };
  }
  if (type.includes('post') || type === 'linkedin_post') {
    return { icon: <FileText className="h-3 w-3" />, label: 'Post', variant: 'purple' as const, isPost: true };
  }
  if (type.includes('technographics')) {
    return { icon: <Database className="h-3 w-3" />, label: 'Technographics', variant: 'green' as const, isPost: false };
  }
  if (type.includes('news')) {
    return { icon: <FileText className="h-3 w-3" />, label: 'News', variant: 'red' as const, isPost: false };
  }
  return { icon: <Database className="h-3 w-3" />, label: sourceType.replace(/_/g, ' '), variant: 'grey' as const, isPost: false };
}

function SourceCard({ source }: { source: SourceDetail }) {
  const typeConfig = getSourceTypeConfig(source.source_type);

  return (
    <div className="text-sm py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge variant={typeConfig.variant} className="capitalize text-xs gap-1.5">
          {typeConfig.icon}
          {typeConfig.label}
        </Badge>
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
