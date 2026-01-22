'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchPhase, WSSearchInterpretation } from '@/lib/schemas';
import { Brain, Search, Users, Lightbulb, Check } from 'lucide-react';

interface SearchProgressCardProps {
  phase: WSSearchPhase;
  interpretation: WSSearchInterpretation | null;
  completedPhases: WSSearchPhase[];
  className?: string;
}

interface DisplayStep {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  phases: WSSearchPhase[];
}

const DISPLAY_STEPS: DisplayStep[] = [
  {
    id: 'understanding',
    label: 'Understanding query',
    icon: Brain,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    phases: ['interpreting'],
  },
  {
    id: 'searching',
    label: 'Searching companies',
    icon: Search,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    phases: ['searching', 'ranking', 'results'],
  },
  {
    id: 'partners',
    label: 'Finding partners',
    icon: Users,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    phases: ['suggesting', 'partner_suggestion', 'suggestions_complete'],
  },
  {
    id: 'insights',
    label: 'Generating insights',
    icon: Lightbulb,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    phases: ['insights'],
  },
];

type StepState = 'pending' | 'active' | 'completed';

function getStepState(
  step: DisplayStep,
  currentPhase: WSSearchPhase,
  completedPhases: WSSearchPhase[]
): StepState {
  // Check if any of this step's phases are in completedPhases
  const hasCompletedPhase = step.phases.some((p) => completedPhases.includes(p));

  // Check if the current phase is one of this step's phases
  const isActive = step.phases.includes(currentPhase);

  // If we're in complete state and this step had completed phases, it's completed
  if (currentPhase === 'complete' && hasCompletedPhase) {
    return 'completed';
  }

  // If we're currently in this step's phases, it's active
  if (isActive) {
    return 'active';
  }

  // If we have completed phases for this step and we've moved past, it's completed
  if (hasCompletedPhase) {
    return 'completed';
  }

  return 'pending';
}

function AnimatedDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function StepRow({
  step,
  state,
  showInterpretation,
  interpretation,
  index,
}: {
  step: DisplayStep;
  state: StepState;
  showInterpretation: boolean;
  interpretation: WSSearchInterpretation | null;
  index: number;
}) {
  const Icon = step.icon;
  const isPending = state === 'pending';
  const isActive = state === 'active';
  const isCompleted = state === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'p-2 rounded-lg transition-colors',
        isActive && 'bg-white dark:bg-slate-800',
        !isActive && 'bg-white/50 dark:bg-slate-800/50'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-lg shrink-0 transition-colors',
            isPending && 'bg-slate-100 dark:bg-slate-700',
            isActive && step.bgColor,
            isCompleted && step.bgColor
          )}
        >
          {isActive ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon
                className={cn(
                  'w-3.5 h-3.5',
                  isPending && 'text-slate-400 dark:text-slate-500',
                  isActive && step.color,
                  isCompleted && step.color
                )}
              />
            </motion.div>
          ) : (
            <Icon
              className={cn(
                'w-3.5 h-3.5',
                isPending && 'text-slate-400 dark:text-slate-500',
                isActive && step.color,
                isCompleted && step.color
              )}
            />
          )}
        </div>

        {/* Label */}
        <span
          className={cn(
            'text-xs font-medium flex-1 transition-colors',
            isPending && 'text-slate-400 dark:text-slate-500',
            isActive && 'text-slate-700 dark:text-slate-200',
            isCompleted && 'text-slate-600 dark:text-slate-300'
          )}
        >
          {step.label}
        </span>

        {/* Right side indicator */}
        <div className="w-6 flex items-center justify-center shrink-0">
          {isActive && <AnimatedDots />}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Interpretation details (only for first step) */}
      {showInterpretation && interpretation && (isActive || isCompleted) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-2 ml-9 space-y-1.5"
        >
          {interpretation.intent && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              &ldquo;{interpretation.intent}&rdquo;
            </p>
          )}
          {interpretation.keywords && interpretation.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {interpretation.keywords.slice(0, 5).map((keyword, idx) => (
                <motion.span
                  key={keyword}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  {keyword}
                </motion.span>
              ))}
              {interpretation.keywords.length > 5 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                  +{interpretation.keywords.length - 5}
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export function SearchProgressCard({
  phase,
  interpretation,
  completedPhases,
  className,
}: SearchProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden',
        className
      )}
    >
      <div className="p-2 space-y-1">
        {DISPLAY_STEPS.map((step, index) => {
          const state = getStepState(step, phase, completedPhases);
          const showInterpretation = step.id === 'understanding';

          return state !== 'pending' && (
            <StepRow
              key={step.id}
              step={step}
              state={state}
              showInterpretation={showInterpretation}
              interpretation={interpretation}
              index={index}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
