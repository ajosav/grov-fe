import {format, parseISO, subDays} from 'date-fns';

/** A window for reports: a preset, or a custom range of days. */
export const PERIOD_PRESETS = [
  {value: 'today', label: 'Today', days: 1},
  {value: '7d', label: 'Last 7 days', days: 7},
  {value: '30d', label: 'Last 30 days', days: 30},
  {value: '90d', label: 'Last 90 days', days: 90},
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number]['value'] | 'custom';

export interface PeriodValue {
  preset: PeriodPreset;
  /** Set for custom ranges only; presets resolve to the server's "ending today" default. */
  from?: string;
  to?: string;
}

const iso = (date: Date) => format(date, 'yyyy-MM-dd');

/** DD/MM for chart ticks. */
export const shortDay = (day: string) => format(parseISO(day), 'dd/MM');

/** DD/MM/YYYY (non-negotiable 8). */
export const longDay = (day: string) => format(parseISO(day), 'dd/MM/yyyy');

export const toIsoDay = iso;

/** The from/to the API needs. Presets end today (Lagos, the server's clock decides "today"). */
export function periodParams(value: PeriodValue): {from?: string; to?: string} {
  if (value.preset === 'custom') return {from: value.from, to: value.to};
  const preset = PERIOD_PRESETS.find(p => p.value === value.preset) ?? PERIOD_PRESETS[2];
  if (preset.days === 30) return {};
  const today = new Date();
  return {from: iso(subDays(today, preset.days - 1)), to: iso(today)};
}

export function readPeriod(params: URLSearchParams): PeriodValue {
  const preset = params.get('period');
  if (preset === 'custom') {
    return {preset, from: params.get('from') ?? undefined, to: params.get('to') ?? undefined};
  }
  return {preset: PERIOD_PRESETS.some(p => p.value === preset) ? (preset as PeriodPreset) : '30d'};
}

export function writePeriod(next: URLSearchParams, value: PeriodValue) {
  if (value.preset === '30d') next.delete('period');
  else next.set('period', value.preset);
  if (value.preset === 'custom' && value.from && value.to) {
    next.set('from', value.from);
    next.set('to', value.to);
  } else {
    next.delete('from');
    next.delete('to');
  }
}
