import {formatNaira} from '@grov/ui';

// The period window (presets, custom ranges, URL round-trip) is shared UI state.
export {
  longDay,
  PERIOD_PRESETS,
  periodParams,
  type PeriodPreset,
  type PeriodValue,
  readPeriod,
  shortDay,
  toIsoDay,
  writePeriod,
} from '@grov/ui';

/** A quantity in a product's base unit, shown in the larger unit when it reads better (D33). */
export function formatQty(value: number | null | undefined, baseUnit: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const fmt = (n: number, digits = 1) =>
    n.toLocaleString('en-NG', {maximumFractionDigits: digits, minimumFractionDigits: 0});
  if (baseUnit === 'g') return abs >= 1000 ? `${fmt(value / 1000)} kg` : `${fmt(value, 0)} g`;
  if (baseUnit === 'ml') return abs >= 1000 ? `${fmt(value / 1000)} L` : `${fmt(value, 0)} ml`;
  return `${fmt(value, 0)} ${Math.round(abs) === 1 ? 'piece' : 'pieces'}`;
}

/** Basis points as a percentage: 1250 → "12.5%". */
export function formatBps(bps: number | null | undefined, digits = 1): string {
  if (bps === null || bps === undefined) return '—';
  return `${(bps / 100).toLocaleString('en-NG', {maximumFractionDigits: digits})}%`;
}

/** A change in basis points with a sign: "+12%", "−4%". Null → no comparison. */
export function formatChange(bps: number | null | undefined): string | null {
  if (bps === null || bps === undefined) return null;
  const pct = Math.round(bps / 100);
  if (pct === 0) return '0%';
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct).toLocaleString('en-NG')}%`;
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-NG');
}

/** Compact naira for chart axes: ₦1.2m, ₦45k. */
export function formatNairaCompact(kobo: number): string {
  const naira = kobo / 100;
  const abs = Math.abs(naira);
  if (abs >= 1_000_000)
    return `₦${(naira / 1_000_000).toLocaleString('en-NG', {maximumFractionDigits: 1})}m`;
  if (abs >= 1_000)
    return `₦${(naira / 1_000).toLocaleString('en-NG', {maximumFractionDigits: 1})}k`;
  return formatNaira(kobo);
}
