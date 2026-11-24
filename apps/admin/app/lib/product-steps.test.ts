import {describe, expect, it} from 'vitest';

import {
  BASICS_FIELDS,
  firstStepWithError,
  MORE_FIELDS,
  PRODUCT_STEPS,
  SIZES_STEP,
  stepOfField,
} from './product-steps';

describe('product steps', () => {
  it('has sizes and prep options together in the middle', () => {
    expect(PRODUCT_STEPS[SIZES_STEP]).toBe('Sizes & prep options');
    expect(PRODUCT_STEPS).toHaveLength(3);
  });

  it('puts each field on its step', () => {
    for (const field of BASICS_FIELDS) expect(stepOfField(field)).toBe(0);
    for (const field of MORE_FIELDS) expect(stepOfField(field)).toBe(2);
  });

  it('finds the earliest step with an error', () => {
    expect(firstStepWithError(['tags', 'categoryId'])).toBe(0);
    expect(firstStepWithError(['tags'])).toBe(2);
    expect(firstStepWithError([])).toBeNull();
  });
});
