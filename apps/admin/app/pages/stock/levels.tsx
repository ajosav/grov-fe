import {useCallback, useEffect, useMemo, useState} from 'react';

import {ArrowRight, Boxes, CalendarClock, PackagePlus} from 'lucide-react';
import {Link, useSearchParams} from 'react-router';

import {useDebounce, useFileUrls, useStockOverview, useStockSummary} from '@grov/hooks';
import {appConfig, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  formatNaira,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatRail,
} from '@grov/ui';

import {PageFrame, PageRail, SectionTabs} from '../../components/common/page-frame';
import {StockDialogs} from '../../components/stock/stock-dialogs';
import {StockFilterBar} from '../../components/stock/stock-filter-bar';
import type {StockAction} from '../../components/stock/stock-row-actions';
import {StockTable} from '../../components/stock/stock-table';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {formatCount} from '../../lib/catalogue/insight-format';
import {
  readStockView,
  STOCK_PAGE_SIZES,
  type StockViewState,
  writeStockView,
} from '../../lib/stock/stock-view';
import {paths} from '../../paths';
import type {Route} from './+types/levels';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
  fullBleed: true,
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Stock levels · ${appConfig.brandName} admin`},
];

export default function StockLevels() {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => readStockView(params), [params]);
  const {can} = usePermissions();
  const canWrite = can(PERMISSIONS.STOCK.WRITE);
  const [action, setAction] = useState<StockAction | null>(null);

  const update = useCallback(
    (patch: Partial<StockViewState>) =>
      setParams(previous => writeStockView(previous, patch), {replace: true}),
    [setParams]
  );

  // Typing updates the box at once and the URL (and so the request) after a pause.
  const [text, setText] = useState(state.q);
  const q = useDebounce(text.trim(), 300);
  useEffect(() => {
    if (q !== state.q.trim()) update({q});
  }, [q, state.q, update]);

  const overview = useStockOverview({
    ...(state.q ? {q: state.q} : {}),
    view: state.view,
    sort: state.sort,
    dir: state.dir,
    page: state.page,
    pageSize: state.pageSize,
  });
  const summary = useStockSummary();
  const rows = useMemo(() => overview.data?.items ?? [], [overview.data]);
  const covers = useFileUrls(rows.flatMap(row => (row.coverImagePath ? [row.coverImagePath] : [])));
  const coverFor = (path: string | null) => (path ? covers.data?.get(path) : undefined);
  const total = overview.data?.total ?? 0;
  const s = summary.data;
  const toggleView = (view: StockViewState['view']) =>
    update({view: state.view === view ? 'all' : view});

  const rail = (
    <StatRail
      loading={summary.isPending}
      sections={[
        {
          key: 'health',
          title: 'Stock health',
          meta: s ? `${formatCount(s.tracked)} products` : undefined,
          rows: [
            {
              key: 'needs',
              label: 'Needs restock',
              tone: 'flame',
              value: s ? formatCount(s.needsRestock) : '—',
              hint: s ? `${s.orderNow} order now · ${s.orderSoon} soon` : undefined,
              selected: state.view === 'needs_restock',
              onSelect: () => toggleView('needs_restock'),
            },
            {
              key: 'out',
              label: 'Out of stock',
              tone: 'flame',
              value: s ? formatCount(s.out) : '—',
              selected: state.view === 'out',
              onSelect: () => toggleView('out'),
            },
            {
              key: 'low',
              label: 'Low stock',
              tone: 'palm',
              info: 'At or under the low level set for the product.',
              value: s ? formatCount(s.low) : '—',
              selected: state.view === 'low',
              onSelect: () => toggleView('low'),
            },
            {
              key: 'covered',
              label: 'Covered',
              tone: 'leaf',
              value: s ? formatCount(s.covered) : '—',
              selected: state.view === 'covered',
              onSelect: () => toggleView('covered'),
            },
            {
              key: 'over',
              label: 'Overstocked',
              tone: 'sky',
              value: s ? formatCount(s.overstocked) : '—',
              selected: state.view === 'overstocked',
              onSelect: () => toggleView('overstocked'),
            },
            {
              key: 'nosales',
              label: 'No sales',
              tone: 'neutral',
              info: 'In stock, but nothing sold in the last 30 days.',
              value: s ? formatCount(s.noSales) : '—',
              selected: state.view === 'no_sales',
              onSelect: () => toggleView('no_sales'),
            },
          ],
        },
        {
          key: 'value',
          title: 'Stock value',
          visual: (
            <div className="grid gap-1">
              <span className="text-body-sm text-ink-muted">At cost</span>
              {summary.isPending ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <span className="text-title-lg tabular">
                  {s ? formatNaira(s.costValue.kobo) : '—'}
                </span>
              )}
              <span className="text-chip text-ink-muted tabular">
                {s ? `${formatNaira(s.retailValue.kobo)} at shopper prices` : ' '}
              </span>
            </div>
          ),
          cards: [
            {
              title: 'Buying and losses',
              action: (
                <Link
                  to={paths.stockMetrics}
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  All metrics <ArrowRight aria-hidden />
                </Link>
              ),
              rows: [
                {
                  key: 'buy',
                  label: 'To buy now',
                  info: 'What it costs to bring every product that needs restocking up to its target cover.',
                  value: s ? formatNaira(s.restockCost.kobo) : '—',
                },
                {
                  key: 'writeoff',
                  label: 'Written off (30 days)',
                  value: s ? formatNaira(s.writeOffValue30d.kobo) : '—',
                },
                {
                  key: 'receipts',
                  label: 'Receipts this week',
                  value: s ? formatCount(s.receipts7d) : '—',
                },
              ],
            },
          ],
          note: 'Cost uses base prices as a stand-in until purchase costs are recorded.',
        },
        {
          key: 'planning',
          cards: [
            {
              title: 'Restock defaults',
              action: (
                <Link
                  to={paths.stockRestock}
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  Planner <ArrowRight aria-hidden />
                </Link>
              ),
              rows: [
                {
                  key: 'lead',
                  label: 'Delivery lead time',
                  info: 'How long a delivery takes, unless a product sets its own.',
                  value: s ? `${s.leadTimeDefaultDays} days` : '—',
                },
                {
                  key: 'cover',
                  label: 'Cover per delivery',
                  info: 'Days of sales each delivery should cover.',
                  value: s ? `${s.coverTargetDefaultDays} days` : '—',
                },
              ],
            },
          ],
          note: 'Pace is the 30-day average, or the last 7 days when demand is rising.',
        },
      ]}
    />
  );

  return (
    <PageFrame
      header={
        <PageHeader
          title="Stock levels"
          description="What is on the shelf, how long it will last at the current pace, and what to buy next."
          actions={
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={paths.stockRestock}>
                  <CalendarClock aria-hidden /> Restock planner
                </Link>
              </Button>
              <Can permission={PERMISSIONS.STOCK.WRITE}>
                <Button size="sm" asChild>
                  <Link to={paths.stockReceipts}>
                    <PackagePlus aria-hidden /> Receive stock
                  </Link>
                </Button>
              </Can>
            </>
          }
        />
      }
      tabs={
        <SectionTabs
          label="Stock levels"
          tabs={[
            {to: paths.stockLevels, label: 'Levels', end: true},
            {to: paths.stockMetrics, label: 'Metrics'},
          ]}
        />
      }
    >
      <PageRail>{rail}</PageRail>
      <section
        aria-labelledby="stock-list"
        className="@container min-w-0 overflow-clip rounded-lg border border-line bg-surface"
      >
        <header className="flex items-center gap-2 px-4 pt-4">
          <h2 id="stock-list" className="text-body font-semibold">
            Products
          </h2>
          <Badge>{overview.data ? formatCount(total) : '…'}</Badge>
        </header>
        <StockFilterBar text={text} onTextChange={setText} state={state} onChange={update} />
        {overview.isPending ? (
          <div className="grid gap-2 p-4">
            {Array.from({length: 6}, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : overview.isError ? (
          <Alert tone="danger" title="Couldn’t load stock" className="m-4">
            <div className="flex flex-wrap items-center gap-3">
              {errorMessage(overview.error)}
              <Button variant="outline" size="sm" onClick={() => void overview.refetch()}>
                Try again
              </Button>
            </div>
          </Alert>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Boxes />}
              title={state.q || state.view !== 'all' ? 'No products match' : 'No stock to show yet'}
              description={
                state.q || state.view !== 'all'
                  ? 'Try another view or search.'
                  : 'Products appear here once they are listed at this store.'
              }
              action={
                state.q || state.view !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setText('');
                      setParams({}, {replace: true});
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className={overview.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
            <StockTable
              rows={rows}
              coverFor={coverFor}
              sort={state.sort}
              dir={state.dir}
              onSort={(sort, dir) => update({sort, dir})}
              canWrite={canWrite}
              onAction={setAction}
            />
          </div>
        )}

        {total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line px-4 py-3">
            <Pagination
              page={state.page}
              pageCount={Math.ceil(total / state.pageSize)}
              total={total}
              pageSize={state.pageSize}
              onPageChange={page => update({page})}
              className="min-w-0 flex-1 basis-80"
            />
            <Select
              value={String(state.pageSize)}
              onValueChange={v => update({pageSize: Number(v)})}
            >
              <SelectTrigger
                aria-label="Products per page"
                className="h-9 w-40 shrink-0 whitespace-nowrap"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STOCK_PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </section>
      <StockDialogs action={action} summary={s} onClose={() => setAction(null)} />
    </PageFrame>
  );
}
