import type { ContactSequenceItem } from '@/lib/schemas';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ChannelIcon } from './ChannelIcon';

interface OutreachStepCellProps {
  step: ContactSequenceItem;
}

/** Renders a single outreach step as a grey box with channel icon and name, with a tooltip showing the step's purpose. */
export function OutreachStepCell({ step }: OutreachStepCellProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="w-20 m-2 shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-muted px-2 py-1.5 cursor-default">
        <ChannelIcon channel={step.channel} className="w-4 h-4" />
        <span className="text-xs text-muted-foreground capitalize truncate w-full text-center">
          {step.channel.replace(/_/g, ' ')}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{step.purpose}</TooltipContent>
    </Tooltip>
  );
}
