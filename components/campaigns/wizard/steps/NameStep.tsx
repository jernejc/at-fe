'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemMessage } from '../ui/SystemMessage';

interface NameStepProps {
    name: string;
    onNameChange: (value: string) => void;
    onSubmit: () => void;
    description: string;
    onDescriptionChange: (value: string) => void;
    showDescription: boolean;
    onShowDescription: (show: boolean) => void;
}

export function NameStep({
    name,
    onNameChange,
    onSubmit,
    description,
    onDescriptionChange,
    showDescription,
    onShowDescription
}: NameStepProps) {
    return (
        <SystemMessage showAvatar={false}>
            <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <input
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit()}
                        placeholder="Campaign name"
                        autoFocus
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600 transition-all duration-200"
                    />
                    
                    {/* Description - shown on demand */}
                    <AnimatePresence>
                        {showDescription ? (
                            <motion.textarea
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                value={description}
                                onChange={(e) => onDescriptionChange(e.target.value)}
                                placeholder="Add a description..."
                                rows={2}
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:border-slate-300 dark:focus:border-slate-600 transition-all duration-200 resize-none"
                            />
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => onShowDescription(true)}
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
                            >
                                <span>+ Add description</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        size="lg"
                        onClick={onSubmit}
                        disabled={!name.trim()}
                        className="w-full h-11 rounded-xl gap-2"
                    >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </motion.div>
            </motion.div>
        </SystemMessage>
    );
}
