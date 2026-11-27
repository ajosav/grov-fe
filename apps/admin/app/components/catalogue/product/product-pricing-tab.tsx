import {useState} from 'react';

import {Pencil} from 'lucide-react';

import {useProductPricing} from '@grov/hooks';
import type {SizePricing} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  formatNaira,
  Panel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatRail,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TrendChart,
} from '@grov/ui';

import {formatBps, formatChange, formatNairaCompact} from '../../../lib/catalogue/insight-format';
import {formatDay, formatMoment} from '../../../lib/format/dates';
import {PageRail} from '../../common/page-frame';
import {type ProductReportProps, ProductReportToolbar} from './product-report-toolbar';

export interface ProductPricingTabProps extends ProductReportProps {
  /** Opens the existing size and price editor. */
  onEditPrices: () => void;
}

const SOURCE: Record<string, string> = {
  FIELD_CAPTURE: 'Market capture',
  SUPPLIER_FEED: 'Supplier feed',
  RECEIPT: 'Purchase receipt',
  ADMIN: 'Set by an admin',
};

function markupText(row: SizePricing['stores'][number]) {
  const m = row.markup;
  if (!m.kind || m.kind === 'NONE') return 'None';
  const amount =
    m.kind === 'FIXED' ? `+${formatNaira(m.amount?.kobo ?? 0)}` : `+${formatBps(m.percentBps)}`;
  const scope =
    m.scope === 'SIZE' ? 'this size' : m.scope === 'CATEGORY' ? 'category' : 'store-wide';
  return `${amount} (${scope})`;
}

/**
 * Selling price, base price, markup and margin per size and store, with the base price's
 * history. Procurement and landed costs are not recorded, so margin is the markup over base.
 */
export function ProductPricingTab({
  product,
  storeId,
  onStore,
  stores,
  canManage,
  onEditPrices,
}: ProductPricingTabProps) {
  const pricing = useProductPricing(product.id, storeId);
  const data = pricing.data;
  const sizes = data?.sizes.filter(s => s.active) ?? [];
  const fallback = sizes.find(s => s.isDefault) ?? sizes[0];
  const [chosen, setChosen] = useState<string | undefined>();
  const size = sizes.find(s => s.sizeId === chosen) ?? fallback;
  const history = (data?.history ?? []).filter(h => h.sizeId === size?.sizeId).toReversed();
  const shopper = size?.stores.map(s => s.price.kobo) ?? [];
  const margins = size?.stores.map(s => s.marginBps).filter((m): m is number => m !== null) ?? [];
  const lastChange = history.at(-1);
  const previous = history.at(-2);
  const scheduled = sizes.flatMap(s => [
    ...(s.baseValidUntil
      ? [
          {
            key: `${s.sizeId}-base`,
            text: `${s.label}: base price valid until ${formatDay(s.baseValidUntil)}`,
          },
        ]
      : []),
    ...s.stores
      .filter(st => st.markup.validUntil)
      .map(st => ({
        key: `${s.sizeId}-${st.storeId}`,
        text: `${s.label} at ${st.storeName}: markup ends ${formatDay(st.markup.validUntil ?? '')}`,
      })),
  ]);

  const rail =
    data && size ? (
      <StatRail
        sections={[
          {
            key: 'prices',
            title: `Prices · ${size.label}`,
            visual: (
              <div className="grid gap-1">
                <span className="text-body-sm text-ink-muted">Selling price</span>
                <span className="text-title-lg tabular">
                  {shopper.length
                    ? Math.min(...shopper) === Math.max(...shopper)
                      ? formatNaira(shopper[0] ?? 0)
                      : `${formatNaira(Math.min(...shopper))}–${formatNaira(Math.max(...shopper))}`
                    : '—'}
                </span>
                <span className="text-chip text-ink-muted">
                  {shopper.length
                    ? `Base plus markup, at ${shopper.length} store${shopper.length === 1 ? '' : 's'}`
                    : 'Not priced at any store'}
                </span>
              </div>
            ),
            rows: [
              {
                key: 'base',
                label: 'Base price',
                tone: 'sky',
                value: size.base ? formatNaira(size.base.kobo) : 'Not set',
                hint: size.baseSource ? SOURCE[size.baseSource] : undefined,
              },
              {
                key: 'cost',
                label: 'Procurement cost',
                info: 'Landed cost isn’t tracked yet, so margin is the markup over base.',
                value: 'Not recorded',
              },
            ],
          },
          {
            key: 'profit',
            title: 'Profitability',
            rows: [
              {
                key: 'profit',
                label: 'Gross profit per unit',
                tone: 'leaf',
                info: 'Lowest store price less base price.',
                value:
                  size.base && shopper.length
                    ? formatNaira(Math.min(...shopper) - size.base.kobo)
                    : '—',
              },
              {
                key: 'margin',
                label: 'Gross margin',
                tone: 'palm',
                value: margins.length
                  ? Math.min(...margins) === Math.max(...margins)
                    ? formatBps(margins[0])
                    : `${formatBps(Math.min(...margins))}–${formatBps(Math.max(...margins))}`
                  : '—',
              },
              {
                key: 'change',
                label: 'Last base change',
                value: lastChange ? formatDay(lastChange.at) : '—',
                hint:
                  lastChange && previous
                    ? `${formatChange(Math.round(((lastChange.price.kobo - previous.price.kobo) / previous.price.kobo) * 10_000))} from ${formatNaira(previous.price.kobo)}`
                    : undefined,
              },
            ],
          },
          {
            key: 'scheduled',
            title: 'Scheduled changes',
            meta: scheduled.length ? `${scheduled.length}` : undefined,
            rows: [],
            note: scheduled.length ? (
              <span className="grid gap-1.5">
                {scheduled.map(item => (
                  <span key={item.key}>{item.text}</span>
                ))}
              </span>
            ) : (
              'None scheduled. Prices change when someone saves a new one.'
            ),
          },
        ]}
      />
    ) : data ? null : (
      <Skeleton className="h-64" />
    );

  if (pricing.isError) {
    return (
      <Alert tone="danger" title="Couldn’t load pricing">
        {errorMessage(pricing.error)}
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      <ProductReportToolbar
        title="Pricing and profitability"
        description="Shopper price is the base price plus the store’s markup. Procurement cost isn’t recorded, so margin is the markup over base."
        storeId={storeId}
        onStore={onStore}
        stores={stores}
      >
        {sizes.length > 1 ? (
          <Select value={size?.sizeId} onValueChange={setChosen}>
            <SelectTrigger aria-label="Size" className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizes.map(s => (
                <SelectItem key={s.sizeId} value={s.sizeId}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {canManage ? (
          <Button size="sm" variant="outline" onClick={onEditPrices}>
            <Pencil aria-hidden /> Edit prices
          </Button>
        ) : null}
      </ProductReportToolbar>

      {data && !size ? (
        <Panel>
          <p className="text-body text-ink-muted">This product has no active sizes yet.</p>
        </Panel>
      ) : null}

      <PageRail>{rail}</PageRail>
      <div className="grid gap-4">
        <Panel
          title={<>Base price over time{size ? ` · ${size.label}` : ''}</>}
          description={<>Every published base price, oldest to newest.</>}
        >
          {!data ? (
            <Skeleton className="h-60" />
          ) : history.length < 2 ? (
            <p className="text-body text-ink-muted">
              {history.length === 1
                ? `One price so far: ${formatNaira(history[0]?.price.kobo ?? 0)} since ${formatDay(history[0]?.at ?? '')}.`
                : 'No price history yet.'}
            </p>
          ) : (
            <TrendChart
              points={history.map(h => ({x: h.at, value: h.price.kobo}))}
              label="Base price"
              formatValue={v => formatNaira(v)}
              formatAxis={formatNairaCompact}
              formatX={x => formatDay(x)}
            />
          )}
        </Panel>

        <Panel
          title={<>By store{size ? ` · ${size.label}` : ''}</>}
          description={<>The shopper price at each store you can see, and the markup behind it.</>}
        >
          {!size || size.stores.length === 0 ? (
            <p className="text-body text-ink-muted">No store has a live price for this size.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Shopper price</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead>Markup</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Previous</TableHead>
                  <TableHead className="hidden lg:table-cell">Changed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {size.stores.map(row => (
                  <TableRow key={row.storeId}>
                    <TableCell className="font-semibold">{row.storeName}</TableCell>
                    <TableCell className="text-right font-semibold tabular">
                      {formatNaira(row.price.kobo)}
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {formatNaira(row.base.kobo)}
                    </TableCell>
                    <TableCell className="text-body-sm">{markupText(row)}</TableCell>
                    <TableCell className="text-right tabular">{formatBps(row.marginBps)}</TableCell>
                    <TableCell className="text-right tabular text-ink-muted">
                      {row.previousPrice
                        ? `${formatNaira(row.previousPrice.kobo)} (${formatChange(row.changeBps) ?? '—'})`
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden text-body-sm tabular lg:table-cell">
                      {formatMoment(row.changedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel
          title={<>Price adjustments</>}
          description={<>Base price history for {size?.label ?? 'this size'}, newest first.</>}
        >
          {history.length === 0 ? (
            <p className="text-body text-ink-muted">No prices recorded.</p>
          ) : (
            <ul className="grid gap-2 text-body-sm">
              {history
                .toReversed()
                .slice(0, 10)
                .map(h => (
                  <li
                    key={h.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 last:border-0"
                  >
                    <span className="font-semibold tabular">{formatNaira(h.price.kobo)}</span>
                    <span className="text-ink-muted">
                      {formatMoment(h.at)} · {SOURCE[h.source]}
                      {h.capturedByName ? ` · ${h.capturedByName}` : ''}
                    </span>
                    {h.confidence !== 'HIGH' ? (
                      <Badge tone="palm">
                        {h.confidence === 'LOW' ? 'Low' : 'Medium'} confidence
                      </Badge>
                    ) : null}
                  </li>
                ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
