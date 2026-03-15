'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseListKeyboardNavOptions<T> {
  /** The list of items to navigate through. */
  items: T[];
  /** Currently selected item, or null if nothing is selected. */
  selectedItem: T | null;
  /** Unique key extractor for each item. */
  getKey: (item: T) => string | number;
  /** Called when a new item should be selected. */
  onSelect: (item: T) => void;
  /** Whether keyboard navigation is enabled. @default true */
  enabled?: boolean;
}

interface UseListKeyboardNavReturn {
  /** Returns a ref callback for a given item key. Attach to each list item element. */
  getItemRef: (key: string | number) => (el: HTMLElement | null) => void;
}

/** Manages ArrowUp/ArrowDown keyboard navigation within a list of items. */
export function useListKeyboardNav<T>({
  items,
  selectedItem,
  getKey,
  onSelect,
  enabled = true,
}: UseListKeyboardNavOptions<T>): UseListKeyboardNavReturn {
  const itemRefs = useRef<Map<string | number, HTMLElement>>(new Map());

  const getItemRef = useCallback(
    (key: string | number) => (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(key, el);
      else itemRefs.current.delete(key);
    },
    [],
  );

  // Stable refs for the keydown handler to avoid re-attaching on every render
  const itemsRef = useRef(items);
  const selectedItemRef = useRef(selectedItem);
  const onSelectRef = useRef(onSelect);
  const getKeyRef = useRef(getKey);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { selectedItemRef.current = selectedItem; }, [selectedItem]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { getKeyRef.current = getKey; }, [getKey]);

  useEffect(() => {
    if (!enabled || !selectedItem) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

      const currentItems = itemsRef.current;
      const current = selectedItemRef.current;
      if (!current || currentItems.length === 0) return;

      const currentKey = getKeyRef.current(current);
      const currentIndex = currentItems.findIndex((item) => getKeyRef.current(item) === currentKey);
      if (currentIndex === -1) return;

      let nextIndex: number;
      if (e.key === 'ArrowDown') {
        nextIndex = Math.min(currentIndex + 1, currentItems.length - 1);
      } else {
        nextIndex = Math.max(currentIndex - 1, 0);
      }

      if (nextIndex !== currentIndex) {
        e.preventDefault();
        const nextItem = currentItems[nextIndex];
        onSelectRef.current(nextItem);
        const nextKey = getKeyRef.current(nextItem);
        const el = itemRefs.current.get(nextKey);
        el?.focus();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled, selectedItem]);

  // Focus and scroll to the selected item when selection changes
  useEffect(() => {
    if (!selectedItem) return;
    const key = getKey(selectedItem);
    const el = itemRefs.current.get(key);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [selectedItem, getKey]);

  return { getItemRef };
}
