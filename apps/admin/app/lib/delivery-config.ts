import type {DeliveryConfig, DeliveryConfigPatch, DeliveryConfigSource} from '@grov/models';
import {formatNaira} from '@grov/ui';

/**
 * Delivery settings: a city sets defaults, a store may override any of them
 * (ADR 0001 §1). Field order and limits mirror grov-be's `delivery-config.ts`.
 */
export const CONFIG_KEYS = [
  'deliveryDays',
  'deliveryWindow',
  'leadDays',
  'editCutoff',
  'deliveryFeeBasis',
  'deliveryFee',
  'minBasket',
] as const satisfies readonly (keyof DeliveryConfig)[];
export type ConfigKey = (typeof CONFIG_KEYS)[number];

export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

export const CONFIG_LABEL: Record<ConfigKey, string> = {
  deliveryDays: 'Delivery days',
  deliveryWindow: 'Delivery window',
  leadDays: 'Lead time',
  editCutoff: 'Edit cut-off',
  deliveryFeeBasis: 'Fee basis',
  deliveryFee: 'Delivery fee',
  minBasket: 'Minimum basket',
};

export const CONFIG_HINT: Record<ConfigKey, string> = {
  deliveryDays: 'Days riders deliver from this location.',
  deliveryWindow: 'The hours a delivery can arrive, in the city’s time zone.',
  leadDays: 'How many days after ordering the first delivery can be.',
  editCutoff: 'When customers can no longer change a delivery.',
  deliveryFeeBasis: 'A fixed fee per delivery, or a fee for each kilometre from the store.',
  deliveryFee: 'Charged per delivery, or per km when the basis is per km.',
  minBasket: 'The smallest order total accepted. ₦0 means no minimum.',
};

export const SOURCE_LABEL: Record<DeliveryConfigSource, string> = {
  DEFAULT: 'System default',
  CITY: 'City default',
  STORE: 'This store',
};

/**
 * Where an empty field starts when an admin chooses to set it. Only a
 * starting point for the inputs: what actually applies comes from grov-be.
 */
export const STARTING_VALUES: DeliveryConfig = {
  deliveryDays: ['SAT'],
  deliveryWindow: {start: '09:00', end: '18:00'},
  leadDays: 1,
  editCutoff: {daysBefore: 2, time: '18:00'},
  deliveryFeeBasis: 'FIXED',
  deliveryFee: {kobo: 400_000, currency: 'NGN'},
  minBasket: {kobo: 0, currency: 'NGN'},
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Mon–Fri style runs for consecutive days, commas between runs. */
export function formatDays(days: readonly Weekday[]): string {
  const sorted = WEEKDAYS.filter(day => days.includes(day));
  if (sorted.length === 7) return 'Every day';
  const runs: Weekday[][] = [];
  for (const day of sorted) {
    const run = runs.at(-1);
    const last = run?.at(-1);
    if (run && last && WEEKDAYS.indexOf(day) === WEEKDAYS.indexOf(last) + 1) run.push(day);
    else runs.push([day]);
  }
  return runs
    .map(run => {
      const first = run[0];
      const last = run.at(-1);
      if (!first || !last) return '';
      if (run.length >= 3) return `${WEEKDAY_LABEL[first]}–${WEEKDAY_LABEL[last]}`;
      return run.map(day => WEEKDAY_LABEL[day]).join(', ');
    })
    .join(', ');
}

/** One line per setting, for tables and "inherits …" notes. */
export function formatConfigValue<K extends ConfigKey>(
  key: K,
  value: DeliveryConfig[K],
  basis: DeliveryConfig['deliveryFeeBasis'] = 'FIXED'
): string {
  const v = value as DeliveryConfig[ConfigKey];
  switch (key) {
    case 'deliveryDays':
      return formatDays(v as Weekday[]);
    case 'deliveryWindow': {
      const w = v as DeliveryConfig['deliveryWindow'];
      return `${w.start}–${w.end}`;
    }
    case 'leadDays':
      return v === 0 ? 'Same day' : plural(v as number, 'day');
    case 'editCutoff': {
      const c = v as DeliveryConfig['editCutoff'];
      return c.daysBefore === 0
        ? `${c.time} on the day`
        : `${plural(c.daysBefore, 'day')} before, ${c.time}`;
    }
    case 'deliveryFeeBasis':
      return v === 'PER_KM' ? 'Per km' : 'Fixed';
    case 'deliveryFee': {
      const amount = formatNaira((v as DeliveryConfig['deliveryFee']).kobo);
      return basis === 'PER_KM' ? `${amount} per km` : amount;
    }
    case 'minBasket': {
      const kobo = (v as DeliveryConfig['minBasket']).kobo;
      return kobo === 0 ? 'No minimum' : formatNaira(kobo);
    }
    default:
      return '';
  }
}

/** Editor state: each setting is either inherited or set here. */
export type ConfigDraft = {
  [K in ConfigKey]: {set: boolean; value: DeliveryConfig[K]};
};

/**
 * Turns a saved patch into editor state. Unset fields start from `fallback`
 * (what applies today, when known) so switching one on shows a sensible value.
 */
export function toDraft(
  patch: DeliveryConfigPatch | undefined,
  fallback: Partial<DeliveryConfig> = {}
): ConfigDraft {
  const entry = <K extends ConfigKey>(key: K) => {
    const saved = patch?.[key] as DeliveryConfig[K] | undefined;
    return {
      set: saved !== undefined,
      value: structuredClone(saved ?? fallback[key] ?? STARTING_VALUES[key]) as DeliveryConfig[K],
    };
  };
  return {
    deliveryDays: entry('deliveryDays'),
    deliveryWindow: entry('deliveryWindow'),
    leadDays: entry('leadDays'),
    editCutoff: entry('editCutoff'),
    deliveryFeeBasis: entry('deliveryFeeBasis'),
    deliveryFee: entry('deliveryFee'),
    minBasket: entry('minBasket'),
  };
}

/** Only the settings set here; the rest inherit. */
export function toPatch(draft: ConfigDraft): DeliveryConfigPatch {
  const patch: Record<string, unknown> = {};
  for (const key of CONFIG_KEYS) {
    if (draft[key].set) patch[key] = draft[key].value;
  }
  return patch as DeliveryConfigPatch;
}

/** Mirrors grov-be's checks so mistakes show before saving. Null = fine. */
export function draftErrors(draft: ConfigDraft): Partial<Record<ConfigKey, string>> {
  const errors: Partial<Record<ConfigKey, string>> = {};
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (draft.deliveryDays.set && draft.deliveryDays.value.length === 0) {
    errors.deliveryDays = 'Pick at least one day';
  }
  if (draft.deliveryWindow.set) {
    const {start, end} = draft.deliveryWindow.value;
    if (!time.test(start) || !time.test(end))
      errors.deliveryWindow = 'Use 24-hour times, like 09:00';
    else if (start >= end) errors.deliveryWindow = 'The window must end after it starts';
  }
  if (draft.leadDays.set) {
    const n = draft.leadDays.value;
    if (!Number.isInteger(n) || n < 0 || n > 14) errors.leadDays = 'Use 0 to 14 days';
  }
  if (draft.editCutoff.set) {
    const {daysBefore, time: at} = draft.editCutoff.value;
    if (!Number.isInteger(daysBefore) || daysBefore < 0 || daysBefore > 7) {
      errors.editCutoff = 'Use 0 to 7 days before';
    } else if (!time.test(at)) errors.editCutoff = 'Use a 24-hour time, like 18:00';
  }
  for (const key of ['deliveryFee', 'minBasket'] as const) {
    if (draft[key].set) {
      const kobo = draft[key].value.kobo;
      if (!Number.isInteger(kobo) || kobo < 0) errors[key] = 'Enter an amount';
    }
  }
  return errors;
}
