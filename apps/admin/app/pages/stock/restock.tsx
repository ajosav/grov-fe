import {useMemo, useState} from 'react';

import {CalendarClock, Download, PackagePlus, SlidersHorizontal} from 'lucide-react';
import {Link} from 'react-router';

import {useFileUrls, useStockOverview, useStockSummary} from '@grov/hooks';
import {appConfig, PERMISSIONS, type StockOverviewRow} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Button,
  EmptyState,
  formatNaira,
  Segmented,
  Skeleton,
  StatRail,
  toast,
} from '@grov/ui';

import {ProductThumb} from '../../components/catalogue/product-thumb';
import {PageFrame, PageRail} from '../../components/common/page-frame';
import {CoverMeter, RestockBadge} from '../../components/stock/restock-badge';
import {StockDialogs} from '../../components/stock/stock-dialogs';
import type {StockAction} from '../../components/stock/stock-row-actions';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {downloadText, toCsv} from '../../lib/catalogue/csv';
import {formatCount, formatQty} from '../../lib/catalogue/insight-format';
import {
  formatPace,
  packPriceText,
  reorderText,
  signalCopy,
  suggestionMath,
} from '../../lib/stock/stock-format';
import {paths, productPath} from '../../paths';
import type {Route} from './+types/restock';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
  fullBleed: true,
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Restock planner · ${appConfig.brandName} admin`},
];

type Scope = 'now' | 'all';

function exportList(rows: StockOverviewRow[]) {
  const csv = toCsv([
    [
      'SKU',
      'Product',
      'Status',
      'Available',
      'Unit',
      'Days of cover',
      'Buy',
      'Order within (days)',
      'Cost at base price (NGN)',
    ],
    ...rows.map(row => [
      row.sku,
      row.displayName,
      row.status,
      row.availableQty,
      row.baseUnit,
      row.coverDays,
      row.suggestedQty,
      row.reorderInDays,
      row.restockCost.kobo / 100,
    ]),
  ]);
  downloadText(csv, `shopping-list-${new Date().toISOString().slice(0, 10)}.csv`);
}

function PlanCard({
  row,
  cover,
  canWrite,
  onSettings,
}: {
  row: StockOverviewRow;
  cover: string | undefined;
  canWrite: boolean;
  onSettings: () => void;
}) {
  const math = suggestionMath(row);
  const when = reorderText(row);
  const price = packPriceText(row);
  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-surface p-4 @container">
      <div className="flex items-start gap-3">
        <ProductThumb url={cover} name={row.displayName} className="size-12" />
        <div className="min-w-0 flex-1">
          <Link
            to={productPath(row.productId, 'inventory')}
            className="block truncate font-semibold underline-offset-4 hover:underline"
          >
            {row.displayName}
          </Link>
          <div className="truncate text-body-sm text-ink-muted">
            {row.sku} · {row.categoryName}
          </div>
        </div>
        <RestockBadge status={row.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid min-w-0 content-start gap-1">
          <span className="text-body-sm text-ink-muted">Available</span>
          <span className="font-semibold tabular">{formatQty(row.availableQty, row.baseUnit)}</span>
          <span className="text-body-sm text-ink-muted tabular">
            {formatPace(row.perDay, row.baseUnit)}
          </span>
        </div>
        <CoverMeter row={row} />
      </div>

      <div className="grid gap-1 rounded-md bg-surface-sunken p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="text-body-sm text-ink-muted">{when ?? 'Suggested buy'}</span>
          <span className="text-title-sm font-semibold tabular">
            {row.suggestedQty > 0 ? formatQty(row.suggestedQty, row.baseUnit) : 'Nothing to buy'}
          </span>
        </div>
        {row.suggestedQty > 0 && row.restockCost.kobo > 0 ? (
          <span className="text-body-sm text-ink-muted tabular">
            About {formatNaira(row.restockCost.kobo)} at base prices{price ? ` (${price})` : ''}
          </span>
        ) : null}
      </div>

      {row.signals.length > 0 ? (
        <ul className="grid gap-1 text-body-sm text-ink-muted">
          {row.signals.map(signal => (
            <li key={signal}>{signalCopy(signal, row)}</li>
          ))}
        </ul>
      ) : null}
      {math ? (
        <details className="text-body-sm text-ink-muted">
          <summary className="cursor-pointer select-none underline-offset-4 hover:underline">
            How this is worked out
          </summary>
          <p className="mt-1 tabular">{math}</p>
        </details>
      ) : null}

      {canWrite ? (
        <div className="mt-auto flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link to={`${paths.stockReceipts}?add=${row.productId}`}>
              <PackagePlus aria-hidden /> Receive
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={onSettings}>
            <SlidersHorizontal aria-hidden /> Settings
          </Button>
        </div>
      ) : null}
    </li>
  );
}

export default function StockRestock() {
  const [scope, setScope] = useState<Scope>('now');
  const [action, setAction] = useState<StockAction | null>(null);
  const {can} = usePermissions();
  const canWrite = can(PERMISSIONS.STOCK.WRITE);
  const overview = useStockOverview({view: 'needs_restock', sort: 'urgency', pageSize: 100});
  const summary = useStockSummary();
  const all = useMemo(() => overview.data?.items ?? [], [overview.data]);
  const rows = scope === 'now' ? all.filter(row => row.status !== 'ORDER_SOON') : all;
  const covers = useFileUrls(rows.flatMap(row => (row.coverImagePath ? [row.coverImagePath] : [])));
  const cost = rows.reduce((sum, row) => sum + row.restockCost.kobo, 0);
  const s = summary.data;

  const rail = (
    <StatRail
      loading={summary.isPending}
      sections={[
        {
          key: 'buy',
          title: 'To buy',
          visual: (
            <div className="grid gap-1">
              <span className="text-body-sm text-ink-muted">Cost to restock</span>
              {summary.isPending ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <span className="text-title-lg tabular">
                  {s ? formatNaira(s.restockCost.kobo) : '—'}
                </span>
              )}
              <span className="text-chip text-ink-muted">At base prices</span>
            </div>
          ),
          rows: [
            {
              key: 'now',
              label: 'Order now',
              tone: 'flame',
              info: 'Out of stock, or will run out before a delivery could arrive.',
              value: s ? formatCount(s.orderNow + s.out) : '—',
            },
            {
              key: 'soon',
              label: 'Order soon',
              tone: 'palm',
              value: s ? formatCount(s.orderSoon) : '—',
            },
          ],
        },
        {
          key: 'defaults',
          cards: [
            {
              title: 'Planning defaults',
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
                  value: s ? `${s.coverTargetDefaultDays} days` : '—',
                },
              ],
            },
          ],
        },
      ]}
    />
  );

  return (
    <PageFrame
      header={
        <PageHeader
          title="Restock planner"
          description="What to buy and when, from how fast each product sells, how long delivery takes, and where its price is heading."
          actions={
            <Button
              variant="outline"
              size="sm"
              disabled={rows.length === 0}
              onClick={() => {
                exportList(rows);
                toast.success(`Exported ${rows.length} products`);
              }}
            >
              <Download aria-hidden /> Shopping list
            </Button>
          }
        />
      }
    >
      <PageRail>{rail}</PageRail>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Scope>
          label="Show"
          value={scope}
          onChange={setScope}
          options={[
            {value: 'now', label: 'Order now'},
            {value: 'all', label: 'Now and soon'},
          ]}
        />
        {rows.length > 0 ? (
          <p className="text-body-sm text-ink-muted tabular">
            {rows.length} {rows.length === 1 ? 'product' : 'products'} · about {formatNaira(cost)}
          </p>
        ) : null}
      </div>

      {overview.isPending ? (
        <div className="grid gap-4 @2xl:grid-cols-2 @6xl:grid-cols-3">
          {Array.from({length: 6}, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : overview.isError ? (
        <Alert tone="danger" title="Couldn’t load the plan">
          <div className="flex flex-wrap items-center gap-3">
            {errorMessage(overview.error)}
            <Button variant="outline" size="sm" onClick={() => void overview.refetch()}>
              Try again
            </Button>
          </div>
        </Alert>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CalendarClock />}
          title="Nothing to buy right now"
          description="Every product has enough cover for its delivery time. Check back as sales move."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @6xl:grid-cols-3">
          {rows.map(row => (
            <PlanCard
              key={row.productId}
              row={row}
              canWrite={canWrite}
              cover={row.coverImagePath ? covers.data?.get(row.coverImagePath) : undefined}
              onSettings={() => setAction({kind: 'settings', row})}
            />
          ))}
        </ul>
      )}
      {all.length >= 100 ? (
        <p className="mt-3 text-body-sm text-ink-muted">Showing the 100 most urgent products.</p>
      ) : null}
      <Can permission={PERMISSIONS.STOCK.WRITE}>
        <StockDialogs action={action} summary={s} onClose={() => setAction(null)} />
      </Can>
    </PageFrame>
  );
}
