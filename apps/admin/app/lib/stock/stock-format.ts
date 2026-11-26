import type {RestockSignal, RestockStatus, StockMovementKind, StockOverviewRow} from '@grov/models';
import {formatNaira} from '@grov/ui';

import {formatChange, formatQty} from '../catalogue/insight-format';

type Tone = 'neutral' | 'flame' | 'leaf' | 'palm' | 'sky';

/** How each restock status reads: its badge and the colour of its cover bar. */
export const RESTOCK_STATUS: Record<
  RestockStatus,
  {label: string; tone: Tone; bar: string; hint: string}
> = {
  OUT: {
    label: 'Out of stock',
    tone: 'flame',
    bar: 'bg-flame',
    hint: 'Nothing is available to sell. Reserved stock is already counted out.',
  },
  ORDER_NOW: {
    label: 'Order now',
    tone: 'flame',
    bar: 'bg-flame',
    hint: 'At the current sales pace this runs out before a delivery ordered today could arrive (lead time).',
  },
  ORDER_SOON: {
    label: 'Order soon',
    tone: 'palm',
    bar: 'bg-palm',
    hint: 'Enough for now, but it should be ordered within the next few days to avoid running out.',
  },
  COVERED: {
    label: 'Covered',
    tone: 'leaf',
    bar: 'bg-leaf',
    hint: 'Enough stock for the lead time plus the cover target. Nothing to order yet.',
  },
  OVERSTOCKED: {
    label: 'Overstocked',
    tone: 'sky',
    bar: 'bg-sky-strong',
    hint: 'Far more than is needed: over four times the lead time plus the cover target. Hold off buying more.',
  },
  NO_SALES: {
    label: 'No sales',
    tone: 'neutral',
    bar: 'bg-line-strong',
    hint: 'In stock, but nothing sold in the last 30 days, so there is no pace to plan a restock from. Unpaid and cancelled orders do not count.',
  },
};

export const LOW_STOCK_HINT =
  'Available stock is at or below the low-stock level set for this product. Without a level set, a product is never flagged low.';

/** Statuses that need a purchase. */
export const NEEDS_RESTOCK: readonly RestockStatus[] = ['OUT', 'ORDER_NOW', 'ORDER_SOON'];

export const MOVEMENT_KIND: Record<StockMovementKind, {label: string; detail: string; tone: Tone}> =
  {
    RECEIPT: {label: 'Received', detail: 'Stock came in', tone: 'leaf'},
    ADJUSTMENT: {label: 'Count corrected', detail: 'A count changed the total', tone: 'palm'},
    RESERVE: {label: 'Reserved', detail: 'Held for a paid order', tone: 'neutral'},
    RELEASE: {label: 'Released', detail: 'A reservation was let go', tone: 'neutral'},
    PICK: {label: 'Picked', detail: 'Taken off the shelf for an order', tone: 'neutral'},
    TRANSFER_OUT: {label: 'Transferred out', detail: 'Sent to another store', tone: 'sky'},
    TRANSFER_IN: {label: 'Transferred in', detail: 'Came from another store', tone: 'sky'},
    WRITE_OFF: {label: 'Written off', detail: 'Spoiled, damaged or lost', tone: 'flame'},
    STATUS_MOVE: {
      label: 'Condition changed',
      detail: 'Held, released or reclassified',
      tone: 'palm',
    },
    CUSTOMER_RETURN: {label: 'Customer return', detail: 'Came back from a customer', tone: 'sky'},
    SUPPLIER_RETURN: {
      label: 'Returned to supplier',
      detail: 'Sent back to the supplier',
      tone: 'flame',
    },
    CONSUMPTION: {label: 'Used', detail: 'Used up in the kitchen or processing', tone: 'neutral'},
    SAMPLE: {label: 'Sample', detail: 'Taken as a sample', tone: 'neutral'},
    COST_ADJUSTMENT: {
      label: 'Cost changed',
      detail: 'Cost restated, quantity unchanged',
      tone: 'palm',
    },
  };

/** Days of cover: "Out now", "Under a day", "4.5 days", "3+ weeks", "Over a year". */
export function formatCover(days: number | null | undefined): string {
  if (days === null || days === undefined) return '—';
  if (days <= 0) return 'Out now';
  if (days > 365) return 'Over a year';
  if (days >= 21) return `${Math.floor(days / 7)}+ weeks`;
  if (days < 1) return 'Under a day';
  const rounded = Math.round(days * 10) / 10;
  return `${rounded.toLocaleString('en-NG', {maximumFractionDigits: 1})} ${rounded === 1 ? 'day' : 'days'}`;
}

export function formatDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/** A pace in the product's unit: "12.5 kg a day". */
export function formatPace(perDay: number, unit: string): string {
  if (perDay <= 0) return 'Not selling';
  return `${formatQty(perDay, unit)} a day`;
}

/** A signed quantity from the movement log: "+50 kg", "−2 kg". The log stores decimal strings. */
export function formatMovementQty(qty: string, unit: string): string {
  const value = Number(qty);
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatQty(Math.abs(value), unit)}`;
}

/** "3 days ago", "today": for how long ago a price moved. */
export function agoText(iso: string | null, now: Date = new Date()): string | null {
  if (!iso) return null;
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

/** The base price's last move, "+14% 3 days ago", when it is big enough to matter. */
export function priceMoveText(row: StockOverviewRow, now: Date = new Date()): string | null {
  const change = formatChange(row.priceMoveBps);
  const when = agoText(row.priceMovedAt, now);
  if (!change || !when || row.priceMoveBps === null || Math.abs(row.priceMoveBps) < 100) {
    return null;
  }
  return `${change} ${when}`;
}

/** Plain-language reasons for a row, one per signal the server raised. */
export function signalCopy(
  signal: RestockSignal,
  row: StockOverviewRow,
  now: Date = new Date()
): string {
  const unit = row.baseUnit;
  switch (signal) {
    case 'RUNS_OUT_BEFORE_DELIVERY':
      return row.status === 'OUT'
        ? 'Nothing is available to sell.'
        : `Runs out in ${formatCover(row.coverDays)}, before a ${formatDays(row.leadTimeDays)} delivery could arrive.`;
    case 'BELOW_LOW_THRESHOLD':
      return `At or under your low-stock level of ${formatQty(row.lowThresholdQty, unit)}.`;
    case 'DEMAND_RISING':
      return row.trendBps === null
        ? 'Started selling this week. Planning uses the last 7 days’ pace.'
        : `Selling ${formatChange(row.trendBps)} on the week before. Planning uses the last 7 days’ pace.`;
    case 'DEMAND_FALLING':
      return `Selling ${formatChange(row.trendBps)} on the week before.`;
    case 'PRICE_RISING': {
      const when = agoText(row.priceMovedAt, now);
      const stretched = row.coverTargetUsedDays > row.coverTargetDays;
      return `Base price rose ${formatChange(row.priceMoveBps)} ${when ?? 'recently'}.${
        stretched
          ? ` The suggestion covers ${formatDays(row.coverTargetUsedDays)} instead of ${formatDays(row.coverTargetDays)} to buy ahead of it.`
          : ' Worth buying ahead of it.'
      }`;
    }
    case 'PRICE_FALLING':
      return `Base price fell ${formatChange(row.priceMoveBps)?.replace('−', '')} ${agoText(row.priceMovedAt, now) ?? 'recently'}. A good time to buy, but no need to stock deeper.`;
    case 'NO_RECENT_SALES':
      return 'Nothing sold in the last 30 days.';
  }
}

/** The sum behind a suggested quantity, so a buyer can check it. Null when nothing is suggested. */
export function suggestionMath(row: StockOverviewRow): string | null {
  if (row.suggestedQty <= 0) return null;
  const unit = row.baseUnit;
  if (row.perDay <= 0) {
    return `Brings ${formatQty(row.availableQty, unit)} up to the low-stock level of ${formatQty(row.lowThresholdQty, unit)}.`;
  }
  return `${formatPace(row.perDay, unit)} × (${formatDays(row.leadTimeDays)} delivery + ${formatDays(row.coverTargetUsedDays)} cover) − ${formatQty(row.availableQty, unit)} available = ${formatQty(row.suggestedQty, unit)}`;
}

/** "Buy 450 kg", "Order today", "Order in 3 days". */
export function reorderText(row: StockOverviewRow): string | null {
  if (row.reorderInDays === null) return null;
  if (row.reorderInDays <= 0) return 'Order today';
  return `Order within ${formatDays(row.reorderInDays)}`;
}

/** Price of one default size: "₦8,000 per 50 kg bag". */
export function packPriceText(row: StockOverviewRow): string | null {
  if (!row.basePrice) return null;
  return `${formatNaira(row.basePrice.kobo)}${row.sizeLabel ? ` · ${row.sizeLabel}` : ''}`;
}
