import {useState} from 'react';

import {Boxes, ChevronLeft, ChevronRight, PackageCheck, Tag} from 'lucide-react';
import {Link} from 'react-router';

import {useProductActivity} from '@grov/hooks';
import type {ActivityItem} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {Button, cn, Panel, Skeleton} from '@grov/ui';

import {activityTitle, changeLabel, changeValue} from '../../../lib/catalogue/activity-copy';
import {formatMoment} from '../../../lib/format/dates';
import {productPath} from '../../../paths';

type Kind = 'all' | ActivityItem['kind'];

const FILTERS: {value: Kind; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'PRODUCT', label: 'Product'},
  {value: 'PRICE', label: 'Prices'},
  {value: 'STOCK', label: 'Stock'},
];

const KIND_ICON = {PRODUCT: PackageCheck, PRICE: Tag, STOCK: Boxes} as const;
const KIND_CHIP = {
  PRODUCT: 'bg-surface-sunken text-ink-muted',
  PRICE: 'bg-flame-tint text-flame-strong',
  STOCK: 'bg-sky-tint text-sky-strong',
} as const;

export interface ActivityFeedProps {
  /** One product's events; leave out for the whole catalogue. */
  productId?: string;
  /** Events per page; older pages load as the reader moves on. */
  pageSize?: number;
  className?: string;
}

/** A compact, filterable feed of who changed what, newest first. Sits in a side rail. */
export function ActivityFeed({productId, pageSize = 5, className}: ActivityFeedProps) {
  const [kind, setKind] = useState<Kind>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const activity = useProductActivity({
    productId,
    kind: kind === 'all' ? undefined : kind,
    limit: pageSize,
  });
  const pages = activity.data?.pages ?? [];
  const items = pages[pageIndex]?.data ?? [];
  const hasNewer = pageIndex > 0;
  const hasOlder = pageIndex < pages.length - 1 || Boolean(activity.hasNextPage);
  const older = async () => {
    if (pageIndex >= pages.length - 1) await activity.fetchNextPage();
    setPageIndex(index => index + 1);
  };
  const showProduct = !productId;

  return (
    <Panel title="Activity feed" flush className={className}>
      <div
        role="group"
        aria-label="Show"
        className="flex overflow-x-auto border-b border-line px-2"
      >
        {FILTERS.map(filter => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={kind === filter.value}
            onClick={() => {
              setKind(filter.value);
              setPageIndex(0);
            }}
            className={cn(
              '-mb-px h-10 shrink-0 border-b-2 px-3 text-body-sm font-semibold transition-colors',
              kind === filter.value
                ? 'border-flame text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {activity.isPending ? (
        <div className="grid gap-3 p-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : activity.isError ? (
        <div className="grid gap-2 p-4 text-body-sm text-ink-muted">
          {errorMessage(activity.error)}
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => void activity.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="p-4 text-body-sm text-ink-muted">
          Nothing recorded yet. Edits, prices and stock movements appear here.
        </p>
      ) : (
        <div>
          <ol className="divide-y divide-line">
            {items.map(item => {
              const Icon = KIND_ICON[item.kind];
              const title = activityTitle(item);
              return (
                <li key={item.id} className="flex gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-pill [&_svg]:size-4',
                      KIND_CHIP[item.kind]
                    )}
                  >
                    <Icon />
                  </span>
                  <div className="grid min-w-0 flex-1 gap-0.5 text-body-sm">
                    <p className="font-semibold">{title}</p>
                    <p className="text-ink-muted">
                      {item.actorName ?? 'System'} ·{' '}
                      <time dateTime={item.at} className="tabular">
                        {formatMoment(item.at)}
                      </time>
                      {showProduct ? (
                        <>
                          {' · '}
                          <Link
                            to={productPath(item.productId)}
                            className="text-ink underline-offset-4 hover:underline"
                          >
                            {item.productName}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    {item.changes.slice(0, 2).map(change => (
                      <p key={change.field} className="truncate text-ink-muted">
                        {changeLabel(change.field)}:{' '}
                        {change.field === 'categoryId' ? null : (
                          <span className="line-through decoration-line-strong">
                            {changeValue(change.field, change.before)}
                          </span>
                        )}{' '}
                        →{' '}
                        <span className="text-ink">{changeValue(change.field, change.after)}</span>
                      </p>
                    ))}
                    {item.changes.length > 2 ? (
                      <p className="text-ink-muted">and {item.changes.length - 2} more changes</p>
                    ) : null}
                    {item.details.note ? (
                      <p className="text-ink-muted">“{String(item.details.note)}”</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
          {hasNewer || hasOlder ? (
            <nav
              aria-label="Activity pages"
              className="flex items-center justify-between gap-2 border-t border-line p-3"
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasNewer}
                onClick={() => setPageIndex(index => index - 1)}
              >
                <ChevronLeft aria-hidden /> Newer
              </Button>
              <span className="text-body-sm text-ink-muted tabular">Page {pageIndex + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasOlder}
                loading={activity.isFetchingNextPage}
                onClick={() => void older()}
              >
                Older <ChevronRight aria-hidden />
              </Button>
            </nav>
          ) : null}
        </div>
      )}
    </Panel>
  );
}
