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

/** Copies body (and optional subject) to clipboard. */
function handleCopy(item: ContactSequenceItem) {
  const parts: string[] = [];
  if (item.subject) parts.push(`Subject: ${item.subject}`);
  parts.push(item.body);
  if (item.cta) parts.push(item.cta);
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
