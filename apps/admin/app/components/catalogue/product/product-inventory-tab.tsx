import {ArrowRight, Boxes, Hourglass, Lock, Store, Truck, Warehouse} from 'lucide-react';
import {Link} from 'react-router';

import {useProductStock} from '@grov/hooks';
import {PERMISSIONS, type ProductStoreStock} from '@grov/models';
import {Can, errorMessage} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Panel,
  Skeleton,
  StatStrip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {formatCount, formatQty} from '../../../lib/catalogue/insight-format';
import {formatMoment} from '../../../lib/format/dates';
import {paths} from '../../../paths';
import {STOCK_BADGE} from '../products/products-cells';
import {type ProductReportProps, ProductReportToolbar} from './product-report-toolbar';

const LISTING: Record<ProductStoreStock['listing'], string> = {
  LISTED: 'Listed',
  PAUSED: 'Paused',
  NOT_LISTED: 'Not listed',
};

const MOVEMENT: Record<string, string> = {
  RECEIPT: 'Received',
  ADJUSTMENT: 'Count corrected',
  RESERVE: 'Reserved for an order',
  RELEASE: 'Reservation released',
  PICK: 'Picked for an order',
  TRANSFER_OUT: 'Transferred out',
  TRANSFER_IN: 'Transferred in',
  WRITE_OFF: 'Written off',
};

/** Stock at each location, what is reserved, how long it lasts, and how it moved. */
export function ProductInventoryTab({product, storeId, onStore, stores}: ProductReportProps) {
  const stock = useProductStock(product.id, storeId);
  const data = stock.data;
  const unit = product.baseUnit;
  const t = data?.totals;

  return (
    <div className="grid gap-4">
      <ProductReportToolbar
        title="Inventory"
        description={`Quantities in ${unit === 'g' ? 'kg / g' : unit === 'ml' ? 'litres / ml' : 'pieces'}. Cover is available stock ÷ average daily sales over 30 days.`}
        storeId={storeId}
        onStore={onStore}
        stores={stores}
      >
        <Can permission={PERMISSIONS.STOCK.WRITE}>
          <Button asChild variant="outline" size="sm">
            <Link to={paths.stockReceipts}>
              <Boxes aria-hidden /> Receive stock
            </Link>
          </Button>
        </Can>
      </ProductReportToolbar>

      {stock.isError ? (
        <Alert tone="danger" title="Couldn’t load stock">
          {errorMessage(stock.error)}
        </Alert>
      ) : (
        <StatStrip
          loading={!t}
          stats={[
            {
              key: 'onhand',
              label: 'Physical stock',
              icon: <Warehouse />,
              tone: 'sky',
              value: formatQty(t?.onHandQty, unit),
            },
            {
              key: 'reserved',
              label: 'Reserved',
              icon: <Lock />,
              value: formatQty(t?.reservedQty, unit),
              hint: 'For paid orders',
            },
            {
              key: 'available',
              label: 'Available',
              icon: <Boxes />,
              tone: 'leaf',
              value: formatQty(t?.availableQty, unit),
            },
            {
              key: 'incoming',
              label: 'Incoming',
              icon: <Truck />,
              value: 'Not recorded',
              hint: 'Purchase orders aren’t tracked yet',
            },
            {
              key: 'cover',
              label: 'Days of cover',
              icon: <Hourglass />,
              tone: 'palm',
              value:
                t?.coverDays === null || t?.coverDays === undefined ? '—' : `${t.coverDays} days`,
              hint: t ? `${formatQty(t.soldQty30d, unit)} sold in 30 days` : undefined,
            },
            {
              key: 'stores',
              label: 'Locations',
              icon: <Store />,
              value: t ? `${formatCount(t.trackedStores)} counted` : '—',
              hint: t ? `${t.outStores} out · ${t.lowStores} low` : undefined,
            },
          ]}
        />
      )}

      <Panel
        title={<>By location</>}
        description={<>Every store you can see that lists or counts it.</>}
      >
        {stock.isPending ? (
          <Skeleton className="h-32" />
        ) : !data || data.stores.length === 0 ? (
          <EmptyState
            icon={<Boxes />}
            title="No stock records"
            description="No store you can see lists or counts this product."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Low at</TableHead>
                <TableHead className="text-right">Sold (30 days)</TableHead>
                <TableHead className="text-right">Cover</TableHead>
                <TableHead>State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.stores.map(row => (
                <TableRow key={row.storeId}>
                  <TableCell>
                    <div className="font-semibold">{row.storeName}</div>
                    {!row.storeActive ? (
                      <div className="text-body-sm text-ink-muted">Store inactive</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-body-sm">{LISTING[row.listing]}</TableCell>
                  <TableCell className="text-right tabular">
                    {row.tracked ? formatQty(row.onHandQty, unit) : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular">
                    {row.tracked ? formatQty(row.reservedQty, unit) : '—'}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular">
                    {row.tracked ? formatQty(row.availableQty, unit) : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular text-ink-muted">
                    {row.lowThresholdQty === null ? '—' : formatQty(row.lowThresholdQty, unit)}
                  </TableCell>
                  <TableCell className="text-right tabular">
                    {formatQty(row.soldQty30d, unit)}
                  </TableCell>
                  <TableCell className="text-right tabular">
                    {row.coverDays === null ? '—' : `${row.coverDays} d`}
                  </TableCell>
                  <TableCell>
                    <Badge tone={STOCK_BADGE[row.state].tone}>{STOCK_BADGE[row.state].label}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Panel
        title={<>Stock movements</>}
        description={<>The latest 50, newest first.</>}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to={paths.stockMovements}>
              Movement log <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      >
        {stock.isPending ? (
          <Skeleton className="h-32" />
        ) : !data?.movements.length ? (
          <p className="text-body text-ink-muted">No movements recorded.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Movement</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="hidden md:table-cell">By</TableHead>
                <TableHead className="hidden lg:table-cell">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.movements.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-body-sm tabular">
                    {formatMoment(m.createdAt)}
                  </TableCell>
                  <TableCell className="text-body-sm">{m.storeName}</TableCell>
                  <TableCell className="text-body-sm">{MOVEMENT[m.kind] ?? m.kind}</TableCell>
                  <TableCell className="text-right tabular">
                    {m.qty > 0 ? '+' : ''}
                    {formatQty(m.qty, unit)}
                  </TableCell>
                  <TableCell className="hidden text-body-sm md:table-cell">
                    {m.actorName ?? 'System'}
                  </TableCell>
                  <TableCell className="hidden text-body-sm text-ink-muted lg:table-cell">
                    {m.reason ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
