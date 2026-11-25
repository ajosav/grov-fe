import {useEffect, useRef} from 'react';

import {ChevronLeft, ChevronRight} from 'lucide-react';

import {cn} from '../utils/cn';
import {Button} from './button';
import {Spinner} from './spinner';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
  className?: string;
}

function pages(page: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({length: count}, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1].filter(p => p >= 1 && p <= count));
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.flatMap((p, i) =>
    i > 0 && p - (sorted[i - 1] ?? p) > 1 ? ['gap' as const, p] : [p]
  );
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  className,
}: PaginationProps) {
  if (pageCount <= 1 && total === undefined) return null;
  const from = total !== undefined && pageSize ? (page - 1) * pageSize + 1 : null;
  const to =
    from !== null && total !== undefined && pageSize ? Math.min(page * pageSize, total) : null;
  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
    >
      {from !== null && total ? (
        <p className="text-body-sm text-ink-muted tabular">
          {from}–{to} of {total.toLocaleString('en-NG')}
        </p>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        {pages(page, pageCount).map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} aria-hidden className="px-1 text-ink-muted">
              …
            </span>
          ) : (
            <Button
              key={p}
              size="icon-sm"
              variant={p === page ? 'night' : 'ghost'}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              onClick={() => onPageChange(p)}
              className="tabular"
            >
              {p}
            </Button>
          )
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}

export interface LoadMoreProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  auto?: boolean;
  label?: string;
  className?: string;
}

export function LoadMore({
  hasMore,
  loading,
  onLoadMore,
  auto,
  label = 'Show more',
  className,
}: LoadMoreProps) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({hasMore, loading, onLoadMore});
  latest.current = {hasMore, loading, onLoadMore};

  useEffect(() => {
    const node = ref.current;
    if (!auto || !node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      entries => {
        const {hasMore: more, loading: busy, onLoadMore: load} = latest.current;
        if (entries.some(e => e.isIntersecting) && more && !busy) load();
      },
      {rootMargin: '200px'}
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [auto]);

  if (!hasMore) return null;
  return (
    <div ref={ref} className={cn('flex justify-center py-4', className)}>
      {loading ? (
        <Spinner label="Loading more" />
      ) : (
        <Button variant="secondary" onClick={onLoadMore}>
          {label}
        </Button>
      )}
    </div>
  );
}
