import type {ReactNode} from 'react';

import {ArrowRight} from 'lucide-react';

import {Badge, Button, cn} from '@grov/ui';

export interface InsightCardProps {
  title: ReactNode;
  /** A small label next to the title: "Coming soon", "Rules-based". */
  tag?: string;
  /** Opens the large view of this card. */
  onViewAll?: () => void;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
}

/** One card of the home page: a title, an optional "View all", and its content. */
export function InsightCard({
  title,
  tag,
  onViewAll,
  viewAllLabel = 'View all',
  children,
  className,
}: InsightCardProps) {
  return (
    <section
      className={cn(
        'grid min-w-0 content-start gap-4 rounded-lg border border-line bg-surface p-5',
        className
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-body font-semibold">
          {title}
          {tag ? <Badge>{tag}</Badge> : null}
        </h2>
        {onViewAll ? (
          <Button variant="accent" size="sm" onClick={onViewAll}>
            {viewAllLabel} <ArrowRight aria-hidden />
          </Button>
        ) : null}
      </header>
      {children}
    </section>
  );
}
