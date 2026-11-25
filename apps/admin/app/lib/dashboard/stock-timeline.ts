import type {CatalogueRow} from '@grov/models';

export type CoverStatus = 'OUT' | 'ORDER_NOW' | 'SOON' | 'OK';

/** Days of cover at or under which a product needs ordering now, or soon. */
export const ORDER_NOW_DAYS = 3;
export const SOON_DAYS = 7;
/** The bar in a stock timeline is full at this many days. */
export const COVER_HORIZON_DAYS = 14;

export interface StockCover {
  id: string;
  name: string;
  baseUnit: string;
  /** On hand minus reserved, base unit. */
  available: number;
  /** Average sold per day over the period, base unit. */
  perDay: number;
  /** Available ÷ per day. Zero when out of stock. */
  daysLeft: number;
  status: CoverStatus;
}

export function coverStatus(daysLeft: number): CoverStatus {
  if (daysLeft <= 0) return 'OUT';
  if (daysLeft <= ORDER_NOW_DAYS) return 'ORDER_NOW';
  if (daysLeft <= SOON_DAYS) return 'SOON';
  return 'OK';
}

/**
 * How long each product's stock lasts at the pace it sold over the period (doc 38 §8, restock):
 * available ÷ average daily sales. Products that sold nothing can't be timed unless they are out
 * of stock, and products no store counts are left out. Soonest to run out first.
 */
export function stockCover(rows: readonly CatalogueRow[], periodDays: number): StockCover[] {
  const days = Math.max(1, periodDays);
  const covers: StockCover[] = [];
  for (const row of rows) {
    if (row.availableQty === null || row.stockState === 'UNTRACKED') continue;
    const perDay = row.qtySold / days;
    const out = row.availableQty <= 0;
    if (!out && perDay <= 0) continue;
    const daysLeft = out ? 0 : row.availableQty / perDay;
    covers.push({
      id: row.id,
      name: row.displayName,
      baseUnit: row.baseUnit,
      available: Math.max(0, row.availableQty),
      perDay,
      daysLeft,
      status: coverStatus(daysLeft),
    });
  }
  return covers.sort((a, b) => a.daysLeft - b.daysLeft || b.perDay - a.perDay);
}

/** "Out now", "1 day left", "5 days left", "3+ weeks". */
export function formatDaysLeft(daysLeft: number): string {
  if (daysLeft <= 0) return 'Out now';
  if (daysLeft >= 21) return `${Math.floor(daysLeft / 7)}+ weeks`;
  const rounded = Math.max(1, Math.round(daysLeft));
  return `${rounded} ${rounded === 1 ? 'day' : 'days'} left`;
}
