'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchPhase, WSSearchInterpretation } from '@/lib/schemas';
import { useState } from 'react';
import {
  Brain,
  Search,
  BarChart3,
  Download,
  Users,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ThinkingStepsSummaryProps {
  interpretation: WSSearchInterpretation | null;
  completedPhases: WSSearchPhase[];
  className?: string;
}

interface PhaseInfo {
  phase: WSSearchPhase;
  label: string;
  icon: React.ElementType;
  color: string;
}

const phaseInfoMap: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  interpreting: {
    label: 'Understanding query',
    icon: Brain,
    color: 'text-slate-600 dark:text-slate-400',
  },
  searching: {
    label: 'Searching',
    icon: Search,
    color: 'text-slate-600 dark:text-slate-400',
  },
  ranking: {
    label: 'Ranking',
    icon: BarChart3,
    color: 'text-slate-600 dark:text-slate-400',
  },
  results: {
    label: 'Loading results',
    icon: Download,
    color: 'text-slate-600 dark:text-slate-400',
  },
  suggesting: {
    label: 'Finding partners',
    icon: Users,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  partner_suggestion: {
    label: 'Matching partners',
    icon: Users,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  suggestions_complete: {
    label: 'Finalizing',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  insights: {
    label: 'Generating insights',
    icon: Lightbulb,
    color: 'text-amber-600 dark:text-amber-400',
  },
};

export function ThinkingStepsSummary({
  interpretation,
  completedPhases,
  className,
}: ThinkingStepsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out non-relevant phases
  const relevantPhases = completedPhases.filter(
    (phase) => phase !== 'idle' && phase !== 'connecting' && phase !== 'complete' && phase !== 'error'
  );

  if (relevantPhases.length === 0 && !interpretation) {
    return null;
  }

  // Build phase list
  const phases: PhaseInfo[] = relevantPhases
    .map((phase) => {
      const info = phaseInfoMap[phase];
      if (!info) return null;
      return {
        phase,
        label: info.label,
        icon: info.icon,
        color: info.color,
      } as PhaseInfo;
    })
    .filter((p): p is PhaseInfo => p !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-3 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
            Thinking steps completed
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
            {phases.length} {phases.length === 1 ? 'step' : 'steps'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 max-h-48 overflow-y-auto">
              {/* Interpretation summary */}
              {interpretation && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-2">
                    <Brain className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      {interpretation.intent && (
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1 leading-snug">
                          {interpretation.intent}
                        </p>
                      )}
                      {interpretation.keywords && interpretation.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {interpretation.keywords.slice(0, 6).map((keyword) => (
                            <span
                              key={keyword}
                              className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            >
                              {keyword}
                            </span>
                          ))}
                          {interpretation.keywords.length > 6 && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                              +{interpretation.keywords.length - 6}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Phase steps */}
              <div className="space-y-1">
                {phases.map((phaseInfo, index) => {
                  const Icon = phaseInfo.icon;
                  return (
                    <motion.div
                      key={phaseInfo.phase}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 shrink-0">
                        <Icon className={cn('w-3 h-3', phaseInfo.color)} />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {phaseInfo.label}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 ml-auto shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
