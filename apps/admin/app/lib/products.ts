import type {PrepOptionInput, PrepPriceMode, Product, SizeInput, SizeSellMode} from '@grov/models';

/** grov-be's cap on a product's photos (product.schemas.ts). */
export const MAX_PRODUCT_IMAGES = 6;
/** Where product photos are stored. Public, so shoppers' devices can load them. */
export const PRODUCT_IMAGE_DIRECTORY = 'images/products';
export const MAX_SIZES = 20;
export const MAX_PREP_OPTIONS = 10;

const QTY = /^\d{1,9}(\.\d{1,3})?$/;

let counter = 0;
/** A stable key for a row that has no id yet. */
export const newRowKey = () => `row-${(counter += 1)}`;

// ── Sizes ────────────────────────────────────────────────────────────────

/** One row of the size ladder as the admin types it: every number is text until it's sent. */
export interface SizeDraft {
  key: string;
  /** Set for sizes that already exist; sizes left out of a save are retired. */
  id?: string;
  label: string;
  /** In the base unit: grams for solids, millilitres for liquids, or a count (30 for a crate of 30 eggs). */
  quantityBase: string;
  sellMode: SizeSellMode;
  minQty: string;
  stepQty: string;
  variableWeight: boolean;
  weightMinBase: string;
  weightMaxBase: string;
  isDefault: boolean;
  /** What the size sells for before store markups, in kobo. Null until the admin sets it. */
  priceKobo: number | null;
}

export function emptySize(isDefault = false): SizeDraft {
  return {
    key: newRowKey(),
    label: '',
    quantityBase: '',
    sellMode: 'PACK',
    minQty: '',
    stepQty: '',
    variableWeight: false,
    weightMinBase: '',
    weightMaxBase: '',
    isDefault,
    priceKobo: null,
  };
}

/** The product's live sizes. Retired sizes stay in the database (prices point at them) but aren't edited. */
export function toSizeDrafts(product: Pick<Product, 'sizes'>): SizeDraft[] {
  return product.sizes
    .filter(size => size.active)
    .map(size => ({
      key: size.id,
      id: size.id,
      label: size.label,
      quantityBase: trimZeros(size.quantityBase),
      sellMode: size.sellMode,
      minQty: trimZeros(size.minQty),
      stepQty: trimZeros(size.stepQty),
      variableWeight: size.variableWeight,
      weightMinBase: trimZeros(size.weightMinBase),
      weightMaxBase: trimZeros(size.weightMaxBase),
      isDefault: size.isDefault,
      priceKobo: size.price?.kobo ?? null,
    }));
}

/** `1000.000` → `1000`, `0.500` → `0.5`. The API always sends three decimals. */
export function trimZeros(value: string | null | undefined): string {
  if (!value) return '';
  return value.includes('.') ? value.replace(/\.?0+$/, '') : value;
}

export interface SizeRowErrors {
  label?: string;
  quantityBase?: string;
  minQty?: string;
  stepQty?: string;
  weightMinBase?: string;
  weightMaxBase?: string;
  priceKobo?: string;
}

export interface SizeLadderErrors {
  /** About the ladder as a whole (no sizes, no default). */
  ladder?: string;
  rows: Record<string, SizeRowErrors>;
}

const positive = (value: string) => QTY.test(value.trim()) && Number(value) > 0;

/**
 * The same rules as grov-be's `validateLadder`, so the admin hears about a problem before saving.
 * `requirePrice` is for a product going live: a draft can be saved with prices still to come.
 */
export function validateSizes(
  drafts: readonly SizeDraft[],
  {requirePrice = false}: {requirePrice?: boolean} = {}
): SizeLadderErrors {
  const result: SizeLadderErrors = {rows: {}};
  if (drafts.length === 0) {
    result.ladder = 'Add at least one size.';
    return result;
  }
  if (drafts.filter(draft => draft.isDefault).length !== 1) {
    result.ladder = 'Choose exactly one default size.';
  }
  const seen = new Set<string>();
  for (const draft of drafts) {
    const errors: SizeRowErrors = {};
    const label = draft.label.trim();
    if (!label) errors.label = 'Name the size, like “1 kg bag”.';
    else if (label.length > 60) errors.label = 'Keep it under 60 characters.';
    else if (seen.has(label.toLowerCase())) errors.label = 'Size names must differ.';
    seen.add(label.toLowerCase());

    if (!positive(draft.quantityBase)) {
      errors.quantityBase = 'Enter a quantity above 0, up to 3 decimals.';
    }
    if (requirePrice && (draft.priceKobo === null || draft.priceKobo <= 0)) {
      errors.priceKobo = 'Set a price above 0.';
    }
    if (draft.sellMode === 'BY_WEIGHT') {
      if (!positive(draft.minQty)) errors.minQty = 'Enter the smallest amount a shopper can buy.';
      if (!positive(draft.stepQty)) errors.stepQty = 'Enter the step between amounts.';
    }
    if (draft.variableWeight) {
      if (!positive(draft.weightMinBase)) errors.weightMinBase = 'Enter the lightest it can weigh.';
      if (!positive(draft.weightMaxBase)) {
        errors.weightMaxBase = 'Enter the heaviest it can weigh.';
      } else if (
        positive(draft.weightMinBase) &&
        Number(draft.weightMaxBase) < Number(draft.weightMinBase)
      ) {
        errors.weightMaxBase = 'The heaviest can’t be under the lightest.';
      }
    }
    if (Object.keys(errors).length > 0) result.rows[draft.key] = errors;
  }
  return result;
}

export const hasSizeErrors = (errors: SizeLadderErrors) =>
  Boolean(errors.ladder) || Object.keys(errors.rows).length > 0;

/** Send only what each mode allows: grov-be refuses a step on a pack or a range on a fixed weight. */
export function toSizeBody(drafts: readonly SizeDraft[]): SizeInput[] {
  return drafts.map(draft => ({
    ...(draft.id ? {id: draft.id} : {}),
    label: draft.label.trim(),
    quantityBase: draft.quantityBase.trim(),
    sellMode: draft.sellMode,
    ...(draft.sellMode === 'BY_WEIGHT'
      ? {minQty: draft.minQty.trim(), stepQty: draft.stepQty.trim()}
      : {}),
    variableWeight: draft.variableWeight,
    ...(draft.variableWeight
      ? {weightMinBase: draft.weightMinBase.trim(), weightMaxBase: draft.weightMaxBase.trim()}
      : {}),
    isDefault: draft.isDefault,
    ...(draft.priceKobo !== null ? {priceKobo: draft.priceKobo} : {}),
  }));
}

/** A row nobody has touched: a draft can leave these out rather than complain about them. */
export const isBlankSize = (draft: SizeDraft) =>
  !draft.label.trim() && !draft.quantityBase.trim() && draft.priceKobo === null;

/** The rows worth saving in a draft, with one default among them. */
export function draftSizes(drafts: readonly SizeDraft[]): SizeDraft[] {
  const kept = drafts.filter(draft => !isBlankSize(draft));
  if (kept.length === 0 || kept.filter(draft => draft.isDefault).length === 1) return kept;
  return kept.map((draft, index) => ({...draft, isDefault: index === 0}));
}

/** Make one row the default and clear the others. */
export function setDefaultSize(drafts: readonly SizeDraft[], key: string): SizeDraft[] {
  return drafts.map(draft => ({...draft, isDefault: draft.key === key}));
}

/** Remove a row; if it was the default, the first remaining row takes over. */
export function removeSize(drafts: readonly SizeDraft[], key: string): SizeDraft[] {
  const rest = drafts.filter(draft => draft.key !== key);
  if (rest.length === 0 || rest.some(draft => draft.isDefault)) return rest;
  return rest.map((draft, index) => ({...draft, isDefault: index === 0}));
}

/**
 * Map grov-be's `sizes.<i>.<field>` paths back onto rows, so a server-side
 * problem lands on the field it names.
 */
export function serverSizeErrors(
  drafts: readonly SizeDraft[],
  fieldError: (path: string) => string | undefined
): SizeLadderErrors {
  const result: SizeLadderErrors = {rows: {}};
  const ladder = fieldError('sizes');
  if (ladder) result.ladder = ladder;
  const fields = [
    'label',
    'quantityBase',
    'minQty',
    'stepQty',
    'weightMinBase',
    'weightMaxBase',
    'priceKobo',
  ] as const;
  drafts.forEach((draft, index) => {
    const errors: SizeRowErrors = {};
    for (const field of fields) {
      const message = fieldError(`sizes.${index}.${field}`);
      if (message) errors[field] = message;
    }
    const own = fieldError(`sizes.${index}.id`);
    if (own) errors.label = own;
    if (Object.keys(errors).length > 0) result.rows[draft.key] = errors;
  });
  return result;
}

// ── Prep options ─────────────────────────────────────────────────────────

export const PREP_PRICE_MODES: Record<PrepPriceMode, {label: string; hint: string}> = {
  FLAT: {label: 'Once per line', hint: 'One charge, however much the shopper buys.'},
  PER_PACK: {label: 'Per pack', hint: 'The price times the number of packs.'},
  PER_QUANTITY: {
    label: 'Per amount of food',
    hint: 'The price for each stated amount, in grams, millilitres or pieces.',
  },
};

export interface PrepDraft {
  key: string;
  id?: string;
  label: string;
  priceMode: PrepPriceMode;
  /** Naira as the admin sees it; prices are whole naira here. */
  priceKobo: number | null;
  perQuantityBase: string;
  note: string;
}

export function emptyPrep(): PrepDraft {
  return {
    key: newRowKey(),
    label: '',
    priceMode: 'FLAT',
    priceKobo: null,
    perQuantityBase: '',
    note: '',
  };
}

export function toPrepDrafts(product: Pick<Product, 'prepOptions'>): PrepDraft[] {
  return product.prepOptions
    .filter(option => option.active)
    .map(option => ({
      key: option.id,
      id: option.id,
      label: option.label,
      priceMode: option.priceMode,
      priceKobo: option.price.kobo,
      perQuantityBase: trimZeros(option.perQuantityBase),
      note: option.note ?? '',
    }));
}

export interface PrepRowErrors {
  label?: string;
  priceKobo?: string;
  perQuantityBase?: string;
  note?: string;
}

export function validatePrepOptions(drafts: readonly PrepDraft[]): Record<string, PrepRowErrors> {
  const result: Record<string, PrepRowErrors> = {};
  const seen = new Set<string>();
  for (const draft of drafts) {
    const errors: PrepRowErrors = {};
    const label = draft.label.trim();
    if (!label) errors.label = 'Name the option, like “Blend” or “Cut in pieces”.';
    else if (label.length > 60) errors.label = 'Keep it under 60 characters.';
    else if (seen.has(label.toLowerCase())) errors.label = 'Option names must differ.';
    seen.add(label.toLowerCase());
    if (draft.priceKobo === null) errors.priceKobo = 'Enter a price, or 0 if it’s free.';
    if (draft.priceMode === 'PER_QUANTITY') {
      if (!positive(draft.perQuantityBase)) {
        errors.perQuantityBase = 'Say how much food the price covers.';
      }
    }
    if (draft.note.trim().length > 200) errors.note = 'Keep the note under 200 characters.';
    if (Object.keys(errors).length > 0) result[draft.key] = errors;
  }
  return result;
}

export function toPrepBody(drafts: readonly PrepDraft[]): PrepOptionInput[] {
  return drafts.map(draft => ({
    ...(draft.id ? {id: draft.id} : {}),
    label: draft.label.trim(),
    priceMode: draft.priceMode,
    priceKobo: draft.priceKobo ?? 0,
    ...(draft.priceMode === 'PER_QUANTITY' ? {perQuantityBase: draft.perQuantityBase.trim()} : {}),
    ...(draft.note.trim() ? {note: draft.note.trim()} : {}),
  }));
}

// ── Images ───────────────────────────────────────────────────────────────

/** Move an item one place earlier (-1) or later (1); stays put at the ends. */
export function moveItem<T>(items: readonly T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length || index < 0 || index >= items.length) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(index, 1);
  if (moved !== undefined) next.splice(target, 0, moved);
  return next;
}

/** An image moves the same way; the first one is the cover. */
export const moveImage = moveItem<string>;

/** Add paths, keeping order, dropping repeats and stopping at the cap. */
export function addImages(current: readonly string[], added: readonly string[]): string[] {
  const merged = [...current];
  for (const path of added) {
    if (!merged.includes(path) && merged.length < MAX_PRODUCT_IMAGES) merged.push(path);
  }
  return merged;
}

// ── Tags ─────────────────────────────────────────────────────────────────

/** `local, ofada,  local` → `['local', 'ofada']`: trimmed, no blanks, no repeats, in order. */
export function parseTags(text: string): string[] {
  const tags: string[] = [];
  for (const raw of text.split(',')) {
    const tag = raw.trim();
    if (tag && !tags.some(existing => existing.toLowerCase() === tag.toLowerCase())) tags.push(tag);
  }
  return tags;
}
