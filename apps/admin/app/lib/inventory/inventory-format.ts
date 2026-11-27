import type {
  CountStatus,
  GrnStatus,
  InventoryLocationKind,
  Money,
  StockBalanceStatus,
  TemperatureClass,
  TransferStatus,
} from '@grov/models';
import {formatNaira} from '@grov/ui';

import {formatQty} from '../catalogue/insight-format';

type Tone = 'neutral' | 'flame' | 'leaf' | 'palm' | 'sky' | 'danger';

/** A decimal-string quantity in the product's base unit, as people say it: "12.5 kg". */
export function qtyText(qty: string | null | undefined, unit: string): string {
  if (qty === null || qty === undefined) return '—';
  const value = Number(qty);
  return Number.isFinite(value) ? formatQty(value, unit) : '—';
}

/** Money is hidden from people without `stock.cost.read`: the API sends null. */
export function costText(money: Money | null | undefined): string {
  return money ? formatNaira(money.kobo) : '—';
}

const day = new Intl.DateTimeFormat('en-NG', {dateStyle: 'medium'});
const moment = new Intl.DateTimeFormat('en-NG', {dateStyle: 'medium', timeStyle: 'short'});

export function dayText(iso: string | null | undefined): string {
  return iso ? day.format(new Date(iso)) : '—';
}

export function momentText(iso: string | null | undefined): string {
  return iso ? moment.format(new Date(iso)) : '—';
}

export const TRANSFER_STATUS: Record<TransferStatus, {label: string; tone: Tone; hint: string}> = {
  INITIATED: {label: 'Draft', tone: 'neutral', hint: 'Planned. Nothing has left the shelf.'},
  DISPATCHED: {
    label: 'Packed',
    tone: 'palm',
    hint: 'Stock is taken off the shelf and held for pickup.',
  },
  IN_TRANSIT: {label: 'On the road', tone: 'sky', hint: 'On its way to the other store.'},
  RECEIVED: {label: 'Received', tone: 'palm', hint: 'Arrived and held until checked.'},
  VERIFIED: {label: 'Checked', tone: 'leaf', hint: 'Checked by a second person.'},
  COMPLETED: {label: 'Completed', tone: 'leaf', hint: 'In stock at the destination.'},
  CANCELLED: {label: 'Cancelled', tone: 'neutral', hint: 'Stopped. Stock went back.'},
};

export const COUNT_STATUS: Record<CountStatus, {label: string; tone: Tone}> = {
  DRAFT: {label: 'Counting', tone: 'neutral'},
  SUBMITTED: {label: 'Awaiting approval', tone: 'palm'},
  POSTED: {label: 'Posted', tone: 'leaf'},
  REJECTED: {label: 'Rejected', tone: 'flame'},
};

export const GRN_STATUS: Record<GrnStatus, {label: string; tone: Tone}> = {
  DRAFT: {label: 'Draft', tone: 'neutral'},
  POSTED: {label: 'Posted', tone: 'leaf'},
  CANCELLED: {label: 'Cancelled', tone: 'neutral'},
};

export const BALANCE_STATUS: Record<StockBalanceStatus, {label: string; tone: Tone}> = {
  AVAILABLE: {label: 'Available', tone: 'leaf'},
  QUARANTINED: {label: 'On hold', tone: 'palm'},
  DAMAGED: {label: 'Damaged', tone: 'flame'},
  SPOILED: {label: 'Spoiled', tone: 'flame'},
  EXPIRED: {label: 'Expired', tone: 'flame'},
  RETURNED: {label: 'Returned', tone: 'sky'},
  PROCESSING: {label: 'Processing', tone: 'sky'},
  IN_TRANSIT: {label: 'In transit', tone: 'sky'},
};

export const LOCATION_KIND: Record<InventoryLocationKind, string> = {
  RECEIVING: 'Receiving',
  WAREHOUSE: 'Warehouse',
  COLD_ROOM: 'Cold room',
  BAY: 'Bay',
  QUARANTINE: 'Quarantine',
  IN_TRANSIT: 'In transit',
};

/** Kinds a person can create; the rest are made by the system. */
export const CREATABLE_LOCATION_KINDS = ['RECEIVING', 'WAREHOUSE', 'COLD_ROOM', 'BAY'] as const;

export const TEMPERATURE: Record<TemperatureClass, string> = {
  AMBIENT: 'Ambient',
  COOL: 'Cool',
  COLD: 'Cold',
  FROZEN: 'Frozen',
};

export const WRITE_OFF_REASONS = [
  {code: 'SPOILAGE', label: 'Spoilage'},
  {code: 'DAMAGE', label: 'Damage'},
  {code: 'EXPIRY', label: 'Expired'},
  {code: 'DRYING_LOSS', label: 'Drying loss'},
  {code: 'HANDLING_LOSS', label: 'Handling loss'},
  {code: 'THEFT', label: 'Lost or stolen'},
  {code: 'OTHER', label: 'Other'},
] as const;

export const CHARGE_KINDS = [
  {code: 'TRANSPORT', label: 'Transport'},
  {code: 'LOADING', label: 'Loading'},
  {code: 'HANDLING', label: 'Handling'},
  {code: 'PACKAGING', label: 'Packaging'},
  {code: 'INSURANCE', label: 'Insurance'},
  {code: 'OTHER', label: 'Other'},
] as const;

/** A fresh Idempotency-Key per user intent; reuse it on retry, replace it after success. */
export const newKey = (): string => crypto.randomUUID();

/**
 * Stock costs have no business ceiling: the API takes any whole-kobo total up to the largest
 * safe integer, so the cost inputs allow the same (in naira, so kobo stays exact).
 */
export const STOCK_COST_MAX_NAIRA = Math.floor(Number.MAX_SAFE_INTEGER / 100);
