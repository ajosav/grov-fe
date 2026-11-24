import {z} from 'zod';

import type {
  CreateProductBody,
  Product,
  ProductAvailability,
  SizeInput,
  UpdateProductBody,
} from '@grov/models';

import {markdownProblem} from './markdown';
import {parseTags} from './products';
import type {BaseUnit} from './units';

/** grov-be's limit on a description. */
export const DESCRIPTION_MAX = 1000;

const optionalText = (max: number, what: string) =>
  z.string().trim().max(max, `Keep ${what} under ${max} characters.`);

const baseFields = {
  displayName: z.string().trim().min(1, 'Name the product.').max(160, 'Keep the name under 160.'),
  categoryId: z.string().min(1, 'Choose a category.'),
  brand: optionalText(80, 'the brand'),
  description: optionalText(DESCRIPTION_MAX, 'the description').superRefine((text, ctx) => {
    const problem = markdownProblem(text);
    if (problem) ctx.addIssue({code: 'custom', message: problem});
  }),
  storageNote: optionalText(300, 'the storage note'),
  originNote: optionalText(300, 'the origin note'),
  grade: optionalText(40, 'the grade'),
  qualityTier: optionalText(40, 'the quality tier'),
  shelfLifeDays: z
    .string()
    .trim()
    .refine(
      value =>
        value === '' || (/^\d{1,4}$/.test(value) && Number(value) >= 1 && Number(value) <= 3650),
      {
        message: 'Leave empty, or enter whole days from 1 to 3650.',
      }
    ),
  tags: z
    .string()
    .refine(
      text => parseTags(text).every(tag => tag.length <= 40) && parseTags(text).length <= 20,
      {
        message: 'Use up to 20 tags, each under 40 characters, separated by commas.',
      }
    ),
  labelAllergenIds: z.array(z.string()).max(30, 'Pick up to 30 allergens.'),
  active: z.boolean(),
};

/** One set of form values for both modes. The SKU isn't one of them: the system makes it. */
export const detailsSchema = z.object(baseFields);
export type DetailsValues = z.input<typeof detailsSchema>;

export function createDefaults(categoryId = ''): DetailsValues {
  return {
    displayName: '',
    categoryId,
    brand: '',
    description: '',
    storageNote: '',
    originNote: '',
    grade: '',
    qualityTier: '',
    shelfLifeDays: '',
    tags: '',
    labelAllergenIds: [],
    active: true,
  };
}

export function editDefaults(product: Product): DetailsValues {
  return {
    displayName: product.displayName,
    categoryId: product.categoryId,
    brand: product.brand ?? '',
    description: product.description ?? '',
    storageNote: product.storageNote ?? '',
    originNote: product.originNote ?? '',
    grade: product.grade ?? '',
    qualityTier: product.qualityTier ?? '',
    shelfLifeDays:
      product.shelfLifeDaysOverride === null ? '' : String(product.shelfLifeDaysOverride),
    tags: product.tags.join(', '),
    labelAllergenIds: product.labelAllergenIds,
    active: product.active,
  };
}

/** What the admin chose for where a product is sold. Listing only ever adds; delisting is on Store listings. */
export interface AvailabilityChoice {
  mode: 'none' | 'all' | 'stores';
  storeIds: string[];
}

export const NO_AVAILABILITY: AvailabilityChoice = {mode: 'none', storeIds: []};

export function toAvailability(choice: AvailabilityChoice): ProductAvailability | undefined {
  if (choice.mode === 'all') return {allStores: true};
  if (choice.mode === 'stores' && choice.storeIds.length > 0) return {storeIds: choice.storeIds};
  return undefined;
}

/** "Chosen stores" with none chosen is a mistake worth catching before the request. */
export function availabilityError(choice: AvailabilityChoice): string | undefined {
  return choice.mode === 'stores' && choice.storeIds.length === 0
    ? 'Choose at least one store, or pick another option.'
    : undefined;
}

const text = (value: string) => value.trim();
const orUndefined = (value: string) => (text(value) === '' ? undefined : text(value));
const orNull = (value: string) => (text(value) === '' ? null : text(value));

export function toCreateBody(input: {
  values: DetailsValues;
  sizes: SizeInput[];
  imagePaths: string[];
  availability: AvailabilityChoice;
  baseUnit: BaseUnit;
  /** Save it unfinished: not sold, and prices can wait. */
  draft?: boolean;
}): CreateProductBody {
  const {values, sizes, imagePaths, availability, baseUnit, draft} = input;
  const brand = orUndefined(values.brand);
  const description = orUndefined(values.description);
  const storageNote = orUndefined(values.storageNote);
  const originNote = orUndefined(values.originNote);
  const grade = orUndefined(values.grade);
  const qualityTier = orUndefined(values.qualityTier);
  const tags = parseTags(values.tags);
  const listed = toAvailability(availability);
  return {
    displayName: text(values.displayName),
    categoryId: values.categoryId,
    baseUnit,
    ...(brand ? {brand} : {}),
    ...(description ? {description} : {}),
    ...(storageNote ? {storageNote} : {}),
    ...(originNote ? {originNote} : {}),
    ...(grade ? {grade} : {}),
    ...(qualityTier ? {qualityTier} : {}),
    ...(text(values.shelfLifeDays) ? {shelfLifeDaysOverride: Number(values.shelfLifeDays)} : {}),
    ...(tags.length > 0 ? {tags} : {}),
    ...(values.labelAllergenIds.length > 0 ? {labelAllergenIds: values.labelAllergenIds} : {}),
    ...(imagePaths.length > 0 ? {imagePaths} : {}),
    ...(listed ? {availability: listed} : {}),
    ...(draft ? {draft: true} : {}),
    sizes,
  };
}

/** A clear field is sent as `null`, which grov-be reads as "remove it". */
export function toPatchBody(
  values: DetailsValues,
  availability?: AvailabilityChoice
): UpdateProductBody {
  const listed = availability ? toAvailability(availability) : undefined;
  return {
    displayName: text(values.displayName),
    categoryId: values.categoryId,
    brand: orNull(values.brand),
    description: orNull(values.description),
    storageNote: orNull(values.storageNote),
    originNote: orNull(values.originNote),
    grade: orNull(values.grade),
    qualityTier: orNull(values.qualityTier),
    shelfLifeDaysOverride: text(values.shelfLifeDays) ? Number(values.shelfLifeDays) : null,
    tags: parseTags(values.tags),
    labelAllergenIds: values.labelAllergenIds,
    active: values.active,
    ...(listed ? {availability: listed} : {}),
  };
}
