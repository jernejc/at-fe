"use client";

import { Bell, BellOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Notification } from "@/lib/schemas";

/** Mock notifications for the design system demo. */
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "campaign_update",
    title: "Campaign published",
    message: "Your campaign 'Q1 Enterprise Push' has been published and is now live.",
    data: {},
    user_id: 1,
    campaign_id: 10,
    read: false,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    type: "partner_assigned",
    title: "New partner assigned",
    message: "TechPartners Inc. has been assigned to 3 companies in your campaign.",
    data: {},
    user_id: 1,
    campaign_id: 10,
    read: false,
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    type: "signal_detected",
    title: "High-value signal detected",
    message: "Acme Corp showed strong buying intent based on recent job postings.",
    data: {},
    user_id: 1,
    campaign_id: 5,
    read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 4,
    type: "playbook_ready",
    title: "Playbook generated",
    message: "A new outreach playbook for GlobalTech Solutions is ready for review.",
    data: {},
    user_id: 1,
    campaign_id: 8,
    read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

/** Static notification item for the demo (no API calls). */
function DemoNotificationItem({ notification }: { notification: Notification }) {
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
      <p className="text-[11px] text-muted-foreground/70 mt-1">
        {notification.read ? "Read" : "Unread"}
      </p>
    </div>
  );
}

/** Skeleton placeholder for the loading-state demo. */
function DemoSkeleton() {
  return (
    <div className="px-4 py-3 border-b border-border last:border-b-0 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

/** Badge pill rendered on the bell icon. */
function DemoBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Design-system showcase for the notifications dropdown. */
export function NotificationSection() {
  return (
    <section id="notifications" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Bell icon badge, notification list, skeleton loading, and empty state.
        </p>
      </div>

      {/* Badge variants */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Badge Variants
        </h3>
        <div className="flex items-center gap-6">
          {[0, 3, 12, 99, 150].map((count) => (
            <div key={count} className="flex flex-col items-center gap-2">
              <div className="relative p-1.5 text-foreground/70">
                <Bell className="w-5 h-5" />
                <DemoBadge count={count} />
              </div>
              <span className="text-xs text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown states side-by-side */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Dropdown States
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loading state */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Loading</p>
            <div className="w-80 bg-background rounded-xl shadow-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
              </div>
              <div>
                <DemoSkeleton />
                <DemoSkeleton />
                <DemoSkeleton />
                <DemoSkeleton />
              </div>
            </div>
          </div>

          {/* With notifications */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              With notifications (2 unread)
            </p>
            <div className="w-80 bg-background rounded-xl shadow-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <DemoNotificationItem key={n.id} notification={n} />
                ))}
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Empty</p>
            <div className="w-80 bg-background rounded-xl shadow-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 py-10 px-4">
                <BellOff className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
