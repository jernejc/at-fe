"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Sun, Moon, SunMoon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Header() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, cycleTheme } = useTheme();

  const ThemeIcon = theme === "system" ? SunMoon : theme === "light" ? Sun : Moon;
  const themeLabel = theme === "system" ? "System mode" : theme === "light" ? "Light mode" : "Dark mode";

  // Get user initials from name or email
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-20 sticky top-0">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand (Left) */}
        <Logo />

        {/* User Actions (Right) */}
        <div className="flex items-center gap-3 justify-end shrink-0">
          <ProcessingStatus />

          {/* Discovery Link */}
          <Link
            href="/discovery"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Discovery</span>
          </Link>

          {/* A2A Link 
          <Link
            href="/a2a/diagram"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Network className="w-4 h-4" />
            <span className="hidden sm:inline">A2A</span>
          </Link>
          */}

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
            >
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                {session?.user?.image && (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || "User"}
                  />
                )}
                <AvatarFallback className="bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
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
                <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <Link
                    href="/"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Workloads
                  </Link>
                  <button
                    onClick={cycleTheme}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex justify-between items-center gap-2"
                  >
                    <span>{themeLabel}</span>
                    <ThemeIcon className="w-4 h-4" />
                  </button>
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
