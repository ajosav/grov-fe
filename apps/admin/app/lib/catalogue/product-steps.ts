import type {DetailsValues} from './product-details';

/** The add-product flow, in order. */
export const PRODUCT_STEPS = ['Details', 'Sizes & prep options', 'More information'] as const;
export type ProductStep = (typeof PRODUCT_STEPS)[number];

/** Step positions, so no one counts by hand. */
export const DETAILS_STEP = 0;
export const SIZES_STEP = 1;
export const MORE_STEP = 2;

export const BASICS_FIELDS = ['displayName', 'categoryId', 'brand', 'description'] as const;
export const MORE_FIELDS = [
  'originNote',
  'storageNote',
  'grade',
  'qualityTier',
  'shelfLifeDays',
  'tags',
  'labelAllergenIds',
] as const;

/** The step a form field is on, so a server error on it can take the admin back there. */
export function stepOfField(field: keyof DetailsValues): number {
  return (BASICS_FIELDS as readonly string[]).includes(field) ? DETAILS_STEP : MORE_STEP;
}

/** The earliest step among the fields that have an error, or null if none do. */
export function firstStepWithError(fields: readonly (keyof DetailsValues)[]): number | null {
  return fields.length === 0 ? null : Math.min(...fields.map(stepOfField));
}
