'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { SlideDirection } from './useNewCampaignFlow.types';

interface StepTransitionProps {
  stepKey: string;
  direction: SlideDirection;
  children: ReactNode;
}

/** AnimatePresence wrapper with directional slide for step transitions. */
export function StepTransition({ stepKey, children }: StepTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="flex-1 min-h-0 overflow-hidden flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
