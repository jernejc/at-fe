'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BotMessageSquare, Send, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CampaignInputState } from './CampaignInput.types';

interface CampaignInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  canSend: boolean;
  state: CampaignInputState;
  isSearching: boolean;
  lastMessageText: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

/** Resolves which icon key and element to render in the action button. */
function getActionIcon(state: CampaignInputState, isSearching: boolean) {
  if (state === 'active' || isSearching) {
    return { key: 'loader', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
  }
  if (state === 'closed') {
    return { key: 'pencil', icon: <Pencil className="w-4 h-4" /> };
  }
  return { key: 'send', icon: <Send className="w-4 h-4" /> };
}

/** Input row with bot icon, text input, and context-aware action button. */
export function CampaignInputField({
  value,
  onChange,
  onKeyDown,
  onSend,
  canSend,
  state,
  isSearching,
  lastMessageText,
  inputRef,
}: CampaignInputFieldProps) {
  const isClosed = state === 'closed';
  const displayValue = isClosed ? (lastMessageText ?? '') : value;
  const { key: iconKey, icon } = getActionIcon(state, isSearching);

  const isDisabled =
    state === 'active' || isSearching || (state === 'ready' && !canSend);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <BotMessageSquare className="w-5 h-5 text-muted-foreground shrink-0" />

      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        readOnly={isClosed}
        placeholder="Describe the companies you're looking for..."
        className={cn(
          'flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground',
          'outline-none border-none p-0',
          isClosed && 'cursor-default'
        )}
      />

      <Button
        size="icon"
        variant={iconKey === 'loader' ? 'default' : 'ghost'}
        onClick={onSend}
        disabled={isDisabled}
        className={cn(
          'h-8 w-8 rounded-lg shrink-0',
          isDisabled && iconKey === 'send' && 'opacity-40'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={iconKey}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {icon}
          </motion.span>
        </AnimatePresence>
      </Button>
    </div>
  );
}
