'use client';

import type { ContactSequenceItem } from '@/lib/schemas';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { ChannelIcon } from '../ChannelIcon';

interface SequenceCardsProps {
  sequence: ContactSequenceItem[];
}

/** Formats a snake_case key into a readable label. */
function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Copies body, metadata scripts, and talking points to clipboard. */
function handleCopy(item: ContactSequenceItem) {
  const parts: string[] = [];
  if (item.subject) parts.push(`Subject: ${item.subject}`);
  parts.push(item.body);
  if (item.cta) parts.push(item.cta);

  const coldCallScript = item.metadata?.cold_call_script;
  if (coldCallScript && typeof coldCallScript === 'object' && !Array.isArray(coldCallScript)) {
    const lines = Object.entries(coldCallScript as Record<string, string>)
      .map(([key, value]) => `${formatKey(key)}: ${value}`);
    parts.push(`Cold Call Script\n${lines.join('\n')}`);
  }

  const talkingPoints = item.metadata?.phone_talking_points;
  if (Array.isArray(talkingPoints) && talkingPoints.length > 0) {
    parts.push(`Talking Points\n${(talkingPoints as string[]).map((p) => `• ${p}`).join('\n')}`);
  }

  copyToClipboard(parts.join('\n\n'));
  toast.success('Copied to clipboard');
}

/** List of expandable cards for a contact's outreach sequence. */
export function SequenceCards({ sequence }: SequenceCardsProps) {
  if (sequence.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Outreach Sequence</h4>
      {sequence.map((item, i) => (
        <SequenceCard key={i} item={item} />
      ))}
    </div>
  );
}

/** Single expandable card for one sequence step. */
function SequenceCard({ item }: { item: ContactSequenceItem }) {
  const coldCallScript = item.metadata?.cold_call_script;
  const talkingPoints = item.metadata?.phone_talking_points;

  const coldCallEntries = coldCallScript && typeof coldCallScript === 'object' && !Array.isArray(coldCallScript)
    ? Object.entries(coldCallScript as Record<string, string>)
    : null;
  const validTalkingPoints = Array.isArray(talkingPoints) && talkingPoints.length > 0
    ? (talkingPoints as string[])
    : null;

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="flex items-center gap-3">
        {/* Day offset badge */}
        <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex flex-col items-center justify-center">
          <span className="text-[10px] text-muted-foreground uppercase leading-none">Day</span>
          <span className="text-base font-semibold text-foreground leading-tight">
            {item.day_offset}
          </span>
        </div>

        {/* Channel + purpose */}
        <div className="flex-1 min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground capitalize">
            <ChannelIcon channel={item.channel} />
            {item.channel.replace(/_/g, ' ')}
          </span>
          {item.purpose && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{item.purpose}</p>
          )}
        </div>
      </ExpandableCardHeader>

      <ExpandableCardDetails>
        <div className="bg-background rounded-lg px-4 py-3 mt-4">
          {item.subject && (
            <>
              <p className="text-sm font-semibold text-muted-foreground">
                Subject: {item.subject}
              </p>
              <Separator className="my-2" />
            </>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {item.body}
          </p>
          {item.cta && (
            <>
              <Separator className="my-2" />
              <p className="text-sm font-medium text-foreground">{item.cta}</p>
            </>
          )}
        </div>

        {/* Cold Call Script */}
        {coldCallEntries && (
          <div className="bg-background rounded-lg px-4 py-3 mt-3">
            <p className="text-xs font-semibold text-foreground mb-2">Cold Call Script</p>
            <div className="space-y-2">
              {coldCallEntries.map(([key, value]) => (
                <div key={key}>
                  <span className="text-xs font-semibold text-muted-foreground">{formatKey(key)}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phone Talking Points */}
        {validTalkingPoints && (
          <div className="bg-background rounded-lg px-4 py-3 mt-3">
            <p className="text-xs font-semibold text-foreground mb-2">Talking Points</p>
            <ul className="list-disc list-outside ml-4 space-y-1">
              {validTalkingPoints.map((point, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed">{point}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center pb-1">
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(item);
            }}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy
          </Button>
        </div>
      </ExpandableCardDetails>
    </ExpandableCard>
  );
}
