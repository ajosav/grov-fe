import {Plus} from 'lucide-react';
import {Controller, type UseFormReturn} from 'react-hook-form';

import {useAllergens, useCategories} from '@grov/hooks';
import {PERMISSIONS} from '@grov/models';
import {Can} from '@grov/shared';
import {Button, Combobox, Field, Input, MultiCombobox, NumberInput, Switch} from '@grov/ui';

import {categoryPath} from '../../lib/catalogue/categories';
import {DESCRIPTION_MAX, type DetailsValues} from '../../lib/catalogue/product-details';
import {CategoryDialog} from './category-dialog';
import {MarkdownField} from './markdown-field';

export interface ProductDetailsFieldsProps {
  form: UseFormReturn<DetailsValues>;
  /** An existing product shows its system-made code, unchangeable; a new one doesn't have one yet. */
  mode: 'create' | 'edit';
  sku?: string;
  /** A draft has no on/off switch: publishing it is what makes it active. */
  isDraft?: boolean;
  /** The create flow shows the fields in two steps; the edit tab shows them all. */
  part?: 'basics' | 'more' | 'all';
  disabled?: boolean;
}

/** Name, category, shopper-facing notes, allergens and tags: everything about a product except its sizes. */
export function ProductDetailsFields({
  form,
  mode,
  sku,
  isDraft = false,
  part = 'all',
  disabled,
}: ProductDetailsFieldsProps) {
  const categories = useCategories();
  const allergens = useAllergens();
  const errors = form.formState.errors;
  const current = form.watch('categoryId');

  // Only active categories take products; an inactive one the product already sits in stays selectable.
  const categoryOptions = (categories.data ?? [])
    .filter(category => category.active || category.id === current)
    .map(category => ({
      value: category.id,
      label: categoryPath(category.id, categories.data ?? []) ?? category.name,
      keywords: [category.name],
    }));

  return (
    <div className="grid gap-5">
      {part !== 'more' ? (
        <>
          <div className={mode === 'edit' ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4'}>
            <Field label="Name" error={errors.displayName?.message}>
              <Input autoComplete="off" disabled={disabled} {...form.register('displayName')} />
            </Field>
            {mode === 'edit' ? (
              <Field
                label="Product code"
                hint="Made by the system when the product was added. It can’t change."
              >
                <Input value={sku ?? ''} readOnly disabled />
              </Field>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-1">
              <Controller
                control={form.control}
                name="categoryId"
                render={({field}) => (
                  <Field
                    label="Category"
                    error={errors.categoryId?.message}
                    hint={
                      categories.isSuccess && categoryOptions.length === 0
                        ? 'No active categories yet. Add one in Categories first.'
                        : undefined
                    }
                  >
                    <Combobox
                      value={field.value || null}
                      onChange={value => field.onChange(value ?? '')}
                      options={categoryOptions}
                      loading={categories.isPending}
                      placeholder="Choose a category"
                      searchPlaceholder="Search categories"
                      emptyText="No categories found."
                    />
                  </Field>
                )}
              />
              <Can permission={PERMISSIONS.PRODUCTS.MANAGE}>
                <CategoryDialog
                  categories={categories.data ?? []}
                  onSaved={category =>
                    form.setValue('categoryId', category.id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  trigger={
                    <Button type="button" variant="ghost" size="sm" className="justify-self-start">
                      <Plus aria-hidden /> New category
                    </Button>
                  }
                />
              </Can>
            </div>
            <Field label="Brand" optional error={errors.brand?.message}>
              <Input autoComplete="off" disabled={disabled} {...form.register('brand')} />
            </Field>
          </div>

          <Controller
            control={form.control}
            name="description"
            render={({field}) => (
              <Field
                label="Description"
                optional
                hint="The pitch shoppers read: why to buy this one. Plain text, or use the toolbar for bold, italic, lists and links."
                error={errors.description?.message}
              >
                <MarkdownField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  maxLength={DESCRIPTION_MAX}
                />
              </Field>
            )}
          />
        </>
      ) : null}

      {part !== 'basics' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Origin" optional error={errors.originNote?.message}>
              <Input
                autoComplete="off"
                placeholder="Grown in Ogun State"
                disabled={disabled}
                {...form.register('originNote')}
              />
            </Field>
            <Field label="Storage" optional error={errors.storageNote?.message}>
              <Input
                autoComplete="off"
                placeholder="Keep cool and dry"
                disabled={disabled}
                {...form.register('storageNote')}
              />
            </Field>
            <Field label="Grade" optional error={errors.grade?.message}>
              <Input autoComplete="off" disabled={disabled} {...form.register('grade')} />
            </Field>
            <Field label="Quality tier" optional error={errors.qualityTier?.message}>
              <Input autoComplete="off" disabled={disabled} {...form.register('qualityTier')} />
            </Field>
            <Controller
              control={form.control}
              name="shelfLifeDays"
              render={({field}) => (
                <Field
                  label="Shelf life (days)"
                  optional
                  hint="Overrides the category’s usual shelf life for this product."
                  error={errors.shelfLifeDays?.message}
                >
                  <NumberInput
                    value={field.value}
                    onChange={field.onChange}
                    maxIntegerDigits={4}
                    disabled={disabled}
                  />
                </Field>
              )}
            />
            <Field
              label="Tags"
              optional
              hint="Separate with commas, like local, staple."
              error={errors.tags?.message}
            >
              <Input autoComplete="off" disabled={disabled} {...form.register('tags')} />
            </Field>
          </div>

          <Controller
            control={form.control}
            name="labelAllergenIds"
            render={({field}) => (
              <Field
                label="Allergens on the label"
                optional
                hint="What the pack says it contains or may contain. This is the label’s claim, separate from the food’s confirmed allergens."
                error={errors.labelAllergenIds?.message}
              >
                <MultiCombobox
                  value={field.value}
                  onChange={field.onChange}
                  loading={allergens.isPending}
                  placeholder="Choose allergens"
                  searchPlaceholder="Search allergens"
                  emptyText={allergens.isError ? 'Couldn’t load allergens.' : 'No allergens found.'}
                  options={(allergens.data ?? []).map(allergen => ({
                    value: allergen.id,
                    label: allergen.name,
                    keywords: allergen.aliases,
                  }))}
                />
              </Field>
            )}
          />
        </>
      ) : null}

      {mode === 'edit' && part !== 'more' && !isDraft ? (
        <Controller
          control={form.control}
          name="active"
          render={({field}) => (
            <div className="flex items-start justify-between gap-4 rounded-md border border-line p-3">
              <div className="grid gap-0.5">
                <label htmlFor="product-active" className="text-label">
                  Active
                </label>
                <p className="text-body-sm text-ink-muted">
                  Inactive products are hidden from shoppers and can’t be bought. Orders already
                  placed aren’t affected.
                </p>
              </div>
              <Switch
                id="product-active"
                checked={field.value}
                disabled={disabled}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />
      ) : null}
    </div>
  );
}
