'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

interface LogoProps {
    orientation?: 'horizontal' | 'vertical';
}

export default function Logo({ orientation = 'horizontal' }: LogoProps) {
    const router = useRouter();
    const isVertical = orientation === 'vertical';

    return (
        <div
            className={`flex items-center gap-3 shrink-0 transition-opacity cursor-pointer text-slate-800 dark:text-slate-100 ${isVertical ? 'flex-col gap-4' : 'flex-row'
                }`}
            onClick={() => router.push('/')}
        >
            <div className={`flex items-center justify-center ${isVertical ? 'w-15 h-15' : 'w-8 h-8'
                }`}>
                <Image src="/images/logo-color.png" alt="LA initials as LookAcross logo" width={220} height={220}></Image>
            </div>
            <div className={`flex flex-col ${isVertical ? 'items-center text-center' : 'items-start'}`}>
                <h1 className={`font-bold tracking-tight text-foreground leading-none font-display ${isVertical ? 'text-2xl mt-0' : 'text-lg mt-1'
                    }`}>LookAcross</h1>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Account Intelligence</p>
            </div>
        </div>
    )
}