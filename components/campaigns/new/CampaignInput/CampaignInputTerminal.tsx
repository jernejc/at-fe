'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { WSSearchPhase, WSSearchInterpretation } from '@/lib/schemas';

interface CampaignInputTerminalProps {
  phase: WSSearchPhase;
  completedPhases: WSSearchPhase[];
  interpretation: WSSearchInterpretation | null;
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

/** Collects displayable interpretation fields into label/value pairs. */
function getInterpretationItems(interpretation: WSSearchInterpretation) {
  const items: { label: string; value: string }[] = [];

  if (interpretation.intent) {
    items.push({ label: 'Intent', value: interpretation.intent });
  }

  const allKeywords = [
    ...(interpretation.keywords ?? []),
    ...(interpretation.signal_keywords ?? []),
    ...(interpretation.content_keywords ?? []),
    ...(interpretation.technology_keywords ?? []),
  ];
  const unique = [...new Set(allKeywords)];
  if (unique.length > 0) {
    items.push({ label: 'Keywords', value: unique.join(', ') });
  }

  const filterEntries = Object.entries(interpretation.filters ?? {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );
  if (filterEntries.length > 0) {
    const formatted = filterEntries.map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join(', ');
    items.push({ label: 'Filters', value: formatted });
  }

  if (interpretation.confidence != null) {
    items.push({ label: 'Confidence', value: `${Math.round(interpretation.confidence * 100)}%` });
  }

  return items;
}

/** Renders interpretation sub-items with staggered animation. */
function InterpretationDetails({ interpretation }: { interpretation: WSSearchInterpretation }) {
  const items = getInterpretationItems(interpretation);

  return (
    <div className="ml-5 mt-1 space-y-0.5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-baseline gap-1.5"
        >
          <span className="text-emerald-600 shrink-0">{item.label}:</span>
          <span className="text-gray-400">{item.value}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** Terminal-style dark section showing WS progress phases. */
export function CampaignInputTerminal({
  phase,
  completedPhases,
  interpretation,
}: CampaignInputTerminalProps) {
  return (
    <div className="bg-black max-h-45 overflow-y-auto flex flex-col-reverse">
      <div className="">
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
              >
                <div className="flex items-center gap-2">
                  {state === 'active' && <PulsingDot />}
                  {state === 'completed' && (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}

                  <span
                    className={cn(
                      state === 'active' && 'text-gray-200',
                      state === 'completed' && 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {step.id === 'understanding' && interpretation && (
                  <InterpretationDetails interpretation={interpretation} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
