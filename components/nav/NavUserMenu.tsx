"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/auth/firebaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sun, Moon, SunMoon, Building2 } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { usePartner } from "@/components/providers/PartnerProvider";
import { Separator } from "@/components/ui/separator";
import { useChangelog } from "./useChangelog";
import { ChangelogDialog } from "./ChangelogDialog";

/** User avatar button with a dropdown for profile, theme, and sign out. */
export function NavUserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const { theme, cycleTheme } = useTheme();
  const { partner } = usePartner();
  const { dialogOpen, openChangelog, closeChangelog, hasNewVersion, versions, newVersions } =
    useChangelog();

  const ThemeIcon = theme === "system" ? SunMoon : theme === "light" ? Sun : Moon;
  const themeLabel = theme === "system" ? "System mode" : theme === "light" ? "Light mode" : "Dark mode";

  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  const handleVersionClick = () => {
    setOpen(false);
    openChangelog();
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center hover:opacity-80 transition-opacity focus:outline-none"
        >
          <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
            {session?.user?.image && (
              <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
            )}
            <AvatarFallback className="bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 bg-background rounded-xl shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border bg-muted/50">
                <p className="text-sm font-medium truncate text-foreground">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
                {partner && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                    {partner.logo_url ? (
                      <div className="h-5 w-5 rounded-sm overflow-hidden bg-background flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic external URL */}
                        <img src={partner.logo_url} alt={partner.name} className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground truncate">{partner.name}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground px-3 mt-3">Theme</div>
              <button
                onClick={cycleTheme}
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex justify-between items-center gap-2"
              >
                <span>{themeLabel}</span>
                <ThemeIcon className="w-4 h-4" />
              </button>
              <Separator />
              <button
                onClick={async () => {
                  await firebaseSignOut(firebaseAuth);
                  signOut();
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Sign Out
              </button>
              <Separator />
              <button
                onClick={handleVersionClick}
                className="w-full px-3 py-2 text-[10px] flex items-center justify-between bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
              >
                <span>changelog</span>
                <span className="flex items-center gap-1.5">
                  v{process.env.NEXT_PUBLIC_APP_VERSION}
                  {hasNewVersion && (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      <ChangelogDialog
        open={dialogOpen}
        onOpenChange={(next) => {
          if (!next) closeChangelog();
        }}
        versions={versions}
        newVersions={newVersions}
      />
    </>
  );
}
