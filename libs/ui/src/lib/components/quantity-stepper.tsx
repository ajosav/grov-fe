import {Minus, Plus} from 'lucide-react';

import {cn} from '../utils/cn';

export interface QuantityStepperProps {
  value: number;
  unit: string;
  units?: string[];
  equivalent?: string | ((value: number, unit: string) => string);
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onUnitChange?: (unit: string) => void;
  itemLabel: string;
  className?: string;
}

export function QuantityStepper({
  value,
  unit,
  units,
  equivalent,
  min = 0,
  max = 999,
  step = 1,
  onChange,
  onUnitChange,
  itemLabel,
  className,
}: QuantityStepperProps) {
  const eq = typeof equivalent === 'function' ? equivalent(value, unit) : equivalent;
  const nextUnit = () => {
    if (!units || units.length < 2 || !onUnitChange) return;
    const i = units.indexOf(unit);
    onUnitChange(units[(i + 1) % units.length] ?? unit);
  };
  return (
    <div className={cn('inline-grid justify-items-center gap-1', className)}>
      <div role="group" aria-label={`${itemLabel} quantity`} className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`One less ${itemLabel}`}
          disabled={value - step < min}
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex size-12 items-center justify-center rounded-pill border border-line-strong/40 text-ink transition-colors hover:bg-surface-sunken disabled:opacity-40"
        >
          <Minus aria-hidden className="size-5" />
        </button>
        <output aria-live="polite" className="min-w-16 text-center">
          <span className="tabular block text-title-sm">{value}</span>
          {units && units.length > 1 && onUnitChange ? (
            <button
              type="button"
              onClick={nextUnit}
              className="text-body-sm text-ink-muted underline underline-offset-2"
            >
              {unit}
            </button>
          ) : (
            <span className="block text-body-sm text-ink-muted">{unit}</span>
          )}
        </output>
        <button
          type="button"
          aria-label={`One more ${itemLabel}`}
          disabled={value + step > max}
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex size-12 items-center justify-center rounded-pill bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40"
        >
          <Plus aria-hidden className="size-5" />
        </button>
      </div>
      {eq ? <span className="text-body-sm text-ink-muted">{eq}</span> : null}
    </div>
  );
}
