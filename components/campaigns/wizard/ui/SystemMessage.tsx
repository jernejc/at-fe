'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced animation variants
const messageVariants: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 30,
            duration: 0.4
        }
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

const avatarVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    show: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
        }
    }
};

// System message component with enhanced animations
export function SystemMessage({ children, showAvatar = true }: { children: React.ReactNode; showAvatar?: boolean }) {
    // Only show bubble background for actual messages (with avatar), not for interactive content
    const hasBubble = showAvatar;

    return (
        <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex gap-3 max-w-2xl"
        >
            {showAvatar && (
                <motion.div variants={avatarVariants} initial="hidden" animate="show">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                </motion.div>
            )}
            <motion.div
                className={cn(
                    "flex-1 min-w-0",
                    hasBubble && "bg-white dark:bg-slate-800/60 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700/50",
                    !showAvatar && "ml-11"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
