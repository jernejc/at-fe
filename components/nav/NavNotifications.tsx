"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";

/** Notification bell with a placeholder "no notifications" dropdown. */
export function NavNotifications() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-background rounded-xl shadow-xl border border-border z-50 overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
