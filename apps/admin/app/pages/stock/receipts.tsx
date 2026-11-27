import {useEffect, useMemo, useState} from 'react';

import {ArrowRight, CalendarCheck, ClipboardList, PackagePlus, Plus, Trash2} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router';

import {
  useCreateGrn,
  useDebounce,
  useGrns,
  useInventoryLocations,
  usePostGrn,
  useProduct,
  useProducts,
  useStockOverview,
  useSuppliers,
} from '@grov/hooks';
import {appConfig, type CreateGrnBody, type LandedCostKind, PERMISSIONS} from '@grov/models';
import {errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  AmountInput,
  Badge,
  Button,
  Combobox,
  EmptyState,
  Field,
  formatNaira,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatRail,
  toast,
} from '@grov/ui';

import {PageFrame, PageRail} from '../../components/common/page-frame';
import {QuantityInput} from '../../components/common/quantity-input';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {formatQty} from '../../lib/catalogue/insight-format';
import {pickEntryUnit} from '../../lib/catalogue/units';
import {
  CHARGE_KINDS,
  GRN_STATUS,
  momentText,
  newKey,
  qtyText,
  STOCK_COST_MAX_NAIRA,
} from '../../lib/inventory/inventory-format';
import {paths} from '../../paths';
import type {Route} from './+types/receipts';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.RECEIVE]},
  fullBleed: true,
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Receive stock · ${appConfig.brandName} admin`},
];

interface Line {
  productId: string;
  name: string;
  sku: string;
  baseUnit: string;
  entry: string;
  received: string;
  rejected: string;
  costKobo: number | null;
  harvestedOn: string;
  expiresOn: string;
  hold: boolean;
}

interface Charge {
  id: string;
  kind: LandedCostKind;
  amountKobo: number | null;
  allocateBy: 'WEIGHT' | 'VALUE' | 'EQUAL';
  note: string;
}

const ALLOCATE: {value: Charge['allocateBy']; label: string}[] = [
  {value: 'WEIGHT', label: 'By weight'},
  {value: 'VALUE', label: 'By value'},
  {value: 'EQUAL', label: 'Equally'},
];

const NONE = 'none';

function newLine(
  product: {id: string; displayName: string; sku: string; baseUnit: string},
  received = ''
): Line {
  return {
    productId: product.id,
    name: product.displayName,
    sku: product.sku,
    baseUnit: product.baseUnit,
    entry: pickEntryUnit(product.baseUnit, received || '1000').code,
    received,
    rejected: '',
    costKobo: null,
    harvestedOn: '',
    expiresOn: '',
    hold: false,
  };
}

/** Accepted = received − rejected, in the 3 decimals the API keeps. */
function accepted(line: Line): string {
  const value = Number(line.received) - Number(line.rejected || 0);
  return Number.isFinite(value) ? Math.max(0, value).toFixed(3) : '0.000';
}

const lineReady = (line: Line) =>
  Number(line.received) > 0 &&
  Number(line.rejected || 0) >= 0 &&
  Number(line.rejected || 0) <= Number(line.received) &&
  line.costKobo !== null;

export default function StockReceipts() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const addId = params.get('add') ?? undefined;
  const [lines, setLines] = useState<Line[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [farmId, setFarmId] = useState('');
  const [receivedFrom, setReceivedFrom] = useState('');
  const [reference, setReference] = useState('');
  const [locationId, setLocationId] = useState('');
  const [createKey, setCreateKey] = useState(newKey);
  const [postKey, setPostKey] = useState(newKey);
  const create = useCreateGrn();
  const post = usePostGrn();

  const suppliers = useSuppliers({status: 'ACTIVE', limit: 100});
  const supplierList = useMemo(
    () => suppliers.data?.pages.flatMap(page => page.data) ?? [],
    [suppliers.data]
  );
  const supplier = supplierList.find(item => item.id === supplierId);
  const locations = useInventoryLocations();
  const places = (locations.data ?? []).filter(
    place => place.active && ['RECEIVING', 'WAREHOUSE', 'COLD_ROOM', 'BAY'].includes(place.kind)
  );

  const [search, setSearch] = useState('');
  const q = useDebounce(search.trim(), 250);
  const found = useProducts({draft: false, ...(q ? {q} : {})});
  const products = useMemo(() => found.data?.pages.flatMap(page => page.data) ?? [], [found.data]);
  const suggestions = useStockOverview({view: 'needs_restock', sort: 'urgency', pageSize: 8});
  const recent = useGrns({limit: 6});
  const recentRows = recent.data?.pages.flatMap(page => page.data) ?? [];

  const add = (line: Line) =>
    setLines(current =>
      current.some(l => l.productId === line.productId) ? current : [...current, line]
    );

  // "Receive" on a stock row arrives with ?add=: put that product on the form once.
  const preset = useProduct(addId);
  useEffect(() => {
    if (!addId || !preset.data) return;
    add(newLine(preset.data));
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        next.delete('add');
        return next;
      },
      {replace: true}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- add once per arrival
  }, [addId, preset.data]);

  const patch = (productId: string, change: Partial<Line>) =>
    setLines(current => current.map(l => (l.productId === productId ? {...l, ...change} : l)));
  const patchCharge = (id: string, change: Partial<Charge>) =>
    setCharges(current => current.map(c => (c.id === id ? {...c, ...change} : c)));

  const ready =
    lines.length > 0 &&
    lines.every(lineReady) &&
    charges.every(charge => (charge.amountKobo ?? 0) > 0);
  const pending = create.isPending || post.isPending;
  const failure = create.error ?? post.error;

  const body = (): CreateGrnBody => ({
    ...(supplierId ? {supplierId} : {}),
    ...(supplierId && farmId ? {farmId} : {}),
    ...(!supplierId && receivedFrom.trim() ? {receivedFrom: receivedFrom.trim()} : {}),
    ...(reference.trim() ? {reference: reference.trim()} : {}),
    ...(locationId ? {locationId} : {}),
    lines: lines.map(line => ({
      productId: line.productId,
      receivedQty: Number(line.received).toFixed(3),
      acceptedQty: accepted(line),
      rejectedQty: Number(line.rejected || 0).toFixed(3),
      purchaseCostKobo: line.costKobo ?? 0,
      ...(line.harvestedOn ? {harvestedOn: line.harvestedOn} : {}),
      ...(line.expiresOn ? {expiresOn: line.expiresOn} : {}),
      hold: line.hold,
    })),
    charges: charges.map(charge => ({
      kind: charge.kind,
      amountKobo: charge.amountKobo ?? 0,
      allocateBy: charge.allocateBy,
      ...(charge.note.trim() ? {note: charge.note.trim()} : {}),
    })),
  });

  const reset = () => {
    setLines([]);
    setCharges([]);
    setSupplierId('');
    setFarmId('');
    setReceivedFrom('');
    setReference('');
    setLocationId('');
    setCreateKey(newKey());
    setPostKey(newKey());
  };

  const submit = async (andPost: boolean) => {
    if (!ready || pending) return;
    try {
      const note = await create.mutateAsync({idempotencyKey: createKey, body: body()});
      if (andPost) {
        await post.mutateAsync({id: note.id, idempotencyKey: postKey});
        toast.success(`${note.number} posted. Stock is in.`);
        reset();
      } else {
        toast.success(`${note.number} saved as a draft`);
        reset();
        void navigate(paths.stockGrns);
      }
    } catch {
      // The alert below shows the failure; the keys stay so a retry is the same request.
    }
  };

  const options = products.map(product => ({
    value: product.id,
    label: `${product.displayName} · ${product.sku}`,
  }));
  const total = lines.reduce((sum, line) => sum + (line.costKobo ?? 0), 0);
  const chargeTotal = charges.reduce((sum, charge) => sum + (charge.amountKobo ?? 0), 0);

  const suggested = suggestions.data?.items ?? [];
  const rail = (
    <StatRail
      sections={[
        {
          key: 'delivery',
          title: 'This delivery',
          meta: 'Not saved',
          rows: [
            {
              key: 'products',
              label: 'Products',
              value: lines.length,
            },
            {key: 'goods', label: 'Goods', value: formatNaira(total)},
            {
              key: 'extra',
              label: 'Extra costs',
              info: 'Transport, loading and similar costs, shared across the batches.',
              value: formatNaira(chargeTotal),
            },
            {key: 'total', label: 'Total cost', value: formatNaira(total + chargeTotal)},
          ],
        },
        {
          key: 'suggested',
          ...(suggestions.isPending || suggested.length > 0
            ? {
                cards: [
                  {
                    title: 'Suggested to buy',
                    action: (
                      <Link
                        to={paths.stockRestock}
                        className="inline-flex items-center gap-1 hover:text-ink"
                      >
                        Planner <ArrowRight aria-hidden />
                      </Link>
                    ),
                    loading: suggestions.isPending,
                    rows: suggestions.isPending
                      ? [
                          {key: 'a', label: <Skeleton className="h-4 w-28" />, value: null},
                          {key: 'b', label: <Skeleton className="h-4 w-28" />, value: null},
                        ]
                      : suggested.map(row => ({
                          key: row.productId,
                          label: row.displayName,
                          hint: `Buy ${formatQty(row.suggestedQty, row.baseUnit)}`,
                          value: (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Add ${row.displayName} with the suggested quantity`}
                              disabled={lines.some(l => l.productId === row.productId)}
                              onClick={() =>
                                add(
                                  newLine(
                                    {
                                      id: row.productId,
                                      displayName: row.displayName,
                                      sku: row.sku,
                                      baseUnit: row.baseUnit,
                                    },
                                    row.suggestedQty > 0 ? String(row.suggestedQty) : ''
                                  )
                                )
                              }
                            >
                              <Plus aria-hidden />
                            </Button>
                          ),
                        })),
                  },
                ],
              }
            : {
                empty: {
                  icon: <CalendarCheck />,
                  title: 'Nothing to restock',
                  description:
                    'Every product has enough cover for its delivery time. You can still receive any product from the form.',
                  action: (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={paths.stockRestock}>Open restock planner</Link>
                    </Button>
                  ),
                },
              }),
        },
        {
          key: 'recent',
          ...(recent.isPending || recentRows.length > 0
            ? {
                cards: [
                  {
                    title: 'Recent notes',
                    action: (
                      <Link
                        to={paths.stockGrns}
                        className="inline-flex items-center gap-1 hover:text-ink"
                      >
                        All notes <ArrowRight aria-hidden />
                      </Link>
                    ),
                    loading: recent.isPending,
                    rows: recent.isPending
                      ? [
                          {key: 'a', label: <Skeleton className="h-4 w-28" />, value: null},
                          {key: 'b', label: <Skeleton className="h-4 w-28" />, value: null},
                        ]
                      : recentRows.map(note => ({
                          key: note.id,
                          label: note.number,
                          hint: `${note.supplierName ?? note.receivedFrom ?? 'No supplier'} · ${
                            note.lineCount
                          } ${note.lineCount === 1 ? 'product' : 'products'} · ${momentText(
                            note.postedAt ?? note.createdAt
                          )}`,
                          value: (
                            <Badge tone={GRN_STATUS[note.status].tone}>
                              {GRN_STATUS[note.status].label}
                            </Badge>
                          ),
                        })),
                  },
                ],
              }
            : {
                empty: {
                  icon: <ClipboardList />,
                  title: 'No goods received notes yet',
                  description:
                    'Each delivery you receive is kept as a note, with its batches, source and cost.',
                },
              }),
        },
      ]}
    />
  );

  return (
    <PageFrame
      stackRail
      header={
        <PageHeader
          title="Receive stock"
          description="Book a delivery in as a goods received note. Each product becomes a batch with its source, dates and cost."
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to={paths.stockGrns}>Goods received</Link>
            </Button>
          }
        />
      }
    >
      <PageRail>{rail}</PageRail>
      <div>
        <section className="grid gap-5 rounded-lg border border-line bg-surface p-4">
          <form
            noValidate
            className="grid gap-5"
            onSubmit={event => {
              event.preventDefault();
              void submit(true);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Supplier" hint="Pick one, or type where it came from below.">
                <Select
                  value={supplierId || NONE}
                  onValueChange={value => {
                    setSupplierId(value === NONE ? '' : value);
                    setFarmId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No supplier record</SelectItem>
                    {supplierList.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {supplier ? (
                <Field label="Farm" hint="Optional.">
                  <Select
                    value={farmId || NONE}
                    onValueChange={value => setFarmId(value === NONE ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Not recorded</SelectItem>
                      {supplier.farms
                        .filter(farm => farm.status === 'ACTIVE')
                        .map(farm => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                <Field label="Received from" hint="Optional. A market, trader or driver.">
                  <Input
                    value={receivedFrom}
                    maxLength={200}
                    onChange={e => setReceivedFrom(e.target.value)}
                  />
                </Field>
              )}
              <Field label="Reference" hint="Optional. Invoice or waybill number.">
                <Input
                  value={reference}
                  maxLength={100}
                  onChange={e => setReference(e.target.value)}
                />
              </Field>
              <Field label="Put away in" hint="Empty uses the receiving area.">
                <Select
                  value={locationId || NONE}
                  onValueChange={value => setLocationId(value === NONE ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Receiving area</SelectItem>
                    {places.map(place => (
                      <SelectItem key={place.id} value={place.id}>
                        {place.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Add a product">
              <Combobox
                value={null}
                onChange={id => {
                  const product = products.find(p => p.id === id);
                  if (product) add(newLine(product));
                }}
                options={options}
                onSearch={setSearch}
                loading={found.isFetching}
                placeholder="Search by name or SKU"
                searchPlaceholder="Search products"
                emptyText="No product found"
              />
            </Field>

            {lines.length === 0 ? (
              <EmptyState
                icon={<PackagePlus />}
                title="No products on this delivery yet"
                description="Search for a product above, or add one from the suggestions."
              />
            ) : (
              <ul className="grid gap-3">
                {lines.map(line => {
                  const over = Number(line.rejected || 0) > Number(line.received);
                  return (
                    <li
                      key={line.productId}
                      className="grid gap-4 rounded-md border border-line p-3"
                    >
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
                          onClick={() => setLines(current => current.filter(l => l !== line))}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Received">
                          <QuantityInput
                            aria-label={`Quantity of ${line.name} received`}
                            value={line.received}
                            onChange={received => patch(line.productId, {received})}
                            unit={line.baseUnit}
                            entry={line.entry}
                            onEntryChange={entry => patch(line.productId, {entry})}
                          />
                        </Field>
                        <Field
                          label="Rejected"
                          hint={
                            Number(line.received) > 0
                              ? `Accepted: ${qtyText(accepted(line), line.baseUnit)}`
                              : 'Spoiled or short on arrival.'
                          }
                          error={over ? 'More than was received.' : undefined}
                        >
                          <QuantityInput
                            aria-label={`Quantity of ${line.name} rejected`}
                            value={line.rejected}
                            onChange={rejected => patch(line.productId, {rejected})}
                            unit={line.baseUnit}
                            entry={line.entry}
                            onEntryChange={entry => patch(line.productId, {entry})}
                          />
                        </Field>
                        <Field label="Cost of this line" hint="What you paid for the whole line.">
                          <AmountInput
                            maxNaira={STOCK_COST_MAX_NAIRA}
                            aria-label={`Cost of ${line.name}`}
                            valueKobo={line.costKobo}
                            onChangeKobo={costKobo => patch(line.productId, {costKobo})}
                          />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Harvested" hint="Optional.">
                            <Input
                              type="date"
                              value={line.harvestedOn}
                              onChange={e => patch(line.productId, {harvestedOn: e.target.value})}
                            />
                          </Field>
                          <Field label="Expires" hint="Optional.">
                            <Input
                              type="date"
                              value={line.expiresOn}
                              onChange={e => patch(line.productId, {expiresOn: e.target.value})}
                            />
                          </Field>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-body-sm">
                        <input
                          type="checkbox"
                          checked={line.hold}
                          onChange={e => patch(line.productId, {hold: e.target.checked})}
                        />
                        Hold for inspection. Not sold until released.
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-body font-semibold">Extra costs</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCharges(current => [
                      ...current,
                      {
                        id: crypto.randomUUID(),
                        kind: 'TRANSPORT',
                        amountKobo: null,
                        allocateBy: 'WEIGHT',
                        note: '',
                      },
                    ])
                  }
                >
                  <Plus aria-hidden /> Add cost
                </Button>
              </div>
              <p className="text-body-sm text-ink-muted">
                Transport, loading and similar costs are shared across the batches so each one
                carries its true cost.
              </p>
              {charges.map(charge => (
                <div
                  key={charge.id}
                  className="grid gap-3 rounded-md border border-line p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
                >
                  <Field label="Kind">
                    <Select
                      value={charge.kind}
                      onValueChange={value =>
                        patchCharge(charge.id, {kind: value as LandedCostKind})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHARGE_KINDS.map(kind => (
                          <SelectItem key={kind.code} value={kind.code}>
                            {kind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Amount">
                    <AmountInput
                      maxNaira={STOCK_COST_MAX_NAIRA}
                      aria-label="Extra cost amount"
                      valueKobo={charge.amountKobo}
                      onChangeKobo={amountKobo => patchCharge(charge.id, {amountKobo})}
                    />
                  </Field>
                  <Field label="Share">
                    <Select
                      value={charge.allocateBy}
                      onValueChange={value =>
                        patchCharge(charge.id, {allocateBy: value as Charge['allocateBy']})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALLOCATE.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove extra cost"
                    onClick={() => setCharges(current => current.filter(c => c.id !== charge.id))}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              ))}
            </div>

            {lines.length > 0 ? (
              <p className="text-body-sm text-ink-muted tabular" aria-live="polite">
                Goods {formatNaira(total)}
                {chargeTotal > 0 ? ` + extra costs ${formatNaira(chargeTotal)}` : ''} ={' '}
                <span className="font-semibold text-ink">{formatNaira(total + chargeTotal)}</span>
              </p>
            ) : null}
            {failure ? <Alert tone="danger">{errorMessage(failure)}</Alert> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!ready || pending}
                onClick={() => void submit(false)}
              >
                Save draft
              </Button>
              <Button type="submit" loading={pending} disabled={!ready}>
                <PackagePlus aria-hidden /> Receive {lines.length > 0 ? `${lines.length} ` : ''}
                {lines.length === 1 ? 'product' : 'products'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </PageFrame>
  );
}
