"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getUnreadCount,
  getNotifications,
  markAllRead,
  markNotificationRead,
} from "@/lib/api";
import type { Notification } from "@/lib/schemas";

const POLL_INTERVAL_MS = 60_000;

/** Return type for the useNavNotifications hook. */
export interface UseNavNotificationsReturn {
  open: boolean;
  setOpen: (next: boolean) => void;
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  /** Mark a single notification as read. Navigates to campaign if applicable. */
  handleNotificationClick: (notification: Notification) => void;
  /** Manually mark all notifications as read. */
  markAllReadManual: () => void;
}

/** Manages notification state: unread badge, lazy-load on open, mark-read on click. */
export function useNavNotifications(): UseNavNotificationsReturn {
  const [open, setOpenRaw] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);
  const unreadCountRef = useRef(0);

  const router = useRouter();
  const { data: session } = useSession();
  const isPartner = session?.user?.role === "partner";

  // Fetch unread count on mount + poll every 60s
  useEffect(() => {
    let cancelled = false;

    const fetchCount = () => {
      getUnreadCount()
        .then((res) => {
          if (!cancelled) {
            // Invalidate cache when new unread notifications arrive
            if (res.unread_count > unreadCountRef.current) {
              loaded.current = false;
            }
            setUnreadCount(res.unread_count);
            unreadCountRef.current = res.unread_count;
          }
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Load notifications on first open
  const loadNotifications = useCallback(async () => {
    if (loaded.current) return;
    setLoading(true);
    try {
      const pageSize = Math.max(25, unreadCountRef.current);
      const res = await getNotifications(pageSize);
      setNotifications(res.items);
      loaded.current = true;
    } catch {
      // silently fail — user can retry by reopening
    } finally {
      setLoading(false);
    }
  }, []);

  // Wrap setOpen to trigger load on open (no mark-read on close)
  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        loadNotifications();
      }
      setOpenRaw(next);
    },
    [loadNotifications],
  );

  /** Mark a single notification as read. Navigate to campaign if it has a slug. */
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // Mark read locally + via API
      if (!notification.read) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        unreadCountRef.current = Math.max(0, unreadCountRef.current - 1);
        markNotificationRead(notification.id).catch(() => {});
      }

      // Navigate to campaign if slug is present in data
      const slug = notification.data.campaign_slug;
      if (slug) {
        const path = isPartner
          ? `/partner/campaigns/${slug}`
          : `/campaigns/${slug}`;
        router.push(path);
        setOpenRaw(false);
      }
    },
    [isPartner, router],
  );

  /** Manually mark all notifications as read. */
  const markAllReadManual = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => (n.read ? n : { ...n, read: true })),
    );
    setUnreadCount(0);
    unreadCountRef.current = 0;
    markAllRead().catch(() => {});
  }, []);

  return {
    open,
    setOpen,
    unreadCount,
    notifications,
    loading,
    handleNotificationClick,
    markAllReadManual,
  };
}
