import type {UseFormReturn} from 'react-hook-form';

import {Card, Field, Input} from '@grov/ui';

import {MAX_RADIUS_KM, MIN_RADIUS_KM, type NewStoreValues} from '../../../lib/stores/new-store';

interface StoreLocationFieldsProps {
  form: UseFormReturn<NewStoreValues>;
}

/** Street address, map pin and the starting delivery radius. */
export function StoreLocationFields({form}: StoreLocationFieldsProps) {
  const errors = form.formState.errors;
  return (
    <Card className="grid gap-4 p-5">
      <h2 className="text-title-sm">Location</h2>
      <Field
        label="Street address"
        hint="Where riders collect orders."
        error={errors.address?.message}
      >
        <Input autoComplete="off" {...form.register('address')} />
      </Field>
      <Field
        label="Map pin"
        hint="Click the map to drop the pin, drag it to adjust, or paste coordinates."
        error={errors.coordinates?.message}
      >
        <Input
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder="7.442900, 3.907800"
          className="tabular"
          {...form.register('coordinates')}
        />
      </Field>
      <Field
        label="Starting delivery radius"
        hint={`A circle around the pin, ${MIN_RADIUS_KM}–${MAX_RADIUS_KM} km. You can reshape it afterwards.`}
        error={errors.radiusKm?.message}
      >
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step={0.5}
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            className="w-28 tabular"
            {...form.register('radiusKm', {valueAsNumber: true})}
          />
          <span className="text-body-sm text-ink-muted">km</span>
        </div>
      </Field>
    </Card>
  );
}
