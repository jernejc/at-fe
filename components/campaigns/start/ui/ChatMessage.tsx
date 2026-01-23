'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { ChatBotAvatar } from './ChatBotAvatar';

const messageVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 30,
        },
    },
};

interface ChatMessageProps {
    type: 'user' | 'system';
    content: string;
    children?: React.ReactNode;
    className?: string;
    hideAvatar?: boolean;
}

// Simple inline markdown parser for bold text with newline support
function parseSimpleMarkdown(text: string): React.ReactNode[] {
    const lines = text.split('\n');

    return lines.flatMap((line, lineIndex) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);

        const parsedLine = parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={`b-${lineIndex}-${partIndex}`}>
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });

        // Insert <br /> between lines (but not after the last one)
        if (lineIndex < lines.length - 1) {
            parsedLine.push(
                <br key={`br-${lineIndex}`} />
            );
        }

        return parsedLine;
    });
}


export function ChatMessage({ type, content, children, className, hideAvatar = false }: ChatMessageProps) {
    const isUser = type === 'user';

    return (
        <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="show"
            className={cn(
                'flex gap-3',
                isUser && 'flex-row-reverse',
                className
            )}
        >
            {/* Avatar */}
            {!hideAvatar && (
                <div className="shrink-0">
                    {isUser ? (
                        <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-white dark:text-slate-900" />
                        </div>
                    ) : (
                        <ChatBotAvatar />
                    )}
                </div>
            )}

            {/* Message content */}
            <div
                className={cn(
                    'flex-1 min-w-0',
                    isUser && 'flex justify-end',
                    hideAvatar && !isUser && 'ml-11'
                )}
            >
                {content && (
                    <div
                        className={cn(
                            'rounded-2xl px-4 py-2.5 max-w-[85%]',
                            isUser
                                ? 'bg-slate-700 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-md'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-md'
                        )}
                    >
                        <p className="text-sm leading-relaxed">
                            {parseSimpleMarkdown(content)}
                        </p>
                    </div>
                )}
                {children && (
                    <div className={cn('mt-2', isUser && 'flex justify-end')}>
                        {children}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
