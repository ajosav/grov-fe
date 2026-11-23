import {Check} from 'lucide-react';

import {cn} from '../utils/cn';

export interface StepIndicatorProps {
  steps: string[];
  current: number;
  className?: string;
}

/** Where someone is in a short flow (onboarding, checkout). Only the current step's label shows; the rest are for screen readers. */
export function StepIndicator({steps, current, className}: StepIndicatorProps) {
  return (
    <ol
      className={cn('flex items-center gap-2', className)}
      aria-label={`Step ${current + 1} of ${steps.length}`}
    >
      {steps.map((label, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li
            key={label}
            className="flex flex-1 items-center gap-2"
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-pill text-chip tabular',
                state === 'done' && 'bg-leaf text-on-night',
                state === 'current' && 'bg-flame text-ink',
                state === 'todo' && 'border border-line-strong/40 text-ink-muted'
              )}
            >
              {state === 'done' ? <Check aria-hidden className="size-4" /> : index + 1}
            </span>
            <span
              className={cn(
                'whitespace-nowrap text-body-sm font-semibold',
                state !== 'current' && 'sr-only'
              )}
            >
              {label}
              {state === 'done' ? <span className="sr-only"> (done)</span> : null}
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn('h-px flex-1', index < current ? 'bg-leaf' : 'bg-line')}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
