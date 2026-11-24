import {describe, expect, it} from 'vitest';

import {
  addImages,
  draftSizes,
  emptyPrep,
  emptySize,
  MAX_PRODUCT_IMAGES,
  moveImage,
  parseTags,
  removeSize,
  serverSizeErrors,
  setDefaultSize,
  toPrepBody,
  toSizeBody,
  trimZeros,
  validatePrepOptions,
  validateSizes,
} from './products';

const size = (over: Partial<ReturnType<typeof emptySize>> = {}) => ({
  ...emptySize(true),
  label: '1 kg',
  quantityBase: '1000',
  ...over,
});

describe('trimZeros', () => {
  it('drops the API’s trailing decimals', () => {
    expect(trimZeros('1000.000')).toBe('1000');
    expect(trimZeros('0.500')).toBe('0.5');
    expect(trimZeros('30')).toBe('30');
    expect(trimZeros(null)).toBe('');
  });
});

describe('validateSizes', () => {
  it('accepts one default size with a quantity', () => {
    expect(validateSizes([size()])).toEqual({rows: {}});
  });

  it('asks for a price only when the product is going live', () => {
    const row = size();
    expect(validateSizes([row]).rows[row.key]).toBeUndefined();
    expect(validateSizes([row], {requirePrice: true}).rows[row.key]?.priceKobo).toBeDefined();
    const priced = size({priceKobo: 150000});
    expect(validateSizes([priced], {requirePrice: true})).toEqual({rows: {}});
  });

  it('needs a size, and exactly one default', () => {
    expect(validateSizes([]).ladder).toMatch(/at least one/);
    expect(validateSizes([size({isDefault: false})]).ladder).toMatch(/exactly one/);
    expect(validateSizes([size(), size({label: '5 kg'})]).ladder).toMatch(/exactly one/);
  });

  it('flags a missing label, a repeated label and a bad quantity', () => {
    const a = size({label: ''});
    const b = size({label: '5 kg', isDefault: false, quantityBase: '0'});
    const c = size({label: '5 KG', isDefault: false, quantityBase: '1.2345'});
    const errors = validateSizes([a, b, c]);
    expect(errors.rows[a.key]?.label).toBeDefined();
    expect(errors.rows[b.key]?.quantityBase).toBeDefined();
    expect(errors.rows[c.key]?.label).toMatch(/differ/);
    expect(errors.rows[c.key]?.quantityBase).toBeDefined();
  });

  it('needs a minimum and step when sold by weight, and a range when variable', () => {
    const row = size({sellMode: 'BY_WEIGHT', variableWeight: true});
    const errors = validateSizes([row]).rows[row.key];
    expect(errors).toMatchObject({
      minQty: expect.any(String),
      stepQty: expect.any(String),
      weightMinBase: expect.any(String),
      weightMaxBase: expect.any(String),
    });
  });

  it('keeps the heaviest at or above the lightest', () => {
    const row = size({variableWeight: true, weightMinBase: '900', weightMaxBase: '800'});
    expect(validateSizes([row]).rows[row.key]?.weightMaxBase).toMatch(/under/);
  });
});

describe('toSizeBody', () => {
  it('sends only what each mode allows', () => {
    const pack = size({minQty: '100', stepQty: '50', weightMinBase: '1', weightMaxBase: '2'});
    expect(toSizeBody([pack])).toEqual([
      {
        label: '1 kg',
        quantityBase: '1000',
        sellMode: 'PACK',
        variableWeight: false,
        isDefault: true,
      },
    ]);
    const byWeight = size({
      id: 'abc',
      sellMode: 'BY_WEIGHT',
      minQty: '250',
      stepQty: '250',
      variableWeight: true,
      weightMinBase: '900',
      weightMaxBase: '1100',
    });
    expect(toSizeBody([byWeight])[0]).toEqual({
      id: 'abc',
      label: '1 kg',
      quantityBase: '1000',
      sellMode: 'BY_WEIGHT',
      minQty: '250',
      stepQty: '250',
      variableWeight: true,
      weightMinBase: '900',
      weightMaxBase: '1100',
      isDefault: true,
    });
  });
});

describe('toSizeBody price', () => {
  it('sends the price only once it is set', () => {
    expect(toSizeBody([size()])[0]).not.toHaveProperty('priceKobo');
    expect(toSizeBody([size({priceKobo: 150000})])[0]).toMatchObject({priceKobo: 150000});
  });
});

describe('default size', () => {
  it('moves the default to one row', () => {
    const a = size();
    const b = size({label: '5 kg', isDefault: false});
    expect(setDefaultSize([a, b], b.key).map(row => row.isDefault)).toEqual([false, true]);
  });

  it('hands the default to the first row when the default is removed', () => {
    const a = size();
    const b = size({label: '5 kg', isDefault: false});
    expect(removeSize([a, b], a.key).map(row => row.isDefault)).toEqual([true]);
    expect(removeSize([a], a.key)).toEqual([]);
  });
});

describe('serverSizeErrors', () => {
  it('puts a server path on its row and field', () => {
    const a = size();
    const b = size({label: '5 kg', isDefault: false});
    const messages: Record<string, string> = {
      sizes: 'Exactly one size must be the default',
      'sizes.1.quantityBase': 'Quantity must be above 0',
    };
    const errors = serverSizeErrors([a, b], path => messages[path]);
    expect(errors.ladder).toBe('Exactly one size must be the default');
    expect(errors.rows[b.key]).toEqual({quantityBase: 'Quantity must be above 0'});
    expect(errors.rows[a.key]).toBeUndefined();
  });
});

describe('prep options', () => {
  it('needs a name, a price, and an amount for a per-amount price', () => {
    const row = {...emptyPrep(), priceMode: 'PER_QUANTITY' as const};
    expect(validatePrepOptions([row])[row.key]).toMatchObject({
      label: expect.any(String),
      priceKobo: expect.any(String),
      perQuantityBase: expect.any(String),
    });
  });

  it('allows a free option and rejects repeated names', () => {
    const a = {...emptyPrep(), label: 'Blend', priceKobo: 0};
    const b = {...emptyPrep(), label: 'blend', priceKobo: 50_000};
    const errors = validatePrepOptions([a, b]);
    expect(errors[a.key]).toBeUndefined();
    expect(errors[b.key]?.label).toMatch(/differ/);
  });

  it('sends the amount only for a per-amount price', () => {
    const flat = {...emptyPrep(), label: 'Blend', priceKobo: 20_000, perQuantityBase: '500'};
    const per = {
      ...emptyPrep(),
      label: 'Cut',
      priceMode: 'PER_QUANTITY' as const,
      priceKobo: 10_000,
      perQuantityBase: '1000',
      note: ' by the butcher ',
    };
    expect(toPrepBody([flat, per])).toEqual([
      {label: 'Blend', priceMode: 'FLAT', priceKobo: 20_000},
      {
        label: 'Cut',
        priceMode: 'PER_QUANTITY',
        priceKobo: 10_000,
        perQuantityBase: '1000',
        note: 'by the butcher',
      },
    ]);
  });
});

describe('images', () => {
  it('moves an image and stays put at the ends', () => {
    expect(moveImage(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveImage(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveImage(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
  });

  it('adds new paths in order, without repeats, up to the cap', () => {
    expect(addImages(['a'], ['b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    const many = Array.from({length: 10}, (_, i) => `p${i}`);
    expect(addImages([], many)).toHaveLength(MAX_PRODUCT_IMAGES);
  });
});

describe('parseTags', () => {
  it('trims, drops blanks and repeats, keeps order', () => {
    expect(parseTags(' local, ofada ,, Local ,staple')).toEqual(['local', 'ofada', 'staple']);
    expect(parseTags('')).toEqual([]);
  });
});

describe('draftSizes', () => {
  it('drops untouched rows and keeps one default', () => {
    const filled = size({isDefault: false});
    const blank = {...emptySize(true)};
    const kept = draftSizes([blank, filled]);
    expect(kept).toHaveLength(1);
    expect(kept[0]?.isDefault).toBe(true);
    expect(draftSizes([blank])).toEqual([]);
  });
});
