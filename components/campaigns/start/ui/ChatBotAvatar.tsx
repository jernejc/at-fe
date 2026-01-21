'use client';

import Image from 'next/image';

interface ChatBotAvatarProps {
    className?: string;
}

export function ChatBotAvatar({ className }: ChatBotAvatarProps) {
    return (
        <div className="w-8 h-8 shrink-0 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <Image
                src="/images/logo.svg"
                alt="LookAcross"
                width={16}
                height={16}
                className="dark:invert"
            />
        </div>
    );
}
