import { AbstractControl, FormGroup } from '@angular/forms';

type BackendValidationErrors = Record<string, string[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function applyBackendValidationErrors(form: FormGroup, error: unknown) {
  const err = error as { error?: unknown };
  if (!isRecord(err?.error)) return;

  const errors = (err.error as Record<string, unknown>)['errors'];
  if (!isRecord(errors)) return;

  for (const [field, messages] of Object.entries(errors as BackendValidationErrors)) {
    const control = form.get(field) as AbstractControl | null;
    if (!control) continue;
    const message = Array.isArray(messages) ? messages.join(' ') : String(messages);
    control.setErrors({ backend: message });
  }
}

export function extractBackendErrorMessage(error: unknown, fallback = 'Network error. Please try again.') {
  const err = error as { error?: unknown };
  if (!isRecord(err?.error)) return fallback;

  const errors = (err.error as Record<string, unknown>)['errors'];
  if (isRecord(errors)) {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].trim()) {
        return value[0].trim();
      }
    }
  }

  const message = (err.error as Record<string, unknown>)['message'];
  if (typeof message === 'string' && message.trim()) return message.trim();

  return fallback;
}

