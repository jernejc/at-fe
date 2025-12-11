interface LogoProps {
    orientation?: 'horizontal' | 'vertical';
}

export default function Logo({ orientation = 'horizontal' }: LogoProps) {
    const isVertical = orientation === 'vertical';

    return (
        <div
            className={`flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity cursor-pointer text-slate-800 dark:text-slate-100 ${isVertical ? 'flex-col gap-4' : 'flex-row'
                }`}
            onClick={() => window.location.href = '/'}
        >
            <div className={`flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20 ${isVertical ? 'w-12 h-12' : 'w-9 h-9'
                }`}>
                <svg className={isVertical ? "w-7 h-7" : "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </div>
            <div className={`flex flex-col ${isVertical ? 'items-center text-center' : 'items-start'}`}>
                <h1 className={`font-bold tracking-tight text-foreground leading-none font-display ${isVertical ? 'text-2xl mt-0' : 'text-lg mt-1'
                    }`}>LookAcross</h1>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Account Intelligence</p>
            </div>
        </div>
    )
}