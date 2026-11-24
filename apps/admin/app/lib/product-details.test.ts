import {describe, expect, it} from 'vitest';

import type {Product, SizeInput} from '@grov/models';

import {
  availabilityError,
  createDefaults,
  detailsSchema,
  editDefaults,
  NO_AVAILABILITY,
  toAvailability,
  toCreateBody,
  toPatchBody,
} from './product-details';

const sizes: SizeInput[] = [
  {label: '1 kg', quantityBase: '1000', sellMode: 'PACK', variableWeight: false, isDefault: true},
];

const filled = {
  ...createDefaults('cat-1'),
  displayName: '  Ofada rice  ',
};

describe('detailsSchema', () => {
  it('accepts a minimal product', () => {
    expect(detailsSchema.safeParse(filled).success).toBe(true);
  });

  it('checks the name and the category', () => {
    const bad = detailsSchema.safeParse({
      ...filled,
      sku: 'a b',
      displayName: ' ',
      categoryId: '',
    });
    expect(bad.success).toBe(false);
    const paths = bad.success ? [] : bad.error.issues.map(issue => issue.path[0]);
    expect(paths).toEqual(expect.arrayContaining(['displayName', 'categoryId']));
  });

  it('keeps the description to the Markdown subset', () => {
    expect(
      detailsSchema.safeParse({...filled, description: 'Sold **by the bag**.\n\n- Stone-free'})
        .success
    ).toBe(true);
    expect(detailsSchema.safeParse({...filled, description: '<b>x</b>'}).success).toBe(false);
    expect(detailsSchema.safeParse({...filled, description: '# Title'}).success).toBe(false);
  });

  it('checks shelf life and tags', () => {
    expect(detailsSchema.safeParse({...filled, shelfLifeDays: '0'}).success).toBe(false);
    expect(detailsSchema.safeParse({...filled, shelfLifeDays: '3651'}).success).toBe(false);
    expect(detailsSchema.safeParse({...filled, shelfLifeDays: '180'}).success).toBe(true);
    const many = Array.from({length: 21}, (_, i) => `t${i}`).join(',');
    expect(detailsSchema.safeParse({...filled, tags: many}).success).toBe(false);
  });
});

describe('toCreateBody', () => {
  it('trims, and leaves out what is empty', () => {
    expect(
      toCreateBody({
        values: filled,
        sizes,
        imagePaths: [],
        availability: NO_AVAILABILITY,
        baseUnit: 'g',
      })
    ).toEqual({displayName: 'Ofada rice', categoryId: 'cat-1', baseUnit: 'g', sizes});
  });

  it('carries optional fields, tags, photos and availability', () => {
    const body = toCreateBody({
      values: {
        ...filled,
        brand: ' Mama Gold ',
        shelfLifeDays: '365',
        tags: 'local, staple',
        labelAllergenIds: ['a1'],
      },
      sizes,
      imagePaths: ['images/products/a.jpg'],
      availability: {mode: 'stores', storeIds: ['s1']},
      baseUnit: 'ml',
    });
    expect(body).toMatchObject({
      baseUnit: 'ml',
      brand: 'Mama Gold',
      shelfLifeDaysOverride: 365,
      tags: ['local', 'staple'],
      labelAllergenIds: ['a1'],
      imagePaths: ['images/products/a.jpg'],
      availability: {storeIds: ['s1']},
    });
  });
});

describe('availability', () => {
  it('maps each choice', () => {
    expect(toAvailability(NO_AVAILABILITY)).toBeUndefined();
    expect(toAvailability({mode: 'all', storeIds: ['x']})).toEqual({allStores: true});
    expect(toAvailability({mode: 'stores', storeIds: ['s1', 's2']})).toEqual({
      storeIds: ['s1', 's2'],
    });
  });

  it('asks for a store when "chosen stores" is empty', () => {
    expect(availabilityError({mode: 'stores', storeIds: []})).toBeDefined();
    expect(availabilityError({mode: 'stores', storeIds: ['s1']})).toBeUndefined();
    expect(availabilityError(NO_AVAILABILITY)).toBeUndefined();
  });
});

describe('toPatchBody', () => {
  const product = {
    displayName: 'Ofada rice',
    categoryId: 'cat-1',
    brand: 'Mama Gold',
    description: null,
    storageNote: null,
    originNote: 'Ogun',
    grade: null,
    qualityTier: null,
    shelfLifeDaysOverride: 365,
    tags: ['local'],
    labelAllergenIds: [],
    active: true,
  } as unknown as Product;

  it('round-trips the product unchanged', () => {
    expect(toPatchBody(editDefaults(product))).toEqual({
      displayName: 'Ofada rice',
      categoryId: 'cat-1',
      brand: 'Mama Gold',
      description: null,
      storageNote: null,
      originNote: 'Ogun',
      grade: null,
      qualityTier: null,
      shelfLifeDaysOverride: 365,
      tags: ['local'],
      labelAllergenIds: [],
      active: true,
    });
  });

  it('sends null for a field the admin cleared', () => {
    const values = {...editDefaults(product), brand: '  ', shelfLifeDays: ''};
    expect(toPatchBody(values)).toMatchObject({brand: null, shelfLifeDaysOverride: null});
  });
});
