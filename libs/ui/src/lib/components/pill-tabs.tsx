import type {ReactNode} from 'react';

import {cn} from '../utils/cn';

export interface PillTab<T extends string> {
  value: T;
  label: string;
  /** "128 products", "3 open". */
  count?: ReactNode;
  icon?: ReactNode;
}

export interface PillTabsProps<T extends string> {
  label: string;
  tabs: PillTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** A scrollable row of stages or views, each with its count (the selected one is outlined). */
export function PillTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  className,
}: PillTabsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex gap-2 overflow-x-auto pb-1', className)}
    >
      {tabs.map(tab => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex min-w-40 shrink-0 items-center gap-2.5 rounded-md border bg-surface px-3 py-2 text-left transition-colors',
              active ? 'border-flame ring-2 ring-flame/15' : 'border-line hover:border-line-strong'
            )}
          >
            {tab.icon ? (
              <span
                className="flex size-6 items-center justify-center text-flame [&_svg]:size-4"
                aria-hidden
              >
                {tab.icon}
              </span>
            ) : null}
            <span className="grid min-w-0">
              <span className="truncate text-body-sm font-semibold">{tab.label}</span>
              {tab.count !== undefined ? (
                <span className="truncate text-chip font-normal text-ink-muted">{tab.count}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
