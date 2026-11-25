import type {Food} from '@grov/models';

import {BASE_UNITS, type BaseUnit, unitNoun} from '../../../lib/catalogue/units';
import type {
  PrepDraft,
  PrepRowErrors,
  SizeDraft,
  SizeLadderErrors,
} from '../../../lib/catalogue/products';
import {PrepOptionsEditor} from '../prep-options-editor';
import {SizesEditor} from '../sizes-editor';
import {UnitChoice} from '../unit-choice';

interface SizesStepProps {
  food: Food | null;
  foodUnit: BaseUnit | null;
  baseUnit: BaseUnit | null;
  showSizeErrors: boolean;
  sizes: SizeDraft[];
  sizeErrors: SizeLadderErrors;
  prep: PrepDraft[];
  prepErrors: Record<string, PrepRowErrors>;
  disabled: boolean;
  onBaseUnitChange: (unit: BaseUnit) => void;
  onSizesChange: (sizes: SizeDraft[]) => void;
  onPrepChange: (prep: PrepDraft[]) => void;
}

/** Step 2: how it is counted, each size and price, and any prep options. */
export function SizesStep({
  food,
  foodUnit,
  baseUnit,
  showSizeErrors,
  sizes,
  sizeErrors,
  prep,
  prepErrors,
  disabled,
  onBaseUnitChange,
  onSizesChange,
  onPrepChange,
}: SizesStepProps) {
  return (
    <>
      <section className="grid gap-3" aria-labelledby="sizes-heading">
        <h3 id="sizes-heading" className="text-title-sm">
          Sizes
        </h3>
        {foodUnit && food ? (
          <p className="rounded-md bg-surface-sunken p-3 text-body-sm">
            <span className="font-semibold">Counted in {unitNoun(foodUnit)}.</span>{' '}
            <span className="text-ink-muted">
              {food.name} is counted in {unitNoun(foodUnit)}, so every size is too.{' '}
              {BASE_UNITS[foodUnit].hint}
            </span>
          </p>
        ) : (
          <UnitChoice
            value={baseUnit}
            disabled={disabled}
            error={showSizeErrors && !baseUnit ? 'Choose how this product is sold.' : undefined}
            onChange={onBaseUnitChange}
          />
        )}
        {baseUnit ? (
          <SizesEditor
            drafts={sizes}
            unit={baseUnit}
            onChange={onSizesChange}
            errors={sizeErrors}
            disabled={disabled}
          />
        ) : null}
      </section>
      <section className="grid gap-3" aria-labelledby="prep-heading">
        <h3 id="prep-heading" className="text-title-sm">
          Prep options
        </h3>
        <PrepOptionsEditor
          drafts={prep}
          unit={baseUnit ?? 'g'}
          onChange={onPrepChange}
          errors={prepErrors}
          disabled={disabled}
        />
      </section>
    </>
  );
}
