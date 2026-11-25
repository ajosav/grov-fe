import {type KeyboardEvent} from 'react';

import {cn} from '../utils/cn';

export type SegmentedSize = 'sm' | 'md';

export interface SegmentedProps<T extends string> {
  options: readonly {value: T; label: string}[];
  /** `null` when nothing is chosen yet; the first option is then the one Tab lands on. */
  value: T | null;
  onChange: (value: T) => void;
  label: string;
  /** `sm` is the dense toolbar size; `md` (default) is for page-level switches. */
  size?: SegmentedSize;
  className?: string;
}

const SIZE: Record<SegmentedSize, {track: string; button: string}> = {
  sm: {track: 'p-0.5', button: 'h-8 px-3'},
  md: {track: 'p-1', button: 'h-10 px-4'},
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
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
        'inline-flex flex-wrap items-center gap-1 rounded-pill bg-surface-sunken',
        SIZE[size].track,
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
              'inline-flex items-center rounded-pill text-body-sm font-semibold text-ink-muted transition-colors hover:text-ink',
              SIZE[size].button,
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
