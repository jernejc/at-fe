"use client";

import { Bell, BellOff, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavNotifications } from "./useNavNotifications";
import type { Notification } from "@/lib/schemas";

/** Single notification row inside the dropdown. */
function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 transition-colors cursor-pointer hover:bg-muted ${notification.read ? "" : "bg-primary/5"}`}
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
    </button>
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
  const {
    open,
    setOpen,
    unreadCount,
    notifications,
    loading,
    handleNotificationClick,
    markAllReadManual,
  } = useNavNotifications();

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
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllReadManual}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Mark all read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
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
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onClick={() => handleNotificationClick(n)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
