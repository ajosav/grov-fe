/** What a product's size quantities are counted in. Fixed when the product is added (grov-be). */
export type BaseUnit = 'g' | 'ml' | 'piece';

export const BASE_UNIT_CODES: readonly BaseUnit[] = ['g', 'ml', 'piece'];

export const BASE_UNITS: Record<
  BaseUnit,
  {
    label: string;
    noun: string;
    short: string;
    hint: string;
    /** What to tell the admin under the Quantity box, whose unit they pick beside it. */
    entryHint: string;
    placeholder: string;
  }
> = {
  g: {
    label: 'Weight',
    noun: 'grams',
    short: 'g',
    hint: 'Rice, beans, garri, meat. Quantities are in grams: 1 kg is 1000.',
    entryHint: 'Rice, beans, garri, meat. Type the amount and pick kg or g.',
    placeholder: '50',
  },
  ml: {
    label: 'Volume',
    noun: 'millilitres',
    short: 'ml',
    hint: 'Oils, sauces, drinks. Quantities are in millilitres: 1 litre is 1000.',
    entryHint: 'Oils, sauces, drinks. Type the amount and pick L or ml.',
    placeholder: '4',
  },
  piece: {
    label: 'Count',
    noun: 'pieces',
    short: 'pcs',
    hint: 'Eggs, tubers, bunches, tins, bottles, sachets, packs. Quantities are a count: a crate of 30 eggs is 30, a pack of 6 is 6.',
    entryHint:
      'Eggs, tubers, bunches, packs. Type how many are in the size: 30 for a crate of eggs, 6 for a pack of 6.',
    placeholder: '30',
  },
};

export const isBaseUnit = (value: string | null | undefined): value is BaseUnit =>
  value === 'g' || value === 'ml' || value === 'piece';

/** "grams", "millilitres" or "pieces"; the code itself for a unit this console doesn't know. */
export const unitNoun = (unit: string): string => (isBaseUnit(unit) ? BASE_UNITS[unit].noun : unit);

/** "g", "ml" or "pcs", for a field's label. */
export const unitShort = (unit: string): string =>
  isBaseUnit(unit) ? BASE_UNITS[unit].short : unit;

const trim = (value: number) => String(Number(value.toFixed(3)));

/**
 * A quantity the way a person says it: 1000 g is "1 kg", 2500 ml is "2.5 l", 12 pieces is
 * "12 pieces". Returns null for an empty or non-numeric value.
 */
export function formatAmount(quantity: string | null | undefined, unit: string): string | null {
  if (quantity === null || quantity === undefined || quantity.trim() === '') return null;
  const value = Number(quantity);
  if (!Number.isFinite(value)) return null;
  if (unit === 'g') return value >= 1000 ? `${trim(value / 1000)} kg` : `${trim(value)} g`;
  if (unit === 'ml') return value >= 1000 ? `${trim(value / 1000)} l` : `${trim(value)} ml`;
  if (unit === 'piece') return `${trim(value)} ${value === 1 ? 'piece' : 'pieces'}`;
  return `${trim(value)} ${unit}`;
}

// ── Typing a quantity in the unit people use ───────────────────────────────

/** A unit an admin can type an amount in. `factor` is how many base units it holds. */
export interface EntryUnit {
  code: string;
  short: string;
  factor: number;
}

/**
 * What an admin can type an amount in, per base unit, largest first. Sizes are still stored in
 * the base unit (grams, millilitres, pieces); this only lets "4 L" be typed as 4, not 4000.
 */
export const ENTRY_UNITS: Record<BaseUnit, readonly EntryUnit[]> = {
  g: [
    {code: 'kg', short: 'kg', factor: 1000},
    {code: 'g', short: 'g', factor: 1},
  ],
  ml: [
    {code: 'l', short: 'L', factor: 1000},
    {code: 'ml', short: 'ml', factor: 1},
  ],
  piece: [
    {code: 'dozen', short: 'dozen', factor: 12},
    {code: 'piece', short: 'pcs', factor: 1},
  ],
};

/** The entry units for a base unit; a unit this console doesn't know is entered as is. */
export function entryUnits(unit: string): readonly EntryUnit[] {
  return isBaseUnit(unit) ? ENTRY_UNITS[unit] : [{code: unit, short: unit, factor: 1}];
}

const POINT = /^(\d{0,9})(?:\.(\d{0,3}))?$/;

const toThousandths = (value: string): bigint | null => {
  const match = POINT.exec(value.trim());
  if (!match || (match[1] === '' && !match[2])) return null;
  return BigInt(match[1] || '0') * 1000n + BigInt((match[2] ?? '').padEnd(3, '0'));
};

const fromThousandths = (value: bigint): string => {
  const whole = value / 1000n;
  const fraction = String(value % 1000n)
    .padStart(3, '0')
    .replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : String(whole);
};

/** "2.5" kg → "2500" g. Empty or not a number gives "". */
export function toBaseAmount(amount: string, factor: number): string {
  const thousandths = toThousandths(amount);
  return thousandths === null ? '' : fromThousandths(thousandths * BigInt(factor));
}

/**
 * "2500" g → "2.5" kg. Returns "" for nothing, and null when the amount can't be shown in this
 * unit without rounding (1.5 g in kg), so the caller keeps what the admin typed.
 */
export function fromBaseAmount(base: string, factor: number): string | null {
  if (base.trim() === '') return '';
  const thousandths = toThousandths(base);
  if (thousandths === null || thousandths % BigInt(factor) !== 0n) return null;
  return fromThousandths(thousandths / BigInt(factor));
}

/** The largest unit the amount fits neatly (2500 g → 2.5 kg, 250 g → g, 24 → 2 dozen). */
export function pickEntryUnit(unit: string, base: string): EntryUnit {
  const units = entryUnits(unit);
  const thousandths = toThousandths(base);
  if (thousandths === null)
    return units.find(entry => entry.factor === 1 && unit === 'piece') ?? units[0]!;
  return (
    units.find(
      entry =>
        thousandths >= 1000n * BigInt(entry.factor) &&
        // Counts read better whole: 24 pieces is 2 dozen, 30 is not "2.5 dozen".
        thousandths % (BigInt(entry.factor) * (unit === 'piece' ? 1000n : 1n)) === 0n
    ) ??
    units.find(entry => entry.factor === 1) ??
    units[0]!
  );
}
