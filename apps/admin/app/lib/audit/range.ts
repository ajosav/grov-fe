import {PERIOD_PRESETS, type PeriodPreset, type PeriodValue} from '@grov/ui';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Lagos is UTC+1 all year (no daylight saving). */
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

export const DEFAULT_AUDIT_PRESET: PeriodPreset = '7d';

/** The audit log opens on the last 7 days, not the 30 the reports use. */
export function readAuditPeriod(params: URLSearchParams): PeriodValue {
  const preset = params.get('period');
  if (preset === 'custom') {
    return {preset, from: params.get('from') ?? undefined, to: params.get('to') ?? undefined};
  }
  return {
    preset: PERIOD_PRESETS.some(p => p.value === preset)
      ? (preset as PeriodPreset)
      : DEFAULT_AUDIT_PRESET,
  };
}

export function writeAuditPeriod(next: URLSearchParams, value: PeriodValue) {
  if (value.preset === DEFAULT_AUDIT_PRESET) next.delete('period');
  else next.set('period', value.preset);
  if (value.preset === 'custom' && value.from && value.to) {
    next.set('from', value.from);
    next.set('to', value.to);
  } else {
    next.delete('from');
    next.delete('to');
  }
}

const lagosDay = (at: Date) => new Date(at.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);
const startOfLagosDay = (day: string) => new Date(`${day}T00:00:00+01:00`);

/**
 * The period as the instants the API takes. Presets run from the start of a Lagos day to
 * `anchor` (the moment the page was opened or refreshed, so the query key stays steady
 * between renders); a custom range ends at the end of its last Lagos day.
 */
export function auditRange(value: PeriodValue, anchor: Date): {from: string; to: string} {
  if (value.preset === 'custom' && value.from && value.to) {
    return {
      from: startOfLagosDay(value.from).toISOString(),
      to: new Date(startOfLagosDay(value.to).getTime() + DAY_MS - 1).toISOString(),
    };
  }
  const days = PERIOD_PRESETS.find(p => p.value === value.preset)?.days ?? 7;
  const firstDay = startOfLagosDay(lagosDay(anchor));
  return {
    from: new Date(firstDay.getTime() - (days - 1) * DAY_MS).toISOString(),
    to: anchor.toISOString(),
  };
}
