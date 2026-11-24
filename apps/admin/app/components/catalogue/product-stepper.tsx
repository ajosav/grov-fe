import {Check} from 'lucide-react';

import {cn} from '@grov/ui';

export interface ProductStepperProps {
  steps: readonly string[];
  current: number;
  /** The furthest step the admin has reached; any step up to it can be revisited. */
  reached: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

/**
 * Every step's name stays visible, so the admin sees what is ahead and what they have done.
 * Centred; steps already reached are buttons that go back (or forward again).
 */
export function ProductStepper({steps, current, reached, onSelect, disabled}: ProductStepperProps) {
  return (
    <nav aria-label={`Step ${current + 1} of ${steps.length}`} className="mx-auto w-full max-w-xl">
      <ol className="flex items-start justify-center">
        {steps.map((label, index) => {
          const state = index === current ? 'current' : index < current ? 'done' : 'todo';
          const canGo = !disabled && index <= reached && index !== current;
          const marker = (
            <>
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-pill text-chip tabular-nums',
                  state === 'done' && 'bg-leaf text-on-night',
                  state === 'current' && 'bg-flame text-ink',
                  state === 'todo' && 'border border-line-strong/40 bg-surface text-ink-muted'
                )}
              >
                {state === 'done' ? <Check aria-hidden className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-center text-body-sm',
                  state === 'current' ? 'font-semibold text-ink' : 'text-ink-muted'
                )}
              >
                {label}
                {state === 'done' ? <span className="sr-only"> (done)</span> : null}
              </span>
            </>
          );
          return (
            <li
              key={label}
              aria-current={state === 'current' ? 'step' : undefined}
              className="relative flex flex-1 justify-center"
            >
              {index > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    // Runs between the two circles' edges, never underneath a number.
                    'absolute top-4 h-px -translate-y-1/2 left-[calc(-50%+1.25rem)] w-[calc(100%-2.5rem)]',
                    index <= current ? 'bg-leaf' : 'bg-line'
                  )}
                />
              ) : null}
              {canGo ? (
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className="relative flex max-w-32 flex-col items-center gap-1.5 rounded-md px-1 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {marker}
                </button>
              ) : (
                <div className="relative flex max-w-32 flex-col items-center gap-1.5 px-1">
                  {marker}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
