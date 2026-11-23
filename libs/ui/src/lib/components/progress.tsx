import {type ReactNode} from 'react';

import {cn} from '../utils/cn';

const TONE = {
  flame: {bar: 'bg-flame', ring: 'stroke-flame'},
  palm: {bar: 'bg-palm', ring: 'stroke-palm'},
  leaf: {bar: 'bg-leaf', ring: 'stroke-leaf'},
} as const;

export interface ProgressProps {
  value: number;
  max: number;
  label?: ReactNode;
  valueLabel?: ReactNode;
  tone?: keyof typeof TONE;
  variant?: 'bar' | 'ring';
  size?: number;
  thickness?: number;
  center?: ReactNode;
  'aria-label'?: string;
  className?: string;
}

export function Progress({
  value,
  max,
  label,
  valueLabel,
  tone = 'flame',
  variant = 'bar',
  size = 96,
  thickness = 10,
  center,
  className,
  ...aria
}: ProgressProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const a11y = {
    role: 'progressbar' as const,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': value,
    'aria-label': aria['aria-label'] ?? (typeof label === 'string' ? label : undefined),
  };

  if (variant === 'ring') {
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    return (
      <div className={cn('relative inline-flex items-center justify-center', className)} {...a11y}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            className="stroke-surface-sunken"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - ratio)}
            className={cn(
              TONE[tone].ring,
              'transition-[stroke-dashoffset] duration-700 ease-emphasized'
            )}
          />
        </svg>
        {center ? (
          <div className="absolute inset-0 flex items-center justify-center text-center text-label">
            {center}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-1.5', className)}>
      {label || valueLabel ? (
        <div className="flex items-baseline justify-between gap-3 text-body-sm">
          <span className="font-semibold text-ink">{label}</span>
          <span className="tabular text-ink-muted">{valueLabel}</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-pill bg-surface-sunken" {...a11y}>
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-700 ease-emphasized',
            TONE[tone].bar
          )}
          style={{width: `${ratio * 100}%`}}
        />
      </div>
    </div>
  );
}
