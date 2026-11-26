import {useEffect, useState} from 'react';

import {Layers, Search} from 'lucide-react';
import {Link, useSearchParams} from 'react-router';

import {
  useBatchCorrections,
  useDebounce,
  useInventoryBatch,
  useInventoryBatches,
} from '@grov/hooks';
import {appConfig, type InventoryBatch, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  formatNaira,
  Input,
  Segmented,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {
  type BalanceProduct,
  StatusMoveForm,
  WriteOffForm,
} from '../../components/inventory/balance-forms';
import {BatchCorrectForm} from '../../components/inventory/batch-correct-form';
import {ListSection} from '../../components/inventory/list-section';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {
  BALANCE_STATUS,
  costText,
  dayText,
  momentText,
  qtyText,
} from '../../lib/inventory/inventory-format';
import {productPath} from '../../paths';
import type {Route} from './+types/batches';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Batches · ${appConfig.brandName} admin`}];

type Scope = 'stock' | 'all';

/** Expiry in days from today; negative when past. */
function daysToExpiry(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function ExpiryBadge({iso}: {iso: string | null}) {
  const days = daysToExpiry(iso);
  if (days === null) return <span className="text-ink-muted">—</span>;
  const tone = days < 0 ? 'flame' : days <= 3 ? 'palm' : 'neutral';
  const note =
    days < 0 ? 'expired' : days === 0 ? 'today' : `in ${days} ${days === 1 ? 'day' : 'days'}`;
  return (
    <Badge tone={tone} title={dayText(iso)}>
      {dayText(iso)} · {note}
    </Badge>
  );
}

type Dialogue =
  | {kind: 'detail'; batch: InventoryBatch}
  | {kind: 'write_off' | 'status_move' | 'correct'; batch: InventoryBatch}
  | null;

export default function StockBatches() {
  const [params, setParams] = useSearchParams();
  const scope: Scope = params.get('scope') === 'all' ? 'all' : 'stock';
  const productId = params.get('product') ?? undefined;
  const urlQ = params.get('q') ?? '';
  const [text, setText] = useState(urlQ);
  const q = useDebounce(text.trim(), 300);
  const [dialogue, setDialogue] = useState<Dialogue>(null);

  const setParam = (key: string, value: string | undefined) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      {replace: true}
    );
  useEffect(() => {
    if (q !== urlQ.trim()) setParam('q', q || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a settled search writes the URL
  }, [q]);

  const list = useInventoryBatches({
    ...(urlQ ? {q: urlQ} : {}),
    ...(productId ? {productId} : {}),
    ...(scope === 'stock' ? {withStock: true} : {}),
    limit: 50,
  });
  const rows = list.data?.pages.flatMap(page => page.data) ?? [];
  const product = (batch: InventoryBatch): BalanceProduct => ({
    productId: batch.productId,
    name: batch.productName,
    sku: batch.sku,
    baseUnit: batch.baseUnit,
  });

  return (
    <>
      <PageHeader
        title="Batches"
        description="Every lot that came in: where it was grown, when it was harvested, when it expires and what it cost."
      />
      <ListSection
        label="Batches"
        query={list}
        count={rows.length}
        toolbar={
          <>
            <div className="relative w-full sm:w-64">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              />
              <Input
                type="search"
                aria-label="Search batches"
                placeholder="Search batch, product or SKU"
                autoComplete="off"
                className="h-9 pl-9"
                value={text}
                onChange={event => setText(event.target.value)}
              />
            </div>
            <Segmented<Scope>
              size="sm"
              label="Show"
              value={scope}
              onChange={value => setParam('scope', value === 'stock' ? undefined : value)}
              options={[
                {value: 'stock', label: 'In stock'},
                {value: 'all', label: 'All batches'},
              ]}
            />
            {productId ? (
              <Button variant="outline" size="sm" onClick={() => setParam('product', undefined)}>
                Clear product filter
              </Button>
            ) : null}
          </>
        }
        empty={{
          icon: <Layers />,
          title: 'No batches',
          description:
            scope === 'stock'
              ? 'Nothing is on hand. Try All batches, or receive a delivery.'
              : 'Nothing matches. Batches appear when a goods received note is posted.',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden @3xl:table-cell">Source</TableHead>
              <TableHead className="hidden @4xl:table-cell">Expires</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="hidden text-right @3xl:table-cell">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(batch => (
              <TableRow
                key={batch.id}
                className="cursor-pointer"
                onClick={() => setDialogue({kind: 'detail', batch})}
              >
                <TableCell className="whitespace-nowrap font-semibold">
                  <button
                    type="button"
                    className="underline-offset-4 hover:underline focus-visible:underline"
                    onClick={event => {
                      event.stopPropagation();
                      setDialogue({kind: 'detail', batch});
                    }}
                  >
                    {batch.batchNumber}
                  </button>
                  <div className="text-body-sm font-normal text-ink-muted">
                    Received {dayText(batch.receivedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to={productPath(batch.productId, 'inventory')}
                    onClick={event => event.stopPropagation()}
                    className="block truncate font-semibold underline-offset-4 hover:underline"
                  >
                    {batch.productName}
                  </Link>
                  <div className="text-body-sm text-ink-muted">{batch.sku}</div>
                </TableCell>
                <TableCell className="hidden text-body-sm @3xl:table-cell">
                  {batch.farmName ?? batch.supplierName ?? batch.receivedFrom ?? '—'}
                  {batch.farmName && batch.supplierName ? (
                    <div className="text-ink-muted">{batch.supplierName}</div>
                  ) : null}
                </TableCell>
                <TableCell className="hidden @4xl:table-cell">
                  <ExpiryBadge iso={batch.expiresOn} />
                </TableCell>
                <TableCell className="text-right tabular">
                  <div className="font-semibold">{qtyText(batch.qtyRemaining, batch.baseUnit)}</div>
                  <div className="text-body-sm text-ink-muted">
                    of {qtyText(batch.qtyReceived, batch.baseUnit)}
                  </div>
                </TableCell>
                <TableCell className="hidden text-right tabular @3xl:table-cell">
                  {costText(batch.remainingCost)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListSection>

      <Dialog
        open={dialogue !== null}
        onOpenChange={open => (open ? undefined : setDialogue(null))}
      >
        <DialogContent layout="side" className="max-w-xl content-start">
          {dialogue?.kind === 'detail' ? (
            <BatchDetail
              batch={dialogue.batch}
              onAct={kind => setDialogue({kind, batch: dialogue.batch})}
            />
          ) : null}
          {dialogue?.kind === 'write_off' ? (
            <WriteOffForm
              product={product(dialogue.batch)}
              batchId={dialogue.batch.id}
              onDone={() => setDialogue(null)}
            />
          ) : null}
          {dialogue?.kind === 'correct' ? (
            <BatchCorrectForm
              batch={dialogue.batch}
              onDone={() => setDialogue({kind: 'detail', batch: dialogue.batch})}
            />
          ) : null}
          {dialogue?.kind === 'status_move' ? (
            <StatusMoveForm
              product={product(dialogue.batch)}
              batchId={dialogue.batch.id}
              onDone={() => setDialogue(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function BatchDetail({
  batch,
  onAct,
}: {
  batch: InventoryBatch;
  onAct: (kind: 'write_off' | 'status_move' | 'correct') => void;
}) {
  const detail = useInventoryBatch(batch.id);
  const info = detail.data?.batch ?? batch;
  const facts: [string, string][] = [
    ['Product', `${info.productName} · ${info.sku}`],
    ['Supplier', info.supplierName ?? info.receivedFrom ?? '—'],
    ['Farm', info.farmName ?? '—'],
    ['Received', dayText(info.receivedAt)],
    ['Harvested', dayText(info.harvestedOn)],
    ['Expires', dayText(info.expiresOn)],
    ['Total cost', costText(info.totalCost)],
    ['Cost of what remains', costText(info.remainingCost)],
  ];
  return (
    <>
      <DialogHeader>
        <DialogTitle>Batch {info.batchNumber}</DialogTitle>
        <DialogDescription>
          {qtyText(info.qtyRemaining, info.baseUnit)} left of{' '}
          {qtyText(info.qtyReceived, info.baseUnit)} received.
        </DialogDescription>
      </DialogHeader>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {facts.map(([term, value]) => (
          <div key={term} className="grid gap-0.5">
            <dt className="text-body-sm text-ink-muted">{term}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <h3 className="text-body font-semibold">Where it is</h3>
      {detail.isPending ? (
        <Skeleton className="h-24" />
      ) : detail.isError ? (
        <Alert tone="danger">{errorMessage(detail.error)}</Alert>
      ) : detail.data.balances.length === 0 ? (
        <p className="text-body-sm text-ink-muted">Nothing left in any location.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.data.balances.map(balance => (
              <TableRow key={`${balance.locationId}|${balance.status}`}>
                <TableCell>{balance.locationName}</TableCell>
                <TableCell>
                  <Badge tone={BALANCE_STATUS[balance.status].tone}>
                    {BALANCE_STATUS[balance.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular">
                  {qtyText(balance.qty, info.baseUnit)}
                  {Number(balance.allocatedQty) > 0 ? (
                    <div className="text-body-sm text-ink-muted">
                      {qtyText(balance.allocatedQty, info.baseUnit)} reserved
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Corrections batchId={batch.id} />
      <div className="flex flex-wrap gap-2">
        <Can permission={PERMISSIONS.STOCK.RECEIVE}>
          <Button variant="outline" size="sm" onClick={() => onAct('correct')}>
            Correct details
          </Button>
        </Can>
      </div>
      <Can permission={PERMISSIONS.STOCK.WRITE}>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onAct('status_move')}>
            Hold or reclassify
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAct('write_off')}>
            Write off
          </Button>
        </div>
      </Can>
    </>
  );
}

/** What was changed after receiving, newest first, with who and why. */
function Corrections({batchId}: {batchId: string}) {
  const list = useBatchCorrections(batchId);
  if (!list.data || list.data.length === 0) return null;
  return (
    <>
      <h3 className="text-body font-semibold">Corrections</h3>
      <ul className="grid gap-3">
        {list.data.map(item => (
          <li key={item.id} className="rounded-sm border border-line p-3 text-body-sm">
            <div className="font-semibold">{item.reason}</div>
            <div className="text-ink-muted">
              {item.actorName ?? 'Someone'} · {momentText(item.createdAt)}
            </div>
            <ul className="mt-1 grid gap-0.5">
              {item.changes.expiresOn ? (
                <li>
                  Expiry: {dayText(item.changes.expiresOn.from)} →{' '}
                  {dayText(item.changes.expiresOn.to)}
                </li>
              ) : null}
              {item.changes.harvestedOn ? (
                <li>
                  Harvested: {dayText(item.changes.harvestedOn.from)} →{' '}
                  {dayText(item.changes.harvestedOn.to)}
                </li>
              ) : null}
              {item.changes.qty ? (
                <li>
                  Quantity: {item.changes.qty.from} → {item.changes.qty.to}
                </li>
              ) : null}
              {item.changes.purchaseCostKobo ? (
                <li>
                  Purchase cost: {formatNaira(item.changes.purchaseCostKobo.from)} →{' '}
                  {formatNaira(item.changes.purchaseCostKobo.to)}
                </li>
              ) : null}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
