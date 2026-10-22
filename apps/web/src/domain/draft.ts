export const DRAFT_KEY = 'bld8.workbench.draft.v1';
export const MAX_PROMPT_LENGTH = 4000;
export const MAX_TITLE_LENGTH = 80;
export interface RequestDraft { version: 1; title: string; prompt: string; updatedAt: string }
export type DraftErrors = Partial<Record<'title' | 'prompt', string>>;

export function validateDraft(title: string, prompt: string): DraftErrors {
  const errors: DraftErrors = {};
  if (!title.trim()) errors.title = 'Give this request a short title.';
  else if (title.trim().length > MAX_TITLE_LENGTH) errors.title = `Use ${MAX_TITLE_LENGTH} characters or fewer.`;
  if (!prompt.trim()) errors.prompt = 'Add the request you want to work on.';
  else if (prompt.trim().length > MAX_PROMPT_LENGTH) errors.prompt = `Use ${MAX_PROMPT_LENGTH} characters or fewer.`;
  return errors;
}

export function parseDraft(raw: string | null): RequestDraft | null {
  if (!raw || raw.length > 20000) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    const draft = data as Partial<RequestDraft>;
    if (draft.version !== 1 || typeof draft.title !== 'string' || typeof draft.prompt !== 'string'
      || typeof draft.updatedAt !== 'string' || !Number.isFinite(Date.parse(draft.updatedAt))
      || Object.keys(validateDraft(draft.title, draft.prompt)).length) return null;
    return { version: 1, title: draft.title.trim(), prompt: draft.prompt.trim(), updatedAt: draft.updatedAt };
  } catch { return null; }
}
