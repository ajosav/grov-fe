import type {UseFormReturn} from 'react-hook-form';

import type {DetailsValues} from '../../../lib/catalogue/product-details';
import type {PrepDraft, SizeDraft} from '../../../lib/catalogue/products';
import {type BaseUnit, unitNoun} from '../../../lib/catalogue/units';
import {ProductDetailsFields} from '../product-details-fields';

interface MoreStepProps {
  form: UseFormReturn<DetailsValues>;
  baseUnit: BaseUnit | null;
  sizes: SizeDraft[];
  prep: PrepDraft[];
  imageCount: number;
  categoryName: string | null;
  disabled: boolean;
}

/** Step 3: optional facts plus a summary of what will be saved. */
export function MoreStep({
  form,
  baseUnit,
  sizes,
  prep,
  imageCount,
  categoryName,
  disabled,
}: MoreStepProps) {
  const defaultSize = sizes.find(size => size.isDefault);
  return (
    <>
      <ProductDetailsFields form={form} mode="create" part="more" disabled={disabled} />
      <dl className="grid gap-2 rounded-md bg-surface-sunken p-4 text-body-sm sm:grid-cols-[8rem_1fr]">
        <dt className="text-ink-muted">Name</dt>
        <dd className="font-semibold">{form.getValues('displayName')}</dd>
        <dt className="text-ink-muted">Category</dt>
        <dd>{categoryName ?? '—'}</dd>
        <dt className="text-ink-muted">Counted in</dt>
        <dd>{baseUnit ? unitNoun(baseUnit) : '—'}</dd>
        <dt className="text-ink-muted">Sizes</dt>
        <dd>
          {sizes.length} {sizes.length === 1 ? 'size' : 'sizes'}
          {defaultSize ? `, default ${defaultSize.label}` : ''}
        </dd>
        <dt className="text-ink-muted">Prep options</dt>
        <dd>{prep.length}</dd>
        <dt className="text-ink-muted">Photos</dt>
        <dd>{imageCount}</dd>
      </dl>
    </>
  );
}
