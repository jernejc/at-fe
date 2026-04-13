import { ExternalLink, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { COMPETITOR_BRAND_COLORS } from '@/data/competitor-events';
import type { PartnerEvent } from '@/data/partner-events';
import type { CompetitorEvent } from '@/data/competitor-events';
import type { AnyEvent } from './events.types';

/** Compact relative-time label with semantic urgency class. */
function getRelativeTime(dateStr: string): { label: string; className: string } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((date.getTime() - now.getTime()) / 86_400_000);

  if (diff < -7) return { label: `${Math.abs(Math.round(diff / 7))}w ago`, className: 'text-muted-foreground/60' };
  if (diff < 0) return { label: `${Math.abs(diff)}d ago`, className: 'text-muted-foreground/60' };
  if (diff === 0) return { label: 'Today', className: 'text-amber-600 dark:text-amber-400 font-medium' };
  if (diff === 1) return { label: 'Tomorrow', className: 'text-amber-600 dark:text-amber-400 font-medium' };
  if (diff <= 7) return { label: `in ${diff}d`, className: 'text-emerald-600 dark:text-emerald-400' };
  if (diff <= 30) return { label: `in ${Math.ceil(diff / 7)}w`, className: 'text-muted-foreground' };
  return { label: `in ${Math.round(diff / 30)}mo`, className: 'text-muted-foreground' };
}

/** Formatted short date for display: "Apr 15". */
export function formatEventDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Returns the category color for an event. */
export function getEventColor(event: AnyEvent): string {
  if (event._kind === 'competitor') return COMPETITOR_BRAND_COLORS[event.brand];
  return event.partner ? '#009E73' : '#0072B2';
}

const TYPE_BADGES: Record<string, { label: string; variant: 'green' | 'purple' | 'orange' }> = {
  'in-person': { label: 'In-person', variant: 'green' },
  webinar: { label: 'Virtual', variant: 'purple' },
  virtual: { label: 'Virtual', variant: 'purple' },
  hybrid: { label: 'Hybrid', variant: 'orange' },
};

interface EventListItemProps {
  event: AnyEvent;
  isSelected: boolean;
  onClick: () => void;
}

/** Single event row with left-border accent, type badge, and relative time. */
export function EventListItem({ event, isSelected, onClick }: EventListItemProps) {
  const color = getEventColor(event);
  const isCompetitor = event._kind === 'competitor';
  const isPartner = !isCompetitor && !!(event as PartnerEvent).partner;
  const rel = getRelativeTime(event.date);
  const badge = TYPE_BADGES[event.type] ?? TYPE_BADGES['hybrid'];

  const selectedBg = isCompetitor
    ? 'bg-red-50 dark:bg-red-950/20'
    : isPartner
      ? 'bg-emerald-50 dark:bg-emerald-950/20'
      : 'bg-sky-50 dark:bg-sky-950/20';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border-b border-border/50 transition-colors ${isSelected ? selectedBg : 'hover:bg-muted/50'}`}
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <div className="px-3.5 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-snug line-clamp-2">{event.name}</span>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <Badge size="sm" variant={badge.variant}>{badge.label}</Badge>
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(ev) => ev.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3 shrink-0 opacity-50" />
          <span>{formatEventDate(event.date)}</span>
          <span className={rel.className}>{rel.label}</span>
          <span className="opacity-30">·</span>
          <span className="truncate">{event.city}{event.state ? `, ${event.state}` : ''}</span>
        </div>
        {isCompetitor && (
          <div className="mt-1 text-xs">
            <span className="font-medium" style={{ color }}>{(event as CompetitorEvent).brand}</span>
          </div>
        )}
        {isPartner && (
          <div className="mt-1 text-xs text-muted-foreground">
            Partner: <span className="text-foreground/70">{(event as PartnerEvent).partner}</span>
          </div>
        )}
      </div>
    </button>
  );
}
