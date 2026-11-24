import {Link} from 'react-router';

import type {Food} from '@grov/models';
import type {UseFormReturn} from 'react-hook-form';

import {Alert} from '@grov/ui';

import type {AvailabilityChoice, DetailsValues} from '../../../lib/catalogue/product-details';
import {paths} from '../../../paths';
import {AvailabilityPicker} from '../availability-picker';
import {ProductDetailsFields} from '../product-details-fields';
import {ProductImages} from '../product-images';

interface DetailsStepProps {
  form: UseFormReturn<DetailsValues>;
  food: Food | null;
  imagePaths: string[];
  onImagePathsChange: (paths: string[]) => void;
  availability: AvailabilityChoice;
  onAvailabilityChange: (choice: AvailabilityChoice) => void;
  listError: string | undefined;
  disabled: boolean;
}

/** Step 1: what it is, how it looks, and where it is sold. */
export function DetailsStep({
  form,
  food,
  imagePaths,
  onImagePathsChange,
  availability,
  onAvailabilityChange,
  listError,
  disabled,
}: DetailsStepProps) {
  return (
    <>
      {food ? (
        <Alert tone="info" title={`Starting from ${food.name}`}>
          The name and unit come from this food, and the product is linked to it when you save.
          {food.allergens.length > 0
            ? ` The food’s allergens (${food.allergens
                .map(allergen => allergen.name)
                .join(', ')}) already apply; add only what the pack label says on top.`
            : ''}{' '}
          <Link to={paths.newProduct} className="font-semibold underline">
            Start without a food
          </Link>
        </Alert>
      ) : null}
      <ProductDetailsFields form={form} mode="create" part="basics" disabled={disabled} />
      <section className="grid gap-3" aria-labelledby="photos-heading">
        <h3 id="photos-heading" className="text-title-sm">
          Photos
        </h3>
        <p className="text-body-sm text-ink-muted">Optional. The first photo is the cover.</p>
        <ProductImages paths={imagePaths} onChange={onImagePathsChange} disabled={disabled} />
      </section>
      <section className="grid gap-3" aria-labelledby="sold-heading">
        <h3 id="sold-heading" className="text-title-sm">
          Where it’s sold
        </h3>
        <AvailabilityPicker
          value={availability}
          onChange={onAvailabilityChange}
          error={listError}
          disabled={disabled}
        />
      </section>
    </>
  );
}
