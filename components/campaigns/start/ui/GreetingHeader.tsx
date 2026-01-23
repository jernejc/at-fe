'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GreetingHeaderProps {
    className?: string;
}

export function GreetingHeader({ className }: GreetingHeaderProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12', className)}>
            {/* Logo in circular indigo container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    duration: 0.5,
                }}
                className="relative mb-8"
            >
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15">
                    <Image
                        src="/images/logo-color.png"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="object-contain brightness-0 invert"
                    />
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 -z-10 rounded-full bg-indigo-500/20 blur-xl" />
            </motion.div>

            {/* Main heading */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.1,
                }}
                className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white text-center mb-3"
            >
                Let&apos;s start your new campaign!
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.2,
                }}
                className="text-sm sm:text-base text-slate-500 dark:text-slate-400 text-center max-w-md px-4"
            >
                Describe your ideal customer profile and I&apos;ll help you find the perfect audience for your campaign.
            </motion.p>
        </div>
    );
}
