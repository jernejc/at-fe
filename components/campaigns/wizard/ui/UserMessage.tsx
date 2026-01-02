'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

// User message component with slide-in animation
export function UserMessage({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex gap-3 justify-end"
        >
            <div className="bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl rounded-br-md shadow-sm">
                <span className="text-sm font-medium">{children}</span>
            </div>
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-200 dark:to-slate-300 border border-slate-500 dark:border-slate-400 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-200 dark:text-slate-600" />
            </div>
        </motion.div>
    );
}
