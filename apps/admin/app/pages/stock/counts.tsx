import {useEffect, useMemo, useState} from 'react';

import {ClipboardCheck, Plus, Trash2} from 'lucide-react';
import {useSearchParams} from 'react-router';

import {
  useCount,
  useCounts,
  useCountStep,
  useCreateCount,
  useDebounce,
  useInventoryLocations,
  useProduct,
  useProducts,
  usePutCountLines,
} from '@grov/hooks';
import {appConfig, type CountStatus, PERMISSIONS, type StockCount} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Combobox,
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
import {
  costText,
  COUNT_STATUS,
  momentText,
  newKey,
  qtyText,
} from '../../lib/inventory/inventory-format';
import type {Route} from './+types/counts';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Stock counts · ${appConfig.brandName} admin`},
];

type Scope = CountStatus | 'all';
const SCOPES: Scope[] = ['all', 'DRAFT', 'SUBMITTED', 'POSTED', 'REJECTED'];

export default function StockCounts() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('status');
  const scope: Scope = SCOPES.find(item => item === raw) ?? 'all';
  const productParam = params.get('product') ?? undefined;
  const [creating, setCreating] = useState(productParam !== undefined);
  const [open, setOpen] = useState<{id: string; seed?: string} | null>(null);
  const list = useCounts({...(scope === 'all' ? {} : {status: scope}), limit: 50});
  const rows = list.data?.pages.flatMap(page => page.data) ?? [];
  const clearProduct = () =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        next.delete('product');
        return next;
      },
      {replace: true}
    );

  return (
    <>
      <PageHeader
        title="Stock counts"
        description="Count what is on the shelf. Differences are frozen when you submit, and only post once approved."
        actions={
          <Can permission={PERMISSIONS.STOCK.COUNT}>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus aria-hidden /> New count
            </Button>
          </Can>
        }
      />
      <ListSection
        label="Stock counts"
        query={list}
        count={rows.length}
        toolbar={
          <Segmented<Scope>
            size="sm"
            label="Status"
            value={scope}
            onChange={value =>
              setParams(
                previous => {
                  const next = new URLSearchParams(previous);
                  if (value === 'all') next.delete('status');
                  else next.set('status', value);
                  return next;
                },
                {replace: true}
              )
            }
            options={[
              {value: 'all', label: 'All'},
              {value: 'DRAFT', label: 'Counting'},
              {value: 'SUBMITTED', label: 'Awaiting approval'},
              {value: 'POSTED', label: 'Posted'},
              {value: 'REJECTED', label: 'Rejected'},
            ]}
          />
        }
        empty={{
          icon: <ClipboardCheck />,
          title: 'No stock counts',
          description: 'Start a count to compare the shelf with the system.',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Count</TableHead>
              <TableHead className="text-right">Lines</TableHead>
              <TableHead className="hidden @3xl:table-cell">Decided</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(count => (
              <TableRow
                key={count.id}
                className="cursor-pointer"
                onClick={() => setOpen({id: count.id})}
              >
                <TableCell>
                  <button
                    type="button"
                    className="font-semibold underline-offset-4 hover:underline focus-visible:underline"
                    onClick={event => {
                      event.stopPropagation();
                      setOpen({id: count.id});
                    }}
                  >
                    {count.number}
                  </button>
                  <div className="text-body-sm text-ink-muted">{momentText(count.createdAt)}</div>
                </TableCell>
                <TableCell className="text-right tabular">{count.lineCount}</TableCell>
                <TableCell className="hidden text-body-sm @3xl:table-cell">
                  {momentText(count.decidedAt)}
                </TableCell>
                <TableCell>
                  <Badge tone={COUNT_STATUS[count.status].tone}>
                    {COUNT_STATUS[count.status].label}
                  </Badge>
                  {count.status === 'SUBMITTED' && count.needsApproval ? (
                    <span className="ml-2 text-body-sm text-ink-muted">Large variance</span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListSection>

      <Dialog
        open={creating}
        onOpenChange={next => {
          if (next) return;
          setCreating(false);
          clearProduct();
        }}
      >
        <DialogContent className="max-w-md">
          {creating ? (
            <NewCount
              onDone={id => {
                setCreating(false);
                clearProduct();
                if (id) setOpen({id, ...(productParam ? {seed: productParam} : {})});
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={open !== null} onOpenChange={next => (next ? undefined : setOpen(null))}>
        <DialogContent layout="side" className="max-w-3xl content-start">
          {open ? (
            <CountDetail id={open.id} seedProductId={open.seed} onClose={() => setOpen(null)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

const ANY = 'any';

function NewCount({onDone}: {onDone: (id?: string) => void}) {
  const create = useCreateCount();
  const locations = useInventoryLocations();
  const [idempotencyKey] = useState(newKey);
  const [locationId, setLocationId] = useState('');
  const [note, setNote] = useState('');
  const places = (locations.data ?? []).filter(
    place => place.active && place.kind !== 'IN_TRANSIT'
  );
  return (
    <>
      <DialogHeader>
        <DialogTitle>New stock count</DialogTitle>
        <DialogDescription>Count one location, or any location in the store.</DialogDescription>
      </DialogHeader>
      <form
        noValidate
        className="grid gap-5"
        onSubmit={event => {
          event.preventDefault();
          create.mutate(
            {
              idempotencyKey,
              body: {
                ...(locationId ? {locationId} : {}),
                ...(note.trim() ? {note: note.trim()} : {}),
              },
            },
            {
              onSuccess: count => {
                toast.success(`${count.number} started`);
                onDone(count.id);
              },
            }
          );
        }}
      >
        <Field label="Location">
          <Select
            value={locationId || ANY}
            onValueChange={value => setLocationId(value === ANY ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any location</SelectItem>
              {places.map(place => (
                <SelectItem key={place.id} value={place.id}>
                  {place.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Note" hint="Optional.">
          <Input value={note} maxLength={200} onChange={e => setNote(e.target.value)} />
        </Field>
        {create.isError ? <Alert tone="danger">{errorMessage(create.error)}</Alert> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onDone()}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Start counting
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

interface DraftLine {
  key: string;
  productId: string;
  name: string;
  sku: string;
  baseUnit: string;
  locationId: string;
  batchId?: string;
  entry: string;
  counted: string;
}

function fromCount(count: StockCount): DraftLine[] {
  return count.lines.map(line => ({
    key: line.id,
    productId: line.productId,
    name: line.productName,
    sku: line.sku,
    baseUnit: line.baseUnit,
    locationId: line.locationId,
    ...(line.batchId ? {batchId: line.batchId} : {}),
    entry: pickEntryUnit(line.baseUnit, line.countedQty || '1000').code,
    counted: line.countedQty,
  }));
}

function CountDetail({
  id,
  seedProductId,
  onClose,
}: {
  id: string;
  seedProductId: string | undefined;
  onClose: () => void;
}) {
  const count = useCount(id);
  if (count.isPending) return <Skeleton className="h-64" />;
  if (count.isError) return <Alert tone="danger">{errorMessage(count.error)}</Alert>;
  return <CountBody count={count.data} seedProductId={seedProductId} onClose={onClose} />;
}

function CountBody({
  count,
  seedProductId,
  onClose,
}: {
  count: StockCount;
  seedProductId: string | undefined;
  onClose: () => void;
}) {
  const {can} = usePermissions();
  const canCount = can(PERMISSIONS.STOCK.COUNT);
  const canApprove = !count.needsApproval || can(PERMISSIONS.STOCK.ADJUST_APPROVE);
  const save = usePutCountLines();
  const step = useCountStep();
  const locations = useInventoryLocations();
  const places = (locations.data ?? []).filter(
    place => place.active && place.kind !== 'IN_TRANSIT'
  );
  const defaultLocation = count.locationId ?? places[0]?.id ?? '';
  const [lines, setLines] = useState<DraftLine[]>(() => fromCount(count));
  const [dirty, setDirty] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const editable = count.status === 'DRAFT' && canCount;
  const info = COUNT_STATUS[count.status];

  const [search, setSearch] = useState('');
  const q = useDebounce(search.trim(), 250);
  const found = useProducts({draft: false, ...(q ? {q} : {})});
  const products = useMemo(() => found.data?.pages.flatMap(page => page.data) ?? [], [found.data]);

  const addProduct = (product: {
    id: string;
    displayName: string;
    sku: string;
    baseUnit: string;
  }) => {
    setLines(current => [
      ...current,
      {
        key: crypto.randomUUID(),
        productId: product.id,
        name: product.displayName,
        sku: product.sku,
        baseUnit: product.baseUnit,
        locationId: defaultLocation,
        entry: pickEntryUnit(product.baseUnit, '1000').code,
        counted: '',
      },
    ]);
    setDirty(true);
  };

  // Arriving from a product's "Count stock" action: put that product on the sheet once.
  const seed = useProduct(seedProductId);
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (seeded || !seed.data || count.status !== 'DRAFT' || places.length === 0) return;
    if (!lines.some(line => line.productId === seed.data.id)) addProduct(seed.data);
    setSeeded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once, when both have loaded
  }, [seed.data, places.length, seeded]);

  const patch = (key: string, change: Partial<DraftLine>) => {
    setLines(current => current.map(line => (line.key === key ? {...line, ...change} : line)));
    setDirty(true);
  };
  const filled = lines.filter(line => line.counted !== '' && line.locationId !== '');
  const duplicate = new Set(
    filled
      .map(line => `${line.locationId}:${line.productId}:${line.batchId ?? ''}`)
      .filter((key, index, all) => all.indexOf(key) !== index)
  );
  const ready =
    filled.length > 0 &&
    filled.length === lines.length &&
    duplicate.size === 0 &&
    filled.every(line => Number(line.counted) >= 0);

  const saveLines = (after?: () => void) =>
    save.mutate(
      {
        id: count.id,
        body: {
          lines: filled.map(line => ({
            locationId: line.locationId,
            productId: line.productId,
            ...(line.batchId ? {batchId: line.batchId} : {}),
            countedQty: Number(line.counted).toFixed(3),
          })),
        },
      },
      {
        onSuccess: () => {
          setDirty(false);
          if (after) after();
          else toast.success('Count saved');
        },
      }
    );
  const submit = () =>
    step.mutate(
      {id: count.id, step: 'submit', idempotencyKey: newKey()},
      {onSuccess: () => toast.success('Submitted. Differences are now frozen.')}
    );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {count.number}
          <Badge tone={info.tone}>{info.label}</Badge>
        </DialogTitle>
        <DialogDescription>
          {count.status === 'DRAFT'
            ? 'Enter what is on the shelf. Nothing changes until it is submitted and approved.'
            : count.status === 'SUBMITTED'
              ? count.needsApproval
                ? 'A large difference: a stock manager must approve it.'
                : 'Differences are frozen. Approve to post them.'
              : count.status === 'POSTED'
                ? 'Posted. Stock was corrected by the differences below.'
                : `Rejected${count.rejectReason ? `: ${count.rejectReason}` : '.'}`}
        </DialogDescription>
      </DialogHeader>

      {editable ? (
        <Field label="Add a product">
          <Combobox
            value={null}
            onChange={productId => {
              const product = products.find(p => p.id === productId);
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
      ) : null}

      {editable ? (
        lines.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck />}
            title="Nothing counted yet"
            description="Add a product above and enter what you find."
          />
        ) : (
          <ul className="grid gap-3">
            {lines.map(line => (
              <li key={line.key} className="grid gap-3 rounded-md border border-line p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{line.name}</div>
                    <div className="text-body-sm text-ink-muted">{line.sku}</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => {
                      setLines(current => current.filter(l => l.key !== line.key));
                      setDirty(true);
                    }}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Location">
                    <Select
                      value={line.locationId}
                      onValueChange={value => patch(line.key, {locationId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                      <SelectContent>
                        {places.map(place => (
                          <SelectItem key={place.id} value={place.id}>
                            {place.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field
                    label="Counted"
                    error={
                      duplicate.has(`${line.locationId}:${line.productId}:${line.batchId ?? ''}`)
                        ? 'Counted twice in one location.'
                        : undefined
                    }
                  >
                    <QuantityInput
                      aria-label={`Counted ${line.name}`}
                      value={line.counted}
                      onChange={counted => patch(line.key, {counted})}
                      unit={line.baseUnit}
                      entry={line.entry}
                      onEntryChange={entry => patch(line.key, {entry})}
                    />
                  </Field>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="text-right">Counted</TableHead>
              <TableHead className="text-right">System</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {count.lines.map(line => {
              const variance = Number(line.varianceQty ?? 0);
              return (
                <TableRow key={line.id}>
                  <TableCell>
                    <div className="font-semibold">{line.productName}</div>
                    <div className="text-body-sm text-ink-muted">
                      {line.batchNumber ? `Batch ${line.batchNumber}` : line.sku}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{line.locationName}</TableCell>
                  <TableCell className="text-right tabular">
                    {qtyText(line.countedQty, line.baseUnit)}
                  </TableCell>
                  <TableCell className="text-right tabular">
                    {qtyText(line.systemQty, line.baseUnit)}
                  </TableCell>
                  <TableCell className="text-right tabular">
                    <span
                      className={variance < 0 ? 'font-semibold text-flame-strong' : 'font-semibold'}
                    >
                      {line.varianceQty === null
                        ? '—'
                        : `${variance > 0 ? '+' : variance < 0 ? '−' : ''}${qtyText(String(Math.abs(variance)), line.baseUnit)}`}
                    </span>
                    {line.varianceCost ? (
                      <div className="text-body-sm text-ink-muted">
                        {costText(line.varianceCost)}
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {save.isError ? <Alert tone="danger">{errorMessage(save.error)}</Alert> : null}
      {step.isError ? <Alert tone="danger">{errorMessage(step.error)}</Alert> : null}

      {editable ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            loading={save.isPending}
            disabled={!dirty || !ready}
            onClick={() => saveLines()}
          >
            Save
          </Button>
          <Button
            loading={save.isPending || step.isPending}
            disabled={!ready}
            onClick={() => (dirty ? saveLines(submit) : submit())}
          >
            Submit count
          </Button>
        </div>
      ) : null}

      {count.status === 'SUBMITTED' && canCount ? (
        rejecting ? (
          <form
            noValidate
            className="grid gap-3 rounded-lg border border-line p-4"
            onSubmit={event => {
              event.preventDefault();
              if (!reason.trim()) return;
              step.mutate(
                {
                  id: count.id,
                  step: 'reject',
                  idempotencyKey: newKey(),
                  body: {reason: reason.trim()},
                },
                {
                  onSuccess: () => {
                    toast.success(`${count.number} rejected`);
                    onClose();
                  },
                }
              );
            }}
          >
            <Field label="Why is it rejected?">
              <Input
                value={reason}
                maxLength={200}

                onChange={e => setReason(e.target.value)}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRejecting(false)}>
                Back
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={step.isPending}
                disabled={!reason.trim()}
              >
                Reject count
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setRejecting(true)}>
              Reject
            </Button>
            <Button
              loading={step.isPending}
              disabled={!canApprove}
              onClick={() =>
                step.mutate(
                  {id: count.id, step: 'approve', idempotencyKey: newKey()},
                  {onSuccess: () => toast.success('Approved. Stock corrected.')}
                )
              }
            >
              Approve and post
            </Button>
            {!canApprove ? (
              <p className="basis-full text-right text-body-sm text-ink-muted">
                You need permission to approve large differences.
              </p>
            ) : null}
          </div>
        )
      ) : null}
    </>
  );
}
