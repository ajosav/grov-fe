import {type KeyboardEvent} from 'react';

import {cn} from '../utils/cn';

export interface SegmentedProps<T extends string> {
  options: readonly {value: T; label: string}[];
  /** `null` when nothing is chosen yet; the first option is then the one Tab lands on. */
  value: T | null;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedProps<T>) {
  const move = (event: KeyboardEvent, index: number) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next = options[(index + delta + options.length) % options.length];
    if (next) onChange(next.value);
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-pill bg-surface-sunken p-1',
        className
      )}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (value === null && index === 0) ? 0 : -1}
            onKeyDown={event => move(event, index)}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-10 items-center rounded-pill px-4 text-body-sm font-semibold text-ink-muted transition-colors hover:text-ink',
              checked && 'bg-night text-on-night hover:text-on-night'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
