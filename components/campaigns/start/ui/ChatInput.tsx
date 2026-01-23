'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (query?: string) => void;
    onContinue?: () => void;
    suggestedQueries?: string[];
    showContinue?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    onContinue,
    showContinue = false,
    disabled = false,
    placeholder = 'Describe your ideal customers...',
    className,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled) {
                onSubmit();
            }
        }
    };

    return (
        <div className={cn('pb-6 px-11', className)}>

            {/* Continue button */}
            {showContinue && onContinue && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3"
                >
                    <Button
                        onClick={onContinue}
                        className="w-full"
                        size="xl"
                    >
                        Continue to Partner Selection
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </motion.div>
            )}

            {/* Input with send button */}
            <div className="relative">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    autoFocus
                    className={cn(
                        'pr-12 py-3.25 pl-4 min-h-12 max-h-[200px] resize-none',
                        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
                        'focus:border-slate-300 dark:focus:border-slate-600'
                    )}
                />
                <Button
                    size="icon"
                    onClick={() => onSubmit()}
                    disabled={!value.trim() || disabled}
                    className={cn(
                        'absolute right-2 bottom-2',
                        'h-8 w-8 rounded-lg',
                        !value.trim() && 'opacity-50'
                    )}
                >
                    <ArrowUp className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
