"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getUnreadCount, getNotifications, markAllRead } from "@/lib/api";
import type { Notification } from "@/lib/schemas";

const POLL_INTERVAL_MS = 60_000;

/** Return type for the useNavNotifications hook. */
export interface UseNavNotificationsReturn {
  open: boolean;
  setOpen: (next: boolean) => void;
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
}

/** Manages notification state: unread badge, lazy-load on open, mark-read on close. */
export function useNavNotifications(): UseNavNotificationsReturn {
  const [open, setOpenRaw] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);
  const hadUnread = useRef(false);
  const unreadCountRef = useRef(0);

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

  // Wrap setOpen to trigger load/mark-read side effects
  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        // Opening
        hadUnread.current = unreadCount > 0;
        loadNotifications();
      } else {
        // Closing — mark read if there were unread notifications
        if (hadUnread.current) {
          setNotifications((prev) =>
            prev.map((n) => (n.read ? n : { ...n, read: true })),
          );
          setUnreadCount(0);
          markAllRead().catch(() => {});
        }
      }
      setOpenRaw(next);
    },
    [unreadCount, loadNotifications],
  );

  return { open, setOpen, unreadCount, notifications, loading };
}
