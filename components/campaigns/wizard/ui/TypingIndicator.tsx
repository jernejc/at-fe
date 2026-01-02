'use client';

import { motion } from 'framer-motion';

// Typing indicator component with polished bounce animation
export function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-2xl rounded-tl-md w-fit">
            <motion.div
                className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            />
            <motion.div
                className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />
            <motion.div
                className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
        </div>
    );
}
