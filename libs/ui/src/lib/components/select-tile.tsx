import {type ReactNode} from 'react';

import {Check} from 'lucide-react';

import {cn} from '../utils/cn';
import {IconTile, type IconTileProps} from './icon-tile';

export interface SelectTileProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: IconTileProps['tone'];
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
  className?: string;
}

export function SelectTile({
  title,
  description,
  icon,
  tone,
  selected,
  multi,
  onSelect,
  className,
}: SelectTileProps) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-4 rounded-lg border bg-surface p-4 text-left transition-colors',
        'hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        selected ? 'border-flame bg-flame-tint' : 'border-line',
        className
      )}
    >
      {icon ? <IconTile icon={icon} tone={tone} /> : null}
      <span className="grid flex-1 gap-0.5">
        <span className="text-label">{title}</span>
        {description ? <span className="text-body-sm text-ink-muted">{description}</span> : null}
      </span>
      <span
        aria-hidden
        className={cn(
          'flex size-6 shrink-0 items-center justify-center border-2',
          multi ? 'rounded-sm' : 'rounded-pill',
          selected ? 'border-flame bg-flame text-on-bright' : 'border-line-strong'
        )}
      >
        {selected ? <Check className="size-4" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
