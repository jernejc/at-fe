'use client';

import { motion } from 'framer-motion';
import type { CampaignInputMessage } from './CampaignInput.types';

interface CampaignInputChatProps {
  messages: CampaignInputMessage[];
}

/** Displays user messages as right-aligned primary-colored bubbles. */
export function CampaignInputChat({ messages }: CampaignInputChatProps) {
  return (
    <div className="flex flex-col-reverse max-h-40 overflow-y-auto px-4 py-3">
      <div className="flex flex-col gap-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex justify-end"
          >
            <div className="rounded-2xl rounded-tr-md px-4 py-2.5 bg-primary text-primary-foreground text-sm max-w-[80%]">
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
