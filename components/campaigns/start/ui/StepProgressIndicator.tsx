'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type CampaignStep = 'audience' | 'partners' | 'create';

interface Step {
    id: CampaignStep;
    label: string;
}

const steps: Step[] = [
    { id: 'audience', label: 'Describe Audience' },
    { id: 'partners', label: 'Select Partners' },
    { id: 'create', label: 'Create' },
];

interface StepProgressIndicatorProps {
    currentStep: CampaignStep;
    className?: string;
}

export function StepProgressIndicator({ currentStep, className }: StepProgressIndicatorProps) {
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className={cn('flex items-center gap-8', className)}>
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isPending = index > currentIndex;

                return (
                    <div key={step.id} className="flex items-center">
                        {/* Step indicator */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1 : 0.9,
                                    backgroundColor: isCompleted
                                        ? 'rgb(16, 185, 129)' // emerald-500
                                        : isCurrent
                                            ? 'rgb(59, 130, 246)' // blue-500
                                            : 'rgb(226, 232, 240)', // slate-200
                                }}
                                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                className={cn(
                                    'flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-semibold',
                                    isCompleted && 'text-white',
                                    isCurrent && 'text-white',
                                    isPending && 'text-slate-400 dark:text-slate-500'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-3.5 h-3.5" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </motion.div>
                            <span
                                className={cn(
                                    'hidden sm:block text-xs font-medium transition-colors',
                                    isCurrent && 'text-slate-900 dark:text-white',
                                    isCompleted && 'text-slate-600 dark:text-slate-400',
                                    isPending && 'text-slate-400 dark:text-slate-500'
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
