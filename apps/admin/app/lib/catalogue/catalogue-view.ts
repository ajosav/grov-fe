import type {CatalogueParams, CatalogueSort, CatalogueView} from '@grov/api';
import {CATALOGUE_SORTS, CATALOGUE_VIEWS} from '@grov/api';
import type {StockState} from '@grov/models';

import {periodParams, type PeriodValue, readPeriod, writePeriod} from './insight-format';

export type CatalogueLayout = 'list' | 'detailed' | 'lens';
export const PAGE_SIZES = [10, 25, 50] as const;

export interface CatalogueState {
  q: string;
  view?: CatalogueView;
  categoryId?: string;
  status?: CatalogueParams['status'];
  availability?: StockState;
  performance?: CatalogueParams['performance'];
  profitability?: CatalogueParams['profitability'];
  storeId?: string;
  period: PeriodValue;
  sort: CatalogueSort;
  dir: 'asc' | 'desc';
  page: number;
  pageSize: number;
  layout: CatalogueLayout;
}

const one = <T extends string>(value: string | null, options: readonly T[]): T | undefined =>
  options.includes(value as T) ? (value as T) : undefined;

/** Everything the catalogue shows lives in the URL, so a view can be bookmarked or shared. */
export function readCatalogue(params: URLSearchParams): CatalogueState {
  const pageSize = Number(params.get('size'));
  return {
    q: params.get('q') ?? '',
    view: one(params.get('view'), CATALOGUE_VIEWS),
    categoryId: params.get('categoryId') ?? undefined,
    status: one(params.get('status'), ['published', 'draft', 'inactive'] as const),
    availability: one(params.get('availability'), ['IN_STOCK', 'LOW', 'OUT', 'UNTRACKED'] as const),
    performance: one(params.get('performance'), ['rising', 'declining', 'no_sales'] as const),
    profitability: one(params.get('profitability'), ['thin', 'healthy', 'unknown'] as const),
    storeId: params.get('storeId') ?? undefined,
    period: readPeriod(params),
    sort: one(params.get('sort'), CATALOGUE_SORTS) ?? 'updated',
    dir: params.get('dir') === 'asc' ? 'asc' : 'desc',
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? pageSize : 25,
    layout: one(params.get('layout'), ['list', 'detailed', 'lens'] as const) ?? 'list',
  };
}

export function writeCatalogue(
  previous: URLSearchParams,
  patch: Partial<CatalogueState>
): URLSearchParams {
  const next = new URLSearchParams(previous);
  const set = (key: string, value: string | number | undefined, fallback?: string | number) => {
    if (value === undefined || value === '' || value === fallback) next.delete(key);
    else next.set(key, String(value));
  };
  for (const [key, value] of Object.entries(patch) as [keyof CatalogueState, unknown][]) {
    if (key === 'period') writePeriod(next, value as PeriodValue);
    else if (key === 'pageSize') set('size', value as number, 25);
    else if (key === 'sort') set('sort', value as string, 'updated');
    else if (key === 'dir') set('dir', value as string, 'desc');
    else if (key === 'page') set('page', value as number, 1);
    else if (key === 'layout') set('layout', value as string, 'list');
    else set(key, value as string | undefined);
  }
  // Any change other than paging starts again at page 1.
  if (!('page' in patch)) next.delete('page');
  return next;
}

export function catalogueParams(state: CatalogueState): CatalogueParams {
  return {
    q: state.q.trim() || undefined,
    view: state.view,
    categoryId: state.categoryId,
    status: state.status,
    availability: state.availability,
    performance: state.performance,
    profitability: state.profitability,
    storeId: state.storeId,
    ...periodParams(state.period),
    sort: state.sort,
    dir: state.dir,
    page: state.page,
    pageSize: state.pageSize,
  };
}

export const SAVED_VIEWS: {value: CatalogueView | undefined; label: string}[] = [
  {value: undefined, label: 'All products'},
  {value: 'best_performing', label: 'Best performing'},
  {value: 'declining', label: 'Declining'},
  {value: 'low_stock', label: 'Low stock'},
  {value: 'out_of_stock', label: 'Out of stock'},
  {value: 'high_revenue', label: 'High revenue'},
  {value: 'low_conversion', label: 'Low conversion'},
];

export const COLUMNS = [
  {key: 'category', label: 'Category'},
  {key: 'price', label: 'Price'},
  {key: 'stock', label: 'Available stock'},
  {key: 'sold', label: 'Sold'},
  {key: 'viewers', label: 'Viewers'},
  {key: 'conversion', label: 'Conversion'},
  {key: 'revenue', label: 'Revenue'},
  {key: 'margin', label: 'Margin'},
  {key: 'status', label: 'Status'},
  {key: 'updated', label: 'Last updated'},
] as const;
export type ColumnKey = (typeof COLUMNS)[number]['key'];
export const DEFAULT_HIDDEN: ColumnKey[] = ['margin'];
