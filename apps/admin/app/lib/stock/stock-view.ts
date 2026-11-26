import type {StockSort, StockView} from '@grov/api';
import {STOCK_SORTS, STOCK_VIEWS} from '@grov/api';

export const STOCK_PAGE_SIZES = [10, 25, 50] as const;

/** Everything the stock list shows lives in the URL, so a view can be bookmarked or shared. */
export interface StockViewState {
  q: string;
  view: StockView;
  sort: StockSort;
  dir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const DEFAULT_STOCK_VIEW: StockViewState = {
  q: '',
  view: 'all',
  sort: 'urgency',
  dir: 'asc',
  page: 1,
  pageSize: 25,
};

const one = <T extends string>(value: string | null, options: readonly T[]): T | undefined =>
  options.includes(value as T) ? (value as T) : undefined;

export function readStockView(params: URLSearchParams): StockViewState {
  const size = Number(params.get('size'));
  const sort = one(params.get('sort'), STOCK_SORTS) ?? DEFAULT_STOCK_VIEW.sort;
  return {
    q: params.get('q') ?? '',
    view: one(params.get('view'), STOCK_VIEWS) ?? DEFAULT_STOCK_VIEW.view,
    sort,
    dir:
      params.get('dir') === 'desc'
        ? 'desc'
        : params.get('dir') === 'asc'
          ? 'asc'
          : defaultDir(sort),
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: (STOCK_PAGE_SIZES as readonly number[]).includes(size)
      ? size
      : DEFAULT_STOCK_VIEW.pageSize,
  };
}

/** Urgency and name read from the top; the numbers read largest first. */
export function defaultDir(sort: StockSort): 'asc' | 'desc' {
  return sort === 'urgency' || sort === 'name' || sort === 'cover' ? 'asc' : 'desc';
}

export function writeStockView(
  previous: URLSearchParams,
  patch: Partial<StockViewState>
): URLSearchParams {
  const next = new URLSearchParams(previous);
  const setOrClear = (key: string, value: string | number, fallback: string | number) => {
    if (value === '' || value === fallback) next.delete(key);
    else next.set(key, String(value));
  };
  if (patch.q !== undefined) setOrClear('q', patch.q.trim(), '');
  if (patch.view !== undefined) setOrClear('view', patch.view, DEFAULT_STOCK_VIEW.view);
  if (patch.pageSize !== undefined) {
    setOrClear('size', patch.pageSize, DEFAULT_STOCK_VIEW.pageSize);
  }
  if (patch.sort !== undefined || patch.dir !== undefined) {
    const sort = patch.sort ?? readStockView(next).sort;
    const dir = patch.dir ?? defaultDir(sort);
    setOrClear('sort', sort, DEFAULT_STOCK_VIEW.sort);
    setOrClear('dir', dir, defaultDir(sort));
  }
  // Anything but paging starts again from the first page.
  if (patch.page !== undefined) setOrClear('page', patch.page, 1);
  else next.delete('page');
  return next;
}

export const STOCK_VIEW_TABS: {value: StockView; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'needs_restock', label: 'Needs restock'},
  {value: 'out', label: 'Out of stock'},
  {value: 'low', label: 'Low'},
  {value: 'overstocked', label: 'Overstocked'},
  {value: 'no_sales', label: 'No sales'},
];
