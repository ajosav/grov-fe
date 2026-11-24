import type {FieldPath, FieldValues, UseFormReturn} from 'react-hook-form';

import {isApiError} from '@grov/api';

export interface AppliedFieldErrors {
  /** Form fields that now show a message under them, in the order grov-be listed them. */
  placed: string[];
  /** Messages for paths with no field on this form (or for the whole input). */
  unplaced: string[];
}

/**
 * Shows grov-be's field errors under the form's own fields (the `error` of `Field`), whatever
 * fields the server names, not a hand-kept list. Only the first message of a field is shown.
 *
 * `aliases` maps a server path to the form field when they differ (`phoneNumber` → `phone`);
 * a dotted path (`labelAllergenIds.2`) lands on its top-level field. Anything with no field comes
 * back in `unplaced` for the caller to show near the submit button; the summary Alert there
 * already says something went wrong.
 */
export function applyFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: unknown,
  aliases: Record<string, string> = {}
): AppliedFieldErrors {
  const result: AppliedFieldErrors = {placed: [], unplaced: []};
  if (!isApiError(error)) return result;
  const known = new Set(Object.keys(form.getValues()));
  for (const [path, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0];
    if (!message) continue;
    const field = aliases[path] ?? path.split('.')[0] ?? path;
    if (known.has(field)) {
      form.setError(field as FieldPath<T>, {message}, {shouldFocus: result.placed.length === 0});
      result.placed.push(field);
    } else {
      result.unplaced.push(message);
    }
  }
  return result;
}
