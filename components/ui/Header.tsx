'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { ProcessingStatus } from '@/components/processing/ProcessingStatus';
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
                <div className="flex items-center gap-6 justify-end shrink-0">
                    <ProcessingStatus />
                    <Link href="/a2a/diagram" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">A2A</Link>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                        >
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    {getUserInitials()}
                                </div>
                            )}
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
