const REDACTED = '[redacted]';
/** Best-effort text filtering, not permission to submit sensitive material. */
export function redactText(text: string): string {
  return text
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?(?:-----END [^-]*PRIVATE KEY-----|$)/g, REDACTED)
    .replace(/\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{12,}|gsk_[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{12,}|github_pat_[A-Za-z0-9_]{12,}|AKIA[A-Z0-9]{16})\b/g, REDACTED)
    .replace(/\b(Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, '$1' + REDACTED)
    .replace(/\b((?:api[_-]?key|access[_-]?token|client[_-]?secret|password|authorization|cookie)\s*[:=]\s*)[^\s,;]+/gi, '$1' + REDACTED)
    .replace(/\b(postgres(?:ql)?:\/\/)[^\s@/]+@/gi, '$1' + REDACTED + '@')
    .slice(0, 24000);
}
export function safeProviderId(value: unknown): string | null {
  return typeof value === 'string' && /^[A-Za-z0-9._:-]{1,160}$/.test(value) ? value : null;
}

export function safeModelId(value: unknown): string | null {
  return typeof value === 'string' && /^[A-Za-z0-9._:/-]{1,160}$/.test(value) ? value : null;
}
