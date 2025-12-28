'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { ProcessingStatus } from '@/components/processing/ProcessingStatus';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Network } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from './Logo';

export function Header() {
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Get user initials from name or email
    const getUserInitials = () => {
        if (session?.user?.name) {
            return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (session?.user?.email) {
            return session.user.email.slice(0, 2).toUpperCase();
        }
        return '??';
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-border/80 shrink-0 z-20 sticky top-0">
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
                {/* Brand (Left) */}
                <Logo />

                {/* User Actions (Right) */}
                <div className="flex items-center gap-3 justify-end shrink-0">
                    <ProcessingStatus />

                    {/* Discovery Link */}
                    <Link
                        href="/discovery"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
                    >
                        <Search className="w-4 h-4" />
                        <span className="hidden sm:inline">Discovery</span>
                    </Link>

                    {/* A2A Link */}
                    <Link
                        href="/a2a/diagram"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
                    >
                        <Network className="w-4 h-4" />
                        <span className="hidden sm:inline">A2A</span>
                    </Link>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                        >
                            <Avatar className="h-8 w-8">
                                {session?.user?.image && (
                                    <AvatarImage src={session.user.image} alt={session.user.name || 'User'} />
                                )}
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-border z-50">
                                    <div className="px-3 py-2 border-b border-border">
                                        <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                                    </div>
                                    <Link
                                        href="/campaigns"
                                        onClick={() => setShowUserMenu(false)}
                                        className="block px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Campaigns
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
