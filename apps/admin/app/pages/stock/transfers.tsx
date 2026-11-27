import {useEffect, useMemo, useState} from 'react';

import {Plus, Trash2, Truck} from 'lucide-react';
import {useSearchParams} from 'react-router';

import {
  useCreateTransfer,
  useDebounce,
  useInventoryLocations,
  useMyStores,
  useProduct,
  useProducts,
  useTransfer,
  useTransfers,
  useTransferStep,
} from '@grov/hooks';
import {
  appConfig,
  PERMISSIONS,
  type StockTransfer,
  type StockTransferLine,
  type TransferStatus,
} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Combobox,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@grov/ui';

import {QuantityInput} from '../../components/common/quantity-input';
import {ListSection} from '../../components/inventory/list-section';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {pickEntryUnit} from '../../lib/catalogue/units';
import {momentText, newKey, qtyText, TRANSFER_STATUS} from '../../lib/inventory/inventory-format';
import type {Route} from './+types/transfers';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Transfers · ${appConfig.brandName} admin`}];

type Direction = 'all' | 'in' | 'out';
const NONE = 'none';

export default function StockTransfers() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('direction');
  const direction: Direction = raw === 'in' || raw === 'out' ? raw : 'all';
  const status = (Object.keys(TRANSFER_STATUS) as TransferStatus[]).find(
    item => item === params.get('status')
  );
  const addId = params.get('add') ?? undefined;
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(addId !== undefined);

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

  const list = useTransfers({
    ...(direction === 'all' ? {} : {direction}),
    ...(status ? {status} : {}),
    limit: 50,
  });
  const rows = list.data?.pages.flatMap(page => page.data) ?? [];
  const stores = useMyStores();
  const activeId = stores.data?.activeStoreId ?? null;

  return (
    <>
      <PageHeader
        title="Transfers"
        description="Stock moving between stores. It leaves the sender’s books when packed and reaches the receiver’s only once a second person has checked it."
        actions={
          <Can permission={PERMISSIONS.STOCK.TRANSFER}>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus aria-hidden /> New transfer
            </Button>
          </Can>
        }
      />
      <ListSection
        label="Transfers"
        query={list}
        count={rows.length}
        toolbar={
          <>
            <Segmented<Direction>
              size="sm"
              label="Direction"
              value={direction}
              onChange={value => setParam('direction', value === 'all' ? undefined : value)}
              options={[
                {value: 'all', label: 'All'},
                {value: 'out', label: 'Sending'},
                {value: 'in', label: 'Receiving'},
              ]}
            />
            <Select
              value={status ?? NONE}
              onValueChange={value => setParam('status', value === NONE ? undefined : value)}
            >
              <SelectTrigger aria-label="Status" className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Any status</SelectItem>
                {(Object.keys(TRANSFER_STATUS) as TransferStatus[]).map(item => (
                  <SelectItem key={item} value={item}>
                    {TRANSFER_STATUS[item].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        empty={{
          icon: <Truck />,
          title: 'No transfers',
          description: 'Move stock to or from another store and it shows here.',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(transfer => (
              <TableRow
                key={transfer.id}
                className="cursor-pointer"
                onClick={() => setOpenId(transfer.id)}
              >
                <TableCell>
                  <button
                    type="button"
                    className="font-semibold underline-offset-4 hover:underline focus-visible:underline"
                    onClick={event => {
                      event.stopPropagation();
                      setOpenId(transfer.id);
                    }}
                  >
                    {transfer.number}
                  </button>
                  <div className="text-body-sm text-ink-muted">
                    {momentText(transfer.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {transfer.fromStoreName} → {transfer.toStoreName}
                  <div className="text-body-sm text-ink-muted">
                    {activeId === transfer.fromStoreId ? 'Sending' : 'Receiving'}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular">{transfer.lineCount}</TableCell>
                <TableCell>
                  <Badge tone={TRANSFER_STATUS[transfer.status].tone}>
                    {TRANSFER_STATUS[transfer.status].label}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListSection>

      <Dialog
        open={creating}
        onOpenChange={open => {
          if (open) return;
          setCreating(false);
          setParam('add', undefined);
        }}
      >
        <DialogContent layout="side" className="max-w-xl content-start">
          {creating ? (
            <NewTransfer
              presetProductId={addId}
              onDone={id => {
                setCreating(false);
                setParam('add', undefined);
                if (id) setOpenId(id);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={openId !== null} onOpenChange={open => (open ? undefined : setOpenId(null))}>
        <DialogContent layout="side" className="max-w-2xl content-start">
          {openId ? <TransferDetail id={openId} onClose={() => setOpenId(null)} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface DraftLine {
  productId: string;
  name: string;
  sku: string;
  baseUnit: string;
  entry: string;
  qty: string;
}

function NewTransfer({
  presetProductId,
  onDone,
}: {
  presetProductId: string | undefined;
  onDone: (id?: string) => void;
}) {
  const create = useCreateTransfer();
  const stores = useMyStores();
  const [idempotencyKey] = useState(newKey);
  const [toStoreId, setToStoreId] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [search, setSearch] = useState('');
  const q = useDebounce(search.trim(), 250);
  const found = useProducts({draft: false, ...(q ? {q} : {})});
  const products = useMemo(() => found.data?.pages.flatMap(page => page.data) ?? [], [found.data]);
  const activeId = stores.data?.activeStoreId ?? null;
  const targets = (stores.data?.stores ?? []).filter(store => store.id !== activeId);

  const addProduct = (product: {id: string; displayName: string; sku: string; baseUnit: string}) =>
    setLines(current =>
      current.some(line => line.productId === product.id)
        ? current
        : [
            ...current,
            {
              productId: product.id,
              name: product.displayName,
              sku: product.sku,
              baseUnit: product.baseUnit,
              entry: pickEntryUnit(product.baseUnit, '1000').code,
              qty: '',
            },
          ]
    );
  const preset = useProduct(presetProductId);
  const [applied, setApplied] = useState(false);
  useEffect(() => {
    if (!applied && preset.data) {
      addProduct(preset.data);
      setApplied(true);
    }
  }, [applied, preset.data]);

  const patch = (productId: string, change: Partial<DraftLine>) =>
    setLines(current =>
      current.map(line => (line.productId === productId ? {...line, ...change} : line))
    );
  const ready = toStoreId !== '' && lines.length > 0 && lines.every(line => Number(line.qty) > 0);

  return (
    <>
      <DialogHeader>
        <DialogTitle>New transfer</DialogTitle>
        <DialogDescription>
          Plan what to send. Nothing leaves the shelf until you pack it.
        </DialogDescription>
      </DialogHeader>
      <form
        noValidate
        className="grid gap-5"
        onSubmit={event => {
          event.preventDefault();
          if (!ready) return;
          create.mutate(
            {
              idempotencyKey,
              body: {
                toStoreId,
                ...(note.trim() ? {note: note.trim()} : {}),
                lines: lines.map(line => ({
                  productId: line.productId,
                  qty: Number(line.qty).toFixed(3),
                })),
              },
            },
            {
              onSuccess: transfer => {
                toast.success(`${transfer.number} planned`);
                onDone(transfer.id);
              },
            }
          );
        }}
      >
        <Field label="Send to">
          <Select value={toStoreId} onValueChange={setToStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a store" />
            </SelectTrigger>
            <SelectContent>
              {targets.map(store => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {targets.length === 0 && !stores.isPending ? (
          <Alert tone="info">You only act on this store, so there is nowhere to send to.</Alert>
        ) : null}
        <Field label="Add a product" hint="The oldest batch is sent first.">
          <Combobox
            value={null}
            onChange={id => {
              const product = products.find(p => p.id === id);
              if (product) addProduct(product);
            }}
            options={products.map(product => ({
              value: product.id,
              label: `${product.displayName} · ${product.sku}`,
            }))}
            onSearch={setSearch}
            loading={found.isFetching}
            placeholder="Search by name or SKU"
            searchPlaceholder="Search products"
            emptyText="No product found"
          />
        </Field>
        {lines.length === 0 ? (
          <EmptyState
            icon={<Truck />}
            title="Nothing to send yet"
            description="Search for a product above."
          />
        ) : (
          <ul className="grid gap-3">
            {lines.map(line => (
              <li
                key={line.productId}
                className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{line.name}</div>
                  <div className="text-body-sm text-ink-muted">{line.sku}</div>
                </div>
                <QuantityInput
                  aria-label={`Quantity of ${line.name}`}
                  value={line.qty}
                  onChange={qty => patch(line.productId, {qty})}
                  unit={line.baseUnit}
                  entry={line.entry}
                  onEntryChange={entry => patch(line.productId, {entry})}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => setLines(current => current.filter(l => l !== line))}
                >
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Field label="Note" hint="Optional.">
          <Input value={note} maxLength={200} onChange={e => setNote(e.target.value)} />
        </Field>
        {create.isError ? <Alert tone="danger">{errorMessage(create.error)}</Alert> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onDone()}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending} disabled={!ready}>
            Plan transfer
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

/** What each step asks of the person, and who acts: the sender first, then the receiver. */
const FLOW: TransferStatus[] = [
  'INITIATED',
  'DISPATCHED',
  'IN_TRANSIT',
  'RECEIVED',
  'VERIFIED',
  'COMPLETED',
];

function TransferDetail({id, onClose}: {id: string; onClose: () => void}) {
  const transfer = useTransfer(id);
  const stores = useMyStores();
  const {can} = usePermissions();
  const step = useTransferStep();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [eta, setEta] = useState('');

  if (transfer.isPending) return <Skeleton className="h-64" />;
  if (transfer.isError) return <Alert tone="danger">{errorMessage(transfer.error)}</Alert>;
  const data = transfer.data;
  const activeId = stores.data?.activeStoreId ?? null;
  const source = activeId === data.fromStoreId;
  const destination = activeId === data.toStoreId;
  const canMove = can(PERMISSIONS.STOCK.TRANSFER);
  const canVerify = can(PERMISSIONS.STOCK.TRANSFER_VERIFY);
  const info = TRANSFER_STATUS[data.status];

  const run = (
    action: Parameters<typeof step.mutate>[0]['step'],
    body: Parameters<typeof step.mutate>[0]['body'],
    done: string
  ) =>
    step.mutate(
      {id: data.id, step: action, idempotencyKey: newKey(), ...(body ? {body} : {})},
      {onSuccess: () => toast.success(done)}
    );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {data.number}
          <Badge tone={info.tone}>{info.label}</Badge>
        </DialogTitle>
        <DialogDescription>
          {data.fromStoreName} → {data.toStoreName}. {info.hint}
        </DialogDescription>
      </DialogHeader>

      <ol className="flex flex-wrap gap-2 text-body-sm" aria-label="Progress">
        {FLOW.map(item => {
          const reached = FLOW.indexOf(data.status) >= FLOW.indexOf(item);
          return (
            <li key={item}>
              <Badge tone={reached && data.status !== 'CANCELLED' ? 'leaf' : 'neutral'}>
                {TRANSFER_STATUS[item].label}
              </Badge>
            </li>
          );
        })}
      </ol>

      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {[
          ['Planned', momentText(data.createdAt)],
          ['Packed', momentText(data.dispatchedAt)],
          ['Left', momentText(data.departedAt)],
          ['Carrier', data.carrier ?? '—'],
          ['Expected', momentText(data.eta)],
          ['Received', momentText(data.receivedAt)],
          ['Checked', momentText(data.verifiedAt)],
          ['Completed', momentText(data.completedAt)],
        ].map(([term, value]) => (
          <div key={term} className="grid gap-0.5">
            <dt className="text-body-sm text-ink-muted">{term}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {data.note ? <p className="text-body-sm text-ink-muted">{data.note}</p> : null}

      <TransferLines transfer={data} />

      {step.isError ? <Alert tone="danger">{errorMessage(step.error)}</Alert> : null}

      {source && canMove && data.status === 'INITIATED' ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmCancel(true)}>
            Cancel transfer
          </Button>
          <Button
            loading={step.isPending}
            onClick={() => run('dispatch', undefined, 'Packed. Stock is held for pickup.')}
          >
            Pack and hold
          </Button>
        </div>
      ) : null}
      {source && canMove && data.status === 'DISPATCHED' ? (
        <form
          noValidate
          className="grid gap-4 rounded-lg border border-line p-4"
          onSubmit={event => {
            event.preventDefault();
            run(
              'depart',
              {
                ...(carrier.trim() ? {carrier: carrier.trim()} : {}),
                ...(eta ? {eta: new Date(eta).toISOString()} : {}),
              },
              'Marked as on the road'
            );
          }}
        >
          <h3 className="text-body font-semibold">It has left</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Carrier" hint="Optional. Driver or company.">
              <Input value={carrier} maxLength={80} onChange={e => setCarrier(e.target.value)} />
            </Field>
            <Field label="Expected arrival" hint="Optional.">
              <Input type="datetime-local" value={eta} onChange={e => setEta(e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={step.isPending}>
              Mark as left
            </Button>
          </div>
        </form>
      ) : null}
      {destination && canMove && (data.status === 'DISPATCHED' || data.status === 'IN_TRANSIT') ? (
        <ReceiveForm
          transfer={data}
          pending={step.isPending}
          onSubmit={body => run('receive', body, 'Received. Held until checked.')}
        />
      ) : null}
      {destination && canVerify && data.status === 'RECEIVED' ? (
        <VerifyForm
          transfer={data}
          pending={step.isPending}
          onSubmit={body => run('verify', body, 'Checked')}
        />
      ) : null}
      {destination && canMove && data.status === 'VERIFIED' ? (
        <CompleteForm
          transfer={data}
          pending={step.isPending}
          onSubmit={body => run('complete', body, 'Transfer completed')}
        />
      ) : null}

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={`Cancel ${data.number}?`}
        description="The plan is dropped. Nothing has left the shelf."
        confirmLabel="Cancel transfer"
        tone="danger"
        loading={step.isPending}
        onConfirm={() =>
          step.mutate(
            {id: data.id, step: 'cancel', idempotencyKey: newKey()},
            {
              onSuccess: () => {
                toast.success(`${data.number} cancelled`);
                setConfirmCancel(false);
                onClose();
              },
            }
          )
        }
      />
    </>
  );
}

function TransferLines({transfer}: {transfer: StockTransfer}) {
  const showReceived = transfer.lines.some(line => line.qtyReceived !== null);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Sent</TableHead>
          {showReceived ? <TableHead className="text-right">Received</TableHead> : null}
          {showReceived ? <TableHead className="text-right">Accepted</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfer.lines.map(line => (
          <TableRow key={line.id}>
            <TableCell>
              <div className="font-semibold">{line.productName}</div>
              <div className="text-body-sm text-ink-muted">
                {line.batchNumber ? `Batch ${line.batchNumber}` : line.sku}
                {Number(line.qtyShort) > 0
                  ? ` · short ${qtyText(line.qtyShort, line.baseUnit)}${line.shortfallAction ? ` (${line.shortfallAction === 'FOUND' ? 'found' : 'written off'})` : ''}`
                  : ''}
              </div>
            </TableCell>
            <TableCell className="text-right tabular">
              {qtyText(Number(line.qtySent) > 0 ? line.qtySent : line.qtyRequested, line.baseUnit)}
            </TableCell>
            {showReceived ? (
              <TableCell className="text-right tabular">
                {qtyText(line.qtyReceived, line.baseUnit)}
              </TableCell>
            ) : null}
            {showReceived ? (
              <TableCell className="text-right tabular">
                {qtyText(line.qtyAccepted, line.baseUnit)}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** One editable quantity per line, starting from a sensible default. */
function useLineQuantities(
  lines: StockTransferLine[],
  initial: (line: StockTransferLine) => string
) {
  const [qty, setQty] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map(line => [line.id, initial(line)]))
  );
  const [entry, setEntry] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      lines.map(line => [line.id, pickEntryUnit(line.baseUnit, initial(line) || '1000').code])
    )
  );
  return {
    qty,
    entry,
    setQty: (id: string, value: string) => setQty(c => ({...c, [id]: value})),
    setEntry: (id: string, value: string) => setEntry(c => ({...c, [id]: value})),
  };
}

function LineQuantityRow({
  line,
  label,
  max,
  state,
}: {
  line: StockTransferLine;
  label: string;
  max: number;
  state: ReturnType<typeof useLineQuantities>;
}) {
  const value = state.qty[line.id] ?? '';
  return (
    <li className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="truncate font-semibold">{line.productName}</div>
        <div className="text-body-sm text-ink-muted">
          {label} up to {qtyText(String(max), line.baseUnit)}
        </div>
      </div>
      <Field label={label} error={Number(value) > max ? 'More than there is.' : undefined}>
        <QuantityInput
          aria-label={`${label}: ${line.productName}`}
          value={value}
          onChange={next => state.setQty(line.id, next)}
          unit={line.baseUnit}
          entry={state.entry[line.id] ?? 'g'}
          onEntryChange={next => state.setEntry(line.id, next)}
        />
      </Field>
    </li>
  );
}

function ReceiveForm({
  transfer,
  pending,
  onSubmit,
}: {
  transfer: StockTransfer;
  pending: boolean;
  onSubmit: (body: {lines: {lineId: string; receivedQty: string; locationId?: string}[]}) => void;
}) {
  const state = useLineQuantities(transfer.lines, line => line.qtySent);
  const locations = useInventoryLocations();
  const places = (locations.data ?? []).filter(
    place => place.active && ['WAREHOUSE', 'COLD_ROOM', 'BAY'].includes(place.kind)
  );
  const [locationId, setLocationId] = useState('');
  const valid = transfer.lines.every(line => {
    const value = Number(state.qty[line.id] ?? '');
    return Number.isFinite(value) && value >= 0 && value <= Number(line.qtySent);
  });
  return (
    <form
      noValidate
      className="grid gap-4 rounded-lg border border-line p-4"
      onSubmit={event => {
        event.preventDefault();
        if (!valid) return;
        onSubmit({
          lines: transfer.lines.map(line => ({
            lineId: line.id,
            receivedQty: Number(state.qty[line.id] || 0).toFixed(3),
            ...(locationId ? {locationId} : {}),
          })),
        });
      }}
    >
      <h3 className="text-body font-semibold">Count what arrived</h3>
      <p className="text-body-sm text-ink-muted">
        It is held on arrival. A different person checks it before it can be sold.
      </p>
      <ul className="grid gap-3">
        {transfer.lines.map(line => (
          <LineQuantityRow
            key={line.id}
            line={line}
            label="Received"
            max={Number(line.qtySent)}
            state={state}
          />
        ))}
      </ul>
      <Field label="Put away in" hint="Empty uses the main warehouse.">
        <Select
          value={locationId || NONE}
          onValueChange={value => setLocationId(value === NONE ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Main warehouse</SelectItem>
            {places.map(place => (
              <SelectItem key={place.id} value={place.id}>
                {place.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={pending} disabled={!valid}>
          Confirm received
        </Button>
      </div>
    </form>
  );
}

function VerifyForm({
  transfer,
  pending,
  onSubmit,
}: {
  transfer: StockTransfer;
  pending: boolean;
  onSubmit: (body: {lines: {lineId: string; acceptedQty: string}[]}) => void;
}) {
  const arrived = transfer.lines.filter(line => Number(line.qtyReceived ?? 0) > 0);
  const state = useLineQuantities(arrived, line => line.qtyReceived ?? '0');
  const valid =
    arrived.length > 0 &&
    arrived.every(line => {
      const value = Number(state.qty[line.id] ?? '');
      return Number.isFinite(value) && value >= 0 && value <= Number(line.qtyReceived);
    });
  return (
    <form
      noValidate
      className="grid gap-4 rounded-lg border border-line p-4"
      onSubmit={event => {
        event.preventDefault();
        if (!valid) return;
        onSubmit({
          lines: arrived.map(line => ({
            lineId: line.id,
            acceptedQty: Number(state.qty[line.id] || 0).toFixed(3),
          })),
        });
      }}
    >
      <h3 className="text-body font-semibold">Check the goods</h3>
      <p className="text-body-sm text-ink-muted">
        Accept what is good. The rest is set aside as damaged. This must be someone other than the
        person who received it.
      </p>
      <ul className="grid gap-3">
        {arrived.map(line => (
          <LineQuantityRow
            key={line.id}
            line={line}
            label="Accepted"
            max={Number(line.qtyReceived)}
            state={state}
          />
        ))}
      </ul>
      <div className="flex justify-end">
        <Button type="submit" loading={pending} disabled={!valid}>
          Confirm checked
        </Button>
      </div>
    </form>
  );
}

function CompleteForm({
  transfer,
  pending,
  onSubmit,
}: {
  transfer: StockTransfer;
  pending: boolean;
  onSubmit: (body: {
    resolutions: {lineId: string; action: 'FOUND' | 'WRITE_OFF'; reasonCode?: string}[];
  }) => void;
}) {
  const short = transfer.lines.filter(line => Number(line.qtySent) > Number(line.qtyReceived ?? 0));
  const [choice, setChoice] = useState<Record<string, 'FOUND' | 'WRITE_OFF'>>({});
  const ready = short.every(line => choice[line.id] !== undefined);
  return (
    <form
      noValidate
      className="grid gap-4 rounded-lg border border-line p-4"
      onSubmit={event => {
        event.preventDefault();
        if (!ready) return;
        onSubmit({
          resolutions: short.map(line => {
            const action = choice[line.id] ?? 'WRITE_OFF';
            return {
              lineId: line.id,
              action,
              ...(action === 'WRITE_OFF' ? {reasonCode: 'TRANSIT_LOSS'} : {}),
            };
          }),
        });
      }}
    >
      <h3 className="text-body font-semibold">
        {short.length === 0 ? 'Complete the transfer' : 'Settle what is missing'}
      </h3>
      {short.length === 0 ? (
        <p className="text-body-sm text-ink-muted">
          Everything arrived. Completing puts the accepted stock on sale.
        </p>
      ) : (
        <ul className="grid gap-3">
          {short.map(line => (
            <li
              key={line.id}
              className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{line.productName}</div>
                <div className="text-body-sm text-ink-muted">
                  Missing {qtyText(line.qtyShort, line.baseUnit)}
                </div>
              </div>
              <Select
                value={choice[line.id] ?? ''}
                onValueChange={value =>
                  setChoice(current => ({...current, [line.id]: value as 'FOUND' | 'WRITE_OFF'}))
                }
              >
                <SelectTrigger aria-label={`What happened to ${line.productName}`} className="w-48">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOUND">It turned up</SelectItem>
                  <SelectItem value="WRITE_OFF">Write off as lost</SelectItem>
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end">
        <Button type="submit" loading={pending} disabled={!ready}>
          Complete transfer
        </Button>
      </div>
    </form>
  );
}
