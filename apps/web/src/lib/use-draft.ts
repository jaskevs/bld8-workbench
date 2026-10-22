'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { DRAFT_KEY, parseDraft, type RequestDraft } from '@/domain/draft';

const changeEvent = 'workbench-draft-changed';
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === DRAFT_KEY || event.key === null) callback(); };
  window.addEventListener('storage', storage);
  window.addEventListener(changeEvent, callback);
  return () => { window.removeEventListener('storage', storage); window.removeEventListener(changeEvent, callback); };
}
function snapshot() {
  try { return window.localStorage.getItem(DRAFT_KEY); } catch { return null; }
}
export function useDraft() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => parseDraft(raw), [raw]);
}
export function saveDraft(draft: RequestDraft): boolean {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch { return false; }
}
