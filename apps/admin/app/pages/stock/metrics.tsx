import {type ReactNode, useEffect, useMemo, useState} from 'react';

import {Link} from 'react-router';

import {useStockMovements, useStockOverview, useStockSummary} from '@grov/hooks';
import {appConfig, PERMISSIONS, type StockOverviewRow} from '@grov/models';
import {errorMessage, PageHeader} from '@grov/shared';
import {Alert, ColumnChart, formatNaira, Panel, Segmented, Skeleton} from '@grov/ui';

import {PageFrame, SectionTabs} from '../../components/common/page-frame';
import {RestockBadge} from '../../components/stock/restock-badge';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {formatCount, formatQty} from '../../lib/catalogue/insight-format';
import {MOVEMENT_KIND} from '../../lib/stock/stock-format';
import {paths, productPath} from '../../paths';
import type {Route} from './+types/metrics';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
  fullBleed: true,
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Stock metrics · ${appConfig.brandName} admin`},
];

type Range = '7' | '30';
/** Movements are read in pages of 100, up to this many, so the chart stays quick. */
const MOVEMENT_PAGES = 10;

const day = new Intl.DateTimeFormat('en-NG', {day: 'numeric', month: 'short'});
const dayKey = (date: Date) => date.toLocaleDateString('en-CA');

function MetricCard({
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="grid content-start gap-2 rounded-lg border border-line bg-surface p-4">
      <span className="text-body-sm text-ink-muted">{label}</span>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <span className="text-title-lg tabular">{value}</span>
      )}
      <span className="min-h-4 truncate text-chip text-ink-muted">{hint}</span>
    </div>
  );
}

/** Products as a short ranked list; `meta` is the figure on the right. */
function RankList({
  rows,
  loading,
  empty,
  meta,
}: {
  rows: StockOverviewRow[];
  loading: boolean;
  empty: string;
  meta: (row: StockOverviewRow) => ReactNode;
}) {
  if (loading) return <Skeleton className="h-48" />;
  if (rows.length === 0) return <p className="text-body-sm text-ink-muted">{empty}</p>;
  return (
    <ul className="-my-2 divide-y divide-line">
      {rows.map(row => (
        <li key={row.productId} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <Link
              to={productPath(row.productId, 'inventory')}
              className="block truncate text-body-sm font-semibold underline-offset-4 hover:underline"
            >
              {row.displayName}
            </Link>
            <div className="truncate text-chip text-ink-muted">
              {row.sku} · {formatQty(row.availableQty, row.baseUnit)} available
            </div>
          </div>
          <div className="shrink-0 text-right text-body-sm tabular">{meta(row)}</div>
        </li>
      ))}
    </ul>
  );
}

export default function StockMetrics() {
  const [range, setRange] = useState<Range>('30');
  const summary = useStockSummary();
  const s = summary.data;

  const urgent = useStockOverview({view: 'needs_restock', sort: 'urgency', pageSize: 6});
  const valuable = useStockOverview({sort: 'value', dir: 'desc', pageSize: 6});
  const overstocked = useStockOverview({
    view: 'overstocked',
    sort: 'value',
    dir: 'desc',
    pageSize: 6,
  });

  const from = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (Number(range) - 1));
    return start;
  }, [range]);
  const movements = useStockMovements({from: from.toISOString(), limit: 100});
  const {hasNextPage, isFetchingNextPage, fetchNextPage} = movements;
  const pageCount = movements.data?.pages.length ?? 0;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && pageCount < MOVEMENT_PAGES) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, pageCount]);
  const events = useMemo(
    () => movements.data?.pages.flatMap(page => page.data) ?? [],
    [movements.data]
  );
  const capped = Boolean(hasNextPage) && pageCount >= MOVEMENT_PAGES;
  const loadingMovements = movements.isPending || (Boolean(hasNextPage) && !capped);

  const perDay = useMemo(() => {
    const counts = new Map<string, number>();
    for (let i = 0; i < Number(range); i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      counts.set(dayKey(d), 0);
    }
    for (const event of events) {
      const key = dayKey(new Date(event.createdAt));
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts].map(([x, value]) => ({x, value}));
  }, [events, from, range]);

  const byKind = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) counts.set(event.kind, (counts.get(event.kind) ?? 0) + 1);
    return [...counts]
      .map(([kind, value]) => ({
        kind,
        value,
        label: MOVEMENT_KIND[kind as keyof typeof MOVEMENT_KIND]?.label ?? kind,
      }))
      .sort((a, b) => b.value - a.value);
  }, [events]);
  const topKind = byKind[0]?.value ?? 0;

  const statuses = s
    ? [
        {x: 'Out', value: s.out},
        {x: 'Order now', value: s.orderNow},
        {x: 'Order soon', value: s.orderSoon},
        {x: 'Covered', value: s.covered},
        {x: 'Overstocked', value: s.overstocked},
      ]
    : [];

  return (
    <PageFrame
      header={
        <PageHeader
          title="Stock metrics"
          description="How the stock is doing: what it is worth, what needs buying, and how it has been moving."
          actions={
            <Segmented<Range>
              label="Period"
              value={range}
              onChange={setRange}
              options={[
                {value: '7', label: '7 days'},
                {value: '30', label: '30 days'},
              ]}
            />
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
      <div className="grid gap-4">
        {summary.isError ? (
          <Alert tone="danger" title="Couldn’t load the figures">
            {errorMessage(summary.error)}
          </Alert>
        ) : null}

        <div className="grid grid-cols-2 gap-4 @3xl:grid-cols-3 @6xl:grid-cols-5">
          <MetricCard
            label="Stock value"
            loading={summary.isPending}
            value={s ? formatNaira(s.costValue.kobo) : '—'}
            hint={s ? `${formatNaira(s.retailValue.kobo)} at shopper prices` : undefined}
          />
          <MetricCard
            label="Products counted"
            loading={summary.isPending}
            value={formatCount(s?.tracked)}
            hint={s ? `${formatCount(s.noSales)} not selling` : undefined}
          />
          <MetricCard
            label="Needs restock"
            loading={summary.isPending}
            value={formatCount(s?.needsRestock)}
            hint={s ? `${s.orderNow} order now · ${s.orderSoon} soon` : undefined}
          />
          <MetricCard
            label="To buy now"
            loading={summary.isPending}
            value={s ? formatNaira(s.restockCost.kobo) : '—'}
            hint="At base prices"
          />
          <MetricCard
            label="Written off (30 days)"
            loading={summary.isPending}
            value={s ? formatNaira(s.writeOffValue30d.kobo) : '—'}
            hint={s ? `${formatCount(s.receipts7d)} receipts this week` : undefined}
          />
        </div>

        <div className="grid gap-4 @4xl:grid-cols-2">
          <Panel title="Products by restock status" description="Every product the store counts.">
            {summary.isPending ? (
              <Skeleton className="h-56" />
            ) : (
              <ColumnChart
                points={statuses}
                label="Products"
                formatX={x => x}
                formatValue={formatCount}
              />
            )}
          </Panel>

          <Panel
            title="Stock movements"
            description={`Stock changes per day over the last ${range} days.`}
          >
            {movements.isError ? (
              <p className="text-body-sm text-ink-muted">{errorMessage(movements.error)}</p>
            ) : loadingMovements ? (
              <Skeleton className="h-56" />
            ) : (
              <>
                <ColumnChart
                  points={perDay}
                  label="Movements"
                  formatX={x => day.format(new Date(`${x}T00:00:00`))}
                  formatValue={formatCount}
                />
                {capped ? (
                  <p className="mt-2 text-chip text-ink-muted">
                    Counted from the latest {formatCount(events.length)} movements.
                  </p>
                ) : null}
              </>
            )}
          </Panel>

          <Panel title="Restock priority" description="Most urgent first.">
            <RankList
              rows={urgent.data?.items ?? []}
              loading={urgent.isPending}
              empty="Nothing needs restocking right now."
              meta={row => (
                <div className="grid justify-items-end gap-1">
                  <RestockBadge status={row.status} />
                  <span className="text-chip text-ink-muted">
                    Buy {formatQty(row.suggestedQty, row.baseUnit)}
                  </span>
                </div>
              )}
            />
          </Panel>

          <Panel title="Movements by type" description={`The last ${range} days.`}>
            {loadingMovements ? (
              <Skeleton className="h-48" />
            ) : byKind.length === 0 ? (
              <p className="text-body-sm text-ink-muted">No movements in this period.</p>
            ) : (
              <ul className="grid gap-3">
                {byKind.map(row => (
                  <li key={row.kind} className="grid gap-1">
                    <div className="flex items-baseline justify-between gap-3 text-body-sm">
                      <span>{row.label}</span>
                      <span className="font-semibold tabular">{formatCount(row.value)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-pill bg-surface-sunken">
                      <div
                        className="h-full rounded-pill bg-flame"
                        style={{width: `${(row.value / topKind) * 100}%`}}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Most stock value" description="Where the money in stock sits, at cost.">
            <RankList
              rows={valuable.data?.items ?? []}
              loading={valuable.isPending}
              empty="No stock is counted yet."
              meta={row => formatNaira(row.costValue.kobo)}
            />
          </Panel>

          <Panel title="Overstocked" description="Money tied up in more than is needed.">
            <RankList
              rows={overstocked.data?.items ?? []}
              loading={overstocked.isPending}
              empty="Nothing is overstocked."
              meta={row => formatNaira(row.costValue.kobo)}
            />
          </Panel>
        </div>
      </div>
    </PageFrame>
  );
}
