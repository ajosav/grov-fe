import {Controller, type UseFormReturn} from 'react-hook-form';

import type {AdminCity} from '@grov/models';
import {
  Card,
  Field,
  Input,
  PhoneInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@grov/ui';

import type {NewStoreValues} from '../../../lib/stores/new-store';
import {slugify} from '../../../lib/stores/store-rules';

interface StoreDetailsFieldsProps {
  form: UseFormReturn<NewStoreValues>;
  cities: AdminCity[] | undefined;
  citiesPending: boolean;
  slugEdited: boolean;
  onSlugEdited: () => void;
}

/** Name, slug, city and phone: the store's identity before its location. */
export function StoreDetailsFields({
  form,
  cities,
  citiesPending,
  slugEdited,
  onSlugEdited,
}: StoreDetailsFieldsProps) {
  const errors = form.formState.errors;
  return (
    <Card className="grid gap-4 p-5">
      <h2 className="text-title-sm">Details</h2>
      <Field
        label="Name"
        hint="Staff see this name. Customers never do."
        error={errors.name?.message}
      >
        <Input
          autoComplete="off"
          {...form.register('name', {
            onChange: event => {
              if (!slugEdited) form.setValue('slug', slugify(String(event.target.value)));
            },
          })}
        />
      </Field>
      <Field
        label="Slug"
        hint="A short id for reports and links, like bodija."
        error={errors.slug?.message}
      >
        <Input
          autoComplete="off"
          spellCheck={false}
          {...form.register('slug', {onChange: onSlugEdited})}
        />
      </Field>
      <Controller
        control={form.control}
        name="cityId"
        render={({field}) => (
          <Field label="City" error={errors.cityId?.message}>
            {citiesPending ? (
              <Skeleton className="h-12" />
            ) : (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
        )}
      />
      <Field
        label="Phone"
        optional
        hint="Riders and support call this number."
        error={errors.phone?.message}
      >
        <PhoneInput autoComplete="off" {...form.register('phone')} />
      </Field>
    </Card>
  );
}
