import type {ReactNode} from 'react';

import {cn} from '../utils/cn';

export interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Controls on the right of the header: segmented switches, filters, links. */
  actions?: ReactNode;
  /** Body without padding, for tables and lists that run edge to edge. */
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  id?: string;
}

/** A section surface: header row (title left, controls right) over its content. */
export function Panel({
  title,
  description,
  actions,
  flush,
  className,
  bodyClassName,
  children,
  id,
}: PanelProps) {
  return (
    <section
      aria-labelledby={id && title ? `${id}-title` : undefined}
      className={cn('min-w-0 rounded-lg border border-line bg-surface', className)}
    >
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="grid min-w-0 gap-0.5">
            {title ? (
              <h2 id={id ? `${id}-title` : undefined} className="text-body font-semibold">
                {title}
              </h2>
            ) : null}
            {description ? <p className="text-body-sm text-ink-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn(!flush && 'p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
