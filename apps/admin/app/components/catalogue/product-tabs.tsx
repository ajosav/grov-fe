import {useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';

import {isApiError} from '@grov/api';
import {useReplacePrepOptions, useReplaceSizes, useUpdateProduct} from '@grov/hooks';
import {ErrorCode, PERMISSIONS, type Product} from '@grov/models';
import {applyFieldErrors, errorMessage, usePermissions} from '@grov/shared';
import {Badge, Card, toast} from '@grov/ui';

import {
  type AvailabilityChoice,
  availabilityError,
  detailsSchema,
  type DetailsValues,
  editDefaults,
  NO_AVAILABILITY,
  toAvailability,
  toPatchBody,
} from '../../lib/catalogue/product-details';
import {DETAILS_STEP, stepOfField} from '../../lib/catalogue/product-steps';
import {
  hasSizeErrors,
  serverSizeErrors,
  type SizeLadderErrors,
  toPrepBody,
  toPrepDrafts,
  toSizeBody,
  toSizeDrafts,
  validatePrepOptions,
  validateSizes,
} from '../../lib/catalogue/products';
import {type BaseUnit, isBaseUnit, unitNoun} from '../../lib/catalogue/units';
import {AvailabilityPicker} from './availability-picker';
import {PrepOptionsEditor} from './prep-options-editor';
import {ProductDetailsFields} from './product-details-fields';
import {ProductImages} from './product-images';
import {ProductListings} from './product-listings';
import {SaveBar} from './save-bar';
import {SizesEditor} from './sizes-editor';
import {UnitChoice} from './unit-choice';

interface TabProps {
  product: Product;
  /** Without products.manage the tab is read-only. */
  canManage: boolean;
}

export type DetailsTabName = 'details' | 'more';

/**
 * One form behind the Details and More information tabs, so a single Save covers name,
 * category, photos, where it's sold and the optional facts, as the add-product flow does.
 */
export function useDetailsEditor(product: Product, onInvalid: (tab: DetailsTabName) => void) {
  const update = useUpdateProduct();
  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: editDefaults(product),
  });
  const [initialImages, setInitialImages] = useState(product.imagePaths);
  const [imagePaths, setImagePaths] = useState(product.imagePaths);
  const [choice, setChoice] = useState<AvailabilityChoice>(NO_AVAILABILITY);
  const [showListError, setShowListError] = useState(false);

  const photosDirty = JSON.stringify(imagePaths) !== JSON.stringify(initialImages);
  const dirty = form.formState.isDirty || photosDirty || choice.mode !== 'none';
  const listProblem = choice.mode === 'none' ? undefined : availabilityError(choice);

  const discard = () => {
    form.reset(editDefaults(product));
    setImagePaths(initialImages);
    setChoice(NO_AVAILABILITY);
    setShowListError(false);
  };

  const save = form.handleSubmit(
    values => {
      const listed = toAvailability(choice);
      if (choice.mode !== 'none' && (listProblem || !listed)) {
        setShowListError(true);
        onInvalid('details');
        return;
      }
      update.mutate(
        {
          id: product.id,
          body: {
            ...toPatchBody(detailsSchema.parse(values)),
            ...(photosDirty ? {imagePaths} : {}),
            ...(listed ? {availability: listed} : {}),
          },
        },
        {
          onSuccess: saved => {
            form.reset(editDefaults(saved));
            setInitialImages(saved.imagePaths);
            setImagePaths(saved.imagePaths);
            setChoice(NO_AVAILABILITY);
            toast.success(`${saved.displayName} saved`);
          },
          onError: error => {
            if (!isApiError(error)) return;
            let bad: DetailsTabName | null = null;
            const {placed} = applyFieldErrors(form, error, {
              shelfLifeDaysOverride: 'shelfLifeDays',
            });
            for (const field of placed as (keyof DetailsValues)[]) {
              const tab = stepOfField(field) === DETAILS_STEP ? 'details' : 'more';
              if (bad !== 'details') bad = tab;
            }
            if (error.code === ErrorCode.PRODUCT_CATEGORY_INVALID) {
              form.setError('categoryId', {message: 'Choose an active category'});
              bad = 'details';
            }
            if (bad) onInvalid(bad);
          },
        }
      );
    },
    errors => {
      const fields = Object.keys(errors) as (keyof DetailsValues)[];
      onInvalid(fields.some(field => stepOfField(field) === DETAILS_STEP) ? 'details' : 'more');
    }
  );

  return {
    form,
    update,
    imagePaths,
    setImagePaths,
    choice,
    setChoice: (next: AvailabilityChoice) => {
      setChoice(next);
      setShowListError(false);
    },
    listError: showListError ? listProblem : undefined,
    dirty,
    save,
    discard,
  };
}
export type DetailsEditor = ReturnType<typeof useDetailsEditor>;

interface EditorTabProps extends TabProps {
  editor: DetailsEditor;
}

function EditorSaveBar({canManage, editor}: {canManage: boolean; editor: DetailsEditor}) {
  if (!canManage) return null;
  return (
    <SaveBar
      dirty={editor.dirty}
      saving={editor.update.isPending}
      error={editor.update.isError ? errorMessage(editor.update.error) : null}
      onDiscard={editor.discard}
    />
  );
}

/** Name, category, brand, description, photos and where it's sold. */
export function DetailsTab({product, canManage, editor}: EditorTabProps) {
  const {can} = usePermissions();
  const disabled = !canManage || editor.update.isPending;
  return (
    <form onSubmit={editor.save} noValidate className="grid max-w-3xl gap-6">
      <Card className="grid gap-6 p-5">
        <ProductDetailsFields
          form={editor.form}
          mode="edit"
          part="basics"
          sku={product.sku}
          isDraft={product.draft}
          disabled={disabled}
        />
        <section className="grid gap-3" aria-labelledby="photos-heading">
          <h2 id="photos-heading" className="text-title-sm">
            Photos
          </h2>
          <p className="text-body-sm text-ink-muted">
            Optional. The first photo is the cover. A photo that’s uploaded but not saved isn’t
            attached to the product.
          </p>
          <ProductImages
            paths={editor.imagePaths}
            onChange={editor.setImagePaths}
            disabled={disabled}
          />
        </section>
        <section className="grid gap-3" aria-labelledby="sold-heading">
          <h2 id="sold-heading" className="text-title-sm">
            Where it’s sold
          </h2>
          {product.availableAtAllStores ? (
            <p className="text-body text-ink-muted">
              <Badge tone="sky">All stores</Badge> Listed at every active store, and at every store
              added later.
            </p>
          ) : null}
          <ProductListings product={product} canChange={can(PERMISSIONS.PRODUCTS.LISTINGS_WRITE)} />
          {canManage ? <h3 className="mt-2 text-label">List at more stores</h3> : null}
          {canManage ? (
            <AvailabilityPicker
              editing
              value={editor.choice}
              onChange={editor.setChoice}
              error={editor.listError}
              disabled={disabled}
            />
          ) : null}
        </section>
      </Card>
      <EditorSaveBar canManage={canManage} editor={editor} />
    </form>
  );
}

/** The optional facts: origin, storage, grade, quality tier, shelf life, tags, allergens. */
export function MoreTab({product, canManage, editor}: EditorTabProps) {
  return (
    <form onSubmit={editor.save} noValidate className="grid max-w-3xl gap-6">
      <Card className="p-5">
        <ProductDetailsFields
          form={editor.form}
          mode="edit"
          part="more"
          sku={product.sku}
          disabled={!canManage || editor.update.isPending}
        />
      </Card>
      <EditorSaveBar canManage={canManage} editor={editor} />
    </form>
  );
}
/**
 * The sizes and prep options being edited, kept above the tabs so switching tabs doesn't lose
 * them. Sizes save first (prep prices can depend on them); only what changed is sent.
 */
export function useSizesPrepEditor(product: Product) {
  const saveSizes = useReplaceSizes();
  const savePrep = useReplacePrepOptions();
  const saveUnit = useUpdateProduct();
  /** The unit being edited. Nothing is sent until Save; a published product's unit never changes. */
  const [unit, setUnitState] = useState(product.baseUnit);
  const unitChanged = unit !== product.baseUnit;
  const [initialSizes, setInitialSizes] = useState(() => toSizeDrafts(product));
  const [sizes, setSizes] = useState(initialSizes);
  const [initialPrep, setInitialPrep] = useState(() => toPrepDrafts(product));
  const [prep, setPrep] = useState(initialPrep);
  const [showErrors, setShowErrors] = useState(false);
  const [server, setServer] = useState<SizeLadderErrors | null>(null);

  const sizesDirty = JSON.stringify(toSizeBody(sizes)) !== JSON.stringify(toSizeBody(initialSizes));
  const prepDirty = JSON.stringify(toPrepBody(prep)) !== JSON.stringify(toPrepBody(initialPrep));
  const saving = saveSizes.isPending || savePrep.isPending || saveUnit.isPending;
  const failure = saveUnit.isError
    ? saveUnit.error
    : saveSizes.isError
      ? saveSizes.error
      : savePrep.isError
        ? savePrep.error
        : null;

  /** Amounts typed in the old unit mean something else in the new one; names and prices stay. */
  const setUnit = (next: BaseUnit) => {
    if (next === unit) return;
    setUnitState(next);
    setSizes(current =>
      current.map(size => ({
        ...size,
        quantityBase: '',
        minQty: '',
        stepQty: '',
        weightMinBase: '',
        weightMaxBase: '',
        variableWeight: false,
      }))
    );
    setPrep(current => current.map(option => ({...option, perQuantityBase: ''})));
    setServer(null);
  };

  const save = () => {
    setShowErrors(true);
    if (
      hasSizeErrors(validateSizes(sizes, {requirePrice: !product.draft})) ||
      Object.keys(validatePrepOptions(prep)).length > 0
    ) {
      return;
    }
    const savePrepOptions = () => {
      if (!prepDirty) return;
      savePrep.mutate(
        {id: product.id, body: {prepOptions: toPrepBody(prep)}},
        {
          onSuccess: saved => {
            const next = toPrepDrafts(saved);
            setInitialPrep(next);
            setPrep(next);
            toast.success('Prep options saved');
          },
        }
      );
    };
    const sendSizes = () => {
      if (!sizesDirty && !unitChanged) return savePrepOptions();
      saveSizes.mutate(
        {id: product.id, body: {sizes: toSizeBody(sizes)}},
        {
          onSuccess: saved => {
            const next = toSizeDrafts(saved);
            setInitialSizes(next);
            setSizes(next);
            toast.success('Sizes saved');
            savePrepOptions();
          },
          onError: error => {
            if (!isApiError(error)) return;
            const ladder = serverSizeErrors(sizes, path => error.fieldError(path));
            if (ladder.ladder || Object.keys(ladder.rows).length > 0) setServer(ladder);
          },
        }
      );
    };
    // The unit goes first: the sizes that follow are counted in it.
    if (!unitChanged) return sendSizes();
    saveUnit.mutate({id: product.id, body: {baseUnit: unit as BaseUnit}}, {onSuccess: sendSizes});
  };

  return {
    sizes,
    setSizes: (next: typeof sizes) => {
      setSizes(next);
      setServer(null);
    },
    prep,
    setPrep,
    unit,
    setUnit,
    sizeErrors: (server ??
      (showErrors
        ? validateSizes(sizes, {requirePrice: !product.draft})
        : {rows: {}})) as SizeLadderErrors,
    prepErrors: showErrors ? validatePrepOptions(prep) : {},
    dirty: sizesDirty || prepDirty || unitChanged,
    saving,
    error: failure ? errorMessage(failure) : null,
    save,
    discard: () => {
      setUnitState(product.baseUnit);
      setSizes(initialSizes);
      setPrep(initialPrep);
      setServer(null);
      setShowErrors(false);
    },
  };
}
export type SizesPrepEditor = ReturnType<typeof useSizesPrepEditor>;

export function SizesPrepTab({product, canManage, editor}: TabProps & {editor: SizesPrepEditor}) {
  // Until it's published nothing has been sold, so the unit can still change (saved with the sizes).
  const unitOpen = product.draft && canManage && isBaseUnit(product.baseUnit);

  return (
    <div className="grid max-w-3xl gap-6">
      <Card className="grid gap-4 p-5">
        <div className="grid gap-1">
          <h2 className="text-title-md">Sizes</h2>
          <p className="text-body-sm text-ink-muted">
            Each size shoppers can buy, smallest first, counted in {unitNoun(product.baseUnit)}. A
            size you remove is retired, not deleted, because prices and past orders still point at
            it.
          </p>
        </div>
        {unitOpen ? (
          <UnitChoice
            value={editor.unit as BaseUnit}
            disabled={editor.saving}
            onChange={editor.setUnit}
          />
        ) : null}
        <SizesEditor
          drafts={editor.sizes}
          onChange={editor.setSizes}
          errors={editor.sizeErrors}
          unit={editor.unit}
          disabled={!canManage || editor.saving}
        />
      </Card>
      <Card className="grid gap-4 p-5">
        <h2 className="text-title-md">Prep options</h2>
        <PrepOptionsEditor
          drafts={editor.prep}
          onChange={editor.setPrep}
          errors={editor.prepErrors}
          unit={editor.unit}
          disabled={!canManage || editor.saving}
        />
      </Card>
      {canManage ? (
        <SaveBar
          dirty={editor.dirty}
          saving={editor.saving}
          error={editor.error}
          onSave={editor.save}
          onDiscard={editor.discard}
          saveLabel="Save changes"
        />
      ) : null}
    </div>
  );
}
