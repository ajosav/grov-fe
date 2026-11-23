import {type ReactNode, useId, useState} from 'react';

import {ChevronDown} from 'lucide-react';

import {cn} from '../utils/cn';
import {Money} from './money';
import {PriceStatus, type PriceStatusKind} from './price-status';
import {Tag, type TagProps} from './tag';

const THUMB = {
  flame: 'bg-flame-tint text-flame-strong',
  leaf: 'bg-leaf-tint text-leaf-strong',
  palm: 'bg-palm-tint text-palm-strong',
  sky: 'bg-sky-tint text-sky-strong',
  neutral: 'bg-surface-sunken text-ink',
} as const;

export interface PlanLineProps {
  name: string;
  quantity: string;
  priceKobo: number;
  wasKobo?: number;
  status?: PriceStatusKind;
  statusDetail?: string;
  tags?: {label: string; tone?: TagProps['tone']; icon?: ReactNode}[];
  reason?: string;
  tone?: keyof typeof THUMB;
  initials?: string;
  onSelect?: () => void;
  className?: string;
}

/** One item in a plan or basket (design system "PlanLine"). */
export function PlanLine({
  name,
  quantity,
  priceKobo,
  wasKobo,
  status,
  statusDetail,
  tags,
  reason,
  tone = 'neutral',
  initials,
  onSelect,
  className,
}: PlanLineProps) {
  const [open, setOpen] = useState(false);
  const reasonId = useId();
  const unavailable = status === 'out-of-stock';

  return (
    <div
      className={cn(
        'grid gap-2 border-b border-line py-3 last:border-0',
        unavailable && 'opacity-60',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-md font-display text-title-sm',
            THUMB[tone]
          )}
        >
          {(initials ?? name.charAt(0)).toUpperCase()}
        </span>
        <div className="grid min-w-0 flex-1 gap-0.5">
          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              className="truncate text-left text-label hover:underline"
            >
              {name}
            </button>
          ) : (
            <span className="truncate text-label">{name}</span>
          )}
          <span className="text-body-sm text-ink-muted">{quantity}</span>
          {tags?.length ? (
            <span className="mt-1 flex flex-wrap gap-1">
              {tags.map(tag => (
                <Tag key={tag.label} tone={tag.tone} icon={tag.icon}>
                  {tag.label}
                </Tag>
              ))}
            </span>
          ) : null}
        </div>
        <div className="grid justify-items-end gap-1 text-right">
          <span className="flex items-baseline gap-2">
            {wasKobo !== undefined ? (
              <Money kobo={wasKobo} className="text-body-sm text-ink-muted line-through" />
            ) : null}
            <Money kobo={priceKobo} className="text-money" />
          </span>
          {status ? <PriceStatus status={status} detail={statusDetail} /> : null}
        </div>
      </div>
      {reason ? (
        <div className="pl-14">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={reasonId}
            onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-1 text-body-sm font-semibold text-ink-muted hover:text-ink"
          >
            Why this?
            <ChevronDown
              aria-hidden
              className={cn('size-4 transition-transform', open && 'rotate-180')}
            />
          </button>
          <p id={reasonId} hidden={!open} className="mt-1 text-body-sm text-ink-muted">
            {reason}
          </p>
        </div>
      ) : null}
    </div>
  );
}
