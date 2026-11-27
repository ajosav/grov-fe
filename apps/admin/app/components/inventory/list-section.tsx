import type {ReactNode} from 'react';

import {errorMessage} from '@grov/shared';
import {Alert, Button, EmptyState, Skeleton} from '@grov/ui';

export interface ListQuery {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => Promise<unknown>;
}

export interface ListSectionProps {
  label: string;
  query: ListQuery;
  count: number;
  /** Filters and actions above the table. */
  toolbar?: ReactNode;
  empty: {icon: ReactNode; title: string; description: string; action?: ReactNode};
  children: ReactNode;
}

/** The frame every inventory list shares: toolbar, loading rows, error, empty state, load more. */
export function ListSection({label, query, count, toolbar, empty, children}: ListSectionProps) {
  return (
    <section
      aria-label={label}
      className="@container min-w-0 overflow-clip rounded-lg border border-line bg-surface"
    >
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">{toolbar}</div>
      ) : null}
      {query.isPending ? (
        <div className="grid gap-2 p-4">
          {Array.from({length: 6}, (_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : query.isError ? (
        <Alert tone="danger" title={`Couldn’t load ${label.toLowerCase()}`} className="m-4">
          <div className="flex flex-wrap items-center gap-3">
            {errorMessage(query.error)}
            <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : count === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            description={empty.description}
            action={empty.action}
          />
        </div>
      ) : (
        children
      )}
      {query.hasNextPage ? (
        <div className="flex justify-center border-t border-line p-3">
          <Button
            variant="outline"
            size="sm"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage?.()}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </section>
  );
}
