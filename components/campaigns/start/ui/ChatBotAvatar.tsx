'use client';

import Image from 'next/image';

interface ChatBotAvatarProps {
    className?: string;
}

export function ChatBotAvatar({ className }: ChatBotAvatarProps) {
    return (
        <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center">
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
