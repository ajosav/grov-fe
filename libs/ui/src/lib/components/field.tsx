import {cloneElement, isValidElement, type ReactElement, type ReactNode, useId} from 'react';

import {CircleAlert} from 'lucide-react';

import {cn} from '../utils/cn';
import {Label} from './label';

export interface FieldProps {
  label: ReactNode;
  /** The control. Gets `id`, `aria-describedby` and `aria-invalid` wired for you. */
  children: ReactElement<Record<string, unknown>>;
  hint?: ReactNode;
  error?: string;
  /** Visually hide the label (it stays for screen readers). */
  hideLabel?: boolean;
  optional?: boolean;
  className?: string;
}

/** Label + control + hint + error, with the accessibility wiring done once. */
export function Field({label, children, hint, error, hideLabel, optional, className}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    : children;

  return (
    <div className={cn('grid content-start gap-2', className)}>
      <Label htmlFor={id} className={cn(hideLabel && 'sr-only')}>
        {label}
        {optional ? <span className="ml-1 font-medium text-ink-muted">(optional)</span> : null}
      </Label>
      {control}
      {hint && !error ? (
        <p id={hintId} className="text-body-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-body-sm text-danger">
          <CircleAlert aria-hidden className="size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
