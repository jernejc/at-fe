'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { PlaybookRead, PlaybookContactResponse, CadenceStep, ObjectionHandlingEntry } from '@/lib/schemas';

/** Discriminated union representing the currently selected playbook detail item. */
export type PlaybookDetailSelection =
  | { type: 'contact'; data: PlaybookContactResponse }
  | { type: 'step'; data: CadenceStep; index: number }
  | { type: 'objection'; data: ObjectionHandlingEntry; index: number };

/** Encodes a selection into a URL param value. */
function encodeSelection(sel: PlaybookDetailSelection): string {
  switch (sel.type) {
    case 'contact': return `contact:${sel.data.id}`;
    case 'step': return `step:${sel.index}`;
    case 'objection': return `objection:${sel.index}`;
  }
}

/** Resolves a URL param value into a PlaybookDetailSelection using playbook data. */
function resolveSelection(param: string, playbook: PlaybookRead): PlaybookDetailSelection | null {
  const colonIdx = param.indexOf(':');
  if (colonIdx === -1) return null;

  const type = param.slice(0, colonIdx);
  const idStr = param.slice(colonIdx + 1);
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return null;

  switch (type) {
    case 'contact': {
      const contact = playbook.contacts?.find((c) => c.id === id);
      return contact ? { type: 'contact', data: contact } : null;
    }
    case 'step': {
      const step = playbook.outreach_cadence?.sequence?.[id];
      return step ? { type: 'step', data: step, index: id } : null;
    }
    case 'objection': {
      const entry = playbook.objection_handling?.[id];
      return entry ? { type: 'objection', data: entry, index: id } : null;
    }
    default: return null;
  }
}

const DETAIL_PARAM = 'detail';

/** Manages playbook detail selection state synced to URL search params. */
export function usePlaybookDetail(playbook: PlaybookRead) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Derive selected from URL param. */
  const selected = useMemo<PlaybookDetailSelection | null>(() => {
    const param = searchParams.get(DETAIL_PARAM);
    if (!param) return null;
    return resolveSelection(param, playbook);
  }, [searchParams, playbook]);

  /** Update URL with a new selection. push=true adds history entry, false replaces. */
  const updateUrl = useCallback((sel: PlaybookDetailSelection | null, push: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sel) {
      params.set(DETAIL_PARAM, encodeSelection(sel));
    } else {
      params.delete(DETAIL_PARAM);
    }
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (push) router.push(url, { scroll: false });
    else router.replace(url, { scroll: false });
  }, [router, pathname, searchParams]);

  // --- Click handlers (toggle + push history) ---

  const handleContactClick = useCallback((contact: PlaybookContactResponse) => {
    const isActive = selected?.type === 'contact' && selected.data.id === contact.id;
    updateUrl(isActive ? null : { type: 'contact', data: contact }, false);
  }, [selected, updateUrl]);

  const handleStepClick = useCallback((step: CadenceStep, index: number) => {
    const isActive = selected?.type === 'step' && selected.index === index;
    updateUrl(isActive ? null : { type: 'step', data: step, index }, false);
  }, [selected, updateUrl]);

  const handleObjectionClick = useCallback((entry: ObjectionHandlingEntry, index: number) => {
    const isActive = selected?.type === 'objection' && selected.index === index;
    updateUrl(isActive ? null : { type: 'objection', data: entry, index }, false);
  }, [selected, updateUrl]);

  // --- Navigate handlers (replace, for keyboard nav) ---

  const navigateToContact = useCallback((contact: PlaybookContactResponse) => {
    updateUrl({ type: 'contact', data: contact }, false);
  }, [updateUrl]);

  const navigateToStep = useCallback((step: CadenceStep, index: number) => {
    updateUrl({ type: 'step', data: step, index }, false);
  }, [updateUrl]);

  const navigateToObjection = useCallback((entry: ObjectionHandlingEntry, index: number) => {
    updateUrl({ type: 'objection', data: entry, index }, false);
  }, [updateUrl]);

  const handleClose = useCallback(() => {
    updateUrl(null, false);
  }, [updateUrl]);

  // --- Active checkers ---

  const isContactActive = useCallback(
    (id: number) => selected?.type === 'contact' && selected.data.id === id,
    [selected],
  );

  const isStepActive = useCallback(
    (index: number) => selected?.type === 'step' && selected.index === index,
    [selected],
  );

  const isObjectionActive = useCallback(
    (index: number) => selected?.type === 'objection' && selected.index === index,
    [selected],
  );

  return {
    selected,
    handleContactClick,
    handleStepClick,
    handleObjectionClick,
    navigateToContact,
    navigateToStep,
    navigateToObjection,
    handleClose,
    isContactActive,
    isStepActive,
    isObjectionActive,
  };
}
