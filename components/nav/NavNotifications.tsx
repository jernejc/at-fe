"use client";

import { Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavNotifications } from "./useNavNotifications";
import type { Notification } from "@/lib/schemas";

/** Single notification row inside the dropdown. */
function NotificationItem({ notification }: { notification: Notification }) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <div
      className={`px-4 py-3 border-b border-border last:border-b-0 transition-colors ${notification.read ? "" : "bg-primary/5"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug">
          {notification.title}
        </p>
        {!notification.read && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
        {notification.message}
      </p>
      <p className="text-[11px] text-muted-foreground/70 mt-1">{timeAgo}</p>
    </div>
  );
}

/** Skeleton placeholder shown while notifications are loading. */
function NotificationSkeleton() {
  return (
    <div className="px-4 py-3 border-b border-border last:border-b-0 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

/** Notification bell with unread badge and dropdown list. */
export function NavNotifications() {
  const { open, setOpen, unreadCount, notifications, loading } =
    useNavNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-foreground/70 hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-background rounded-xl shadow-xl border border-border z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <>
                  <NotificationSkeleton />
                  <NotificationSkeleton />
                  <NotificationSkeleton />
                  <NotificationSkeleton />
                </>
              )}

              {!loading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 px-4">
                  <BellOff className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              )}

              {!loading &&
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
