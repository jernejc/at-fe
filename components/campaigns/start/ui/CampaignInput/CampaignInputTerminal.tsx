'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { WSSearchPhase } from '@/lib/schemas';

interface CampaignInputTerminalProps {
  phase: WSSearchPhase;
  completedPhases: WSSearchPhase[];
}

interface TerminalStep {
  id: string;
  label: string;
  phases: WSSearchPhase[];
}

const TERMINAL_STEPS: TerminalStep[] = [
  { id: 'understanding', label: 'Understanding query', phases: ['interpreting'] },
  { id: 'searching', label: 'Searching companies', phases: ['searching', 'ranking', 'results'] },
  { id: 'partners', label: 'Finding partners', phases: ['suggesting', 'partner_suggestion', 'suggestions_complete'] },
  { id: 'insights', label: 'Generating insights', phases: ['insights'] },
];

type StepState = 'pending' | 'active' | 'completed';

function getStepState(
  step: TerminalStep,
  currentPhase: WSSearchPhase,
  completedPhases: WSSearchPhase[]
): StepState {
  const hasCompleted = step.phases.some((p) => completedPhases.includes(p));
  const isActive = step.phases.includes(currentPhase);

  if (currentPhase === 'complete' && hasCompleted) return 'completed';
  if (isActive) return 'active';
  if (hasCompleted) return 'completed';
  return 'pending';
}

/** Animated pulsing dot for active terminal steps. */
function PulsingDot() {
  return (
    <motion.span
      className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/** Terminal-style dark section showing WS progress phases. */
export function CampaignInputTerminal({
  phase,
  completedPhases,
}: CampaignInputTerminalProps) {
  return (
    <div className="bg-slate-900 dark:bg-slate-950 max-h-32 overflow-y-auto">
      <div className="flex flex-col-reverse">
        <div className="p-4 space-y-2 font-mono text-xs">
          {TERMINAL_STEPS.map((step, index) => {
            const state = getStepState(step, phase, completedPhases);
            if (state === 'pending') return null;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="flex items-center gap-2"
              >
                {state === 'active' && <PulsingDot />}
                {state === 'completed' && (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                )}

                <span
                  className={cn(
                    state === 'active' && 'text-slate-200',
                    state === 'completed' && 'text-slate-500'
                  )}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
