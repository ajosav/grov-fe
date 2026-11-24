import {screen} from '@testing-library/react';

import type {Api} from '@grov/api';
import type {Product} from '@grov/models';
import {renderWithProviders} from '@grov/test-utils';

import {ProductListings} from './product-listings';

const product: Product = {
  id: '01929b7a-3c3e-7c4a-9f1e-6b2f1c9d8e7a',
  sku: 'RICE-1',
  displayName: 'Rice',
  brand: null,
  categoryId: '01929b7a-3c3e-7c4a-9f1e-6b2f1c9d8e7b',
  availableAtAllStores: false,
  active: true,
  draft: false,
  createdAt: '2026-11-01T09:00:00Z',
  labelAllergenIds: [],
  shelfLifeDaysOverride: null,
  description: null,
  storageNote: null,
  originNote: null,
  grade: null,
  qualityTier: null,
  tags: [],
  sizes: [],
  prepOptions: [],
  updatedAt: '2026-11-01T09:00:00Z',
  imagePaths: [],
  baseUnit: 'g',
};

const listing = {
  storeId: '01929b7a-3c3e-7c4a-9f1e-6b2f1c9d8e7c',
  storeName: 'Bodija Market',
  active: true,
  pausedUntil: null,
  minOrderQty: null,
  updatedAt: '2026-11-01T09:00:00Z',
};

describe('ProductListings', () => {
  it('lists the stores from the array the API returns', async () => {
    const api = {
      adminProducts: {listings: vi.fn().mockResolvedValue([listing])},
    } as unknown as Partial<Api>;

    renderWithProviders(<ProductListings product={product} canChange={false} />, {api});

    expect(await screen.findByText('Bodija Market')).toBeInTheDocument();
  });

  it('says so when the product is not listed anywhere', async () => {
    const api = {
      adminProducts: {listings: vi.fn().mockResolvedValue([])},
    } as unknown as Partial<Api>;

    renderWithProviders(<ProductListings product={product} canChange={false} />, {api});

    expect(await screen.findByText(/Not listed at any store you manage yet/)).toBeInTheDocument();
  });
});
