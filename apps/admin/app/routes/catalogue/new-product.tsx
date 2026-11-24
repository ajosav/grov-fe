import {useEffect, useRef, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {ArrowLeft, X} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router';

import {isApiError} from '@grov/api';
import {
  useCategories,
  useCreateProduct,
  useFood,
  useLinkProductToFood,
  useReplacePrepOptions,
} from '@grov/hooks';
import type {Food} from '@grov/models';
import {appConfig, PERMISSIONS} from '@grov/models';
import {applyFieldErrors, errorMessage, PageHeader, toastError} from '@grov/shared';
import {Alert, Button, Card, Skeleton, toast} from '@grov/ui';

import {AvailabilityPicker} from '../../components/catalogue/availability-picker';
import {PrepOptionsEditor} from '../../components/catalogue/prep-options-editor';
import {ProductDetailsFields} from '../../components/catalogue/product-details-fields';
import {ProductImages} from '../../components/catalogue/product-images';
import {ProductStepper} from '../../components/catalogue/product-stepper';
import {SizesEditor} from '../../components/catalogue/sizes-editor';
import {UnitChoice} from '../../components/catalogue/unit-choice';
import {useUnsavedGuard} from '../../components/unsaved-guard';
import {categoryPath} from '../../lib/categories';
import {
  type AvailabilityChoice,
  availabilityError,
  createDefaults,
  detailsSchema,
  type DetailsValues,
  NO_AVAILABILITY,
  toCreateBody,
} from '../../lib/product-details';
import {
  BASICS_FIELDS,
  DETAILS_STEP,
  firstStepWithError,
  MORE_STEP,
  PRODUCT_STEPS,
  SIZES_STEP,
} from '../../lib/product-steps';
import {
  draftSizes,
  emptySize,
  hasSizeErrors,
  type PrepDraft,
  serverSizeErrors,
  type SizeDraft,
  type SizeLadderErrors,
  toPrepBody,
  toSizeBody,
  validatePrepOptions,
  validateSizes,
} from '../../lib/products';
import type {AdminRouteHandle} from '../../lib/route-access';
import {BASE_UNITS, type BaseUnit, isBaseUnit, unitNoun} from '../../lib/units';
import {paths, productPath} from '../../paths';
import type {Route} from './+types/new-product';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.MANAGE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Add product · ${appConfig.brandName} admin`},
];

const STEP_INTRO = [
  'What it is, where it belongs in Shop, how it looks and where it’s sold.',
  'Each size shoppers can buy with its price, and any prep options for a fee. Prices apply as soon as you save.',
  'Optional facts shoppers and ops find useful. Skip any you don’t have, then add the product.',
] as const;

/**
 * `?foodId=` starts the product from a food (chosen in the dialog on the Products page): the
 * name and unit come from it, and the product is linked to it once saved. Without it, the form is
 * the same as ever.
 */
export default function NewProduct() {
  const [params] = useSearchParams();
  const foodId = params.get('foodId');
  // Arriving from the picker, the food is already known; only a refresh or a pasted link fetches it.
  const location = useLocation();
  const handed = (location.state as {food?: Food} | null)?.food;
  const known = handed && handed.id === foodId ? handed : null;
  const food = useFood(known ? null : foodId);

  if (known) return <NewProductForm key={known.id} food={known} />;
  if (foodId && food.isPending) return <Skeleton className="h-64 max-w-3xl" />;
  if (foodId && food.isError) {
    return (
      <div className="grid max-w-3xl gap-4">
        <Alert tone="danger" title="Couldn’t load that food">
          {errorMessage(food.error)}
        </Alert>
        <div>
          <Button asChild variant="outline">
            <Link to={paths.newProduct}>Add a product without a food</Link>
          </Button>
        </div>
      </div>
    );
  }
  // The key restarts the form when the food changes, so its defaults always match the food.
  return <NewProductForm key={food.data?.id ?? 'none'} food={food.data ?? null} />;
}

function NewProductForm({food}: {food: Food | null}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // One key per "add product" intent, reused if the admin retries (data.md → Idempotency). grov-be
  // keeps a rejected (4xx) attempt under its key and answers a retry with that stored failure,
  // stripped of its field errors, so a rejection ends the intent: the next try gets a new key.
  const idempotencyKey = useRef(crypto.randomUUID());
  const create = useCreateProduct();
  const replacePrep = useReplacePrepOptions();
  const linkFood = useLinkProductToFood();
  const categories = useCategories();
  // The food owns the unit: the product's sizes are counted in it.
  const foodUnit = food && isBaseUnit(food.baseUnit) ? food.baseUnit : null;

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      ...createDefaults(params.get('categoryId') ?? ''),
      displayName: food?.name ?? '',
    },
  });
  const [step, setStep] = useState(DETAILS_STEP);
  const [reached, setReached] = useState(DETAILS_STEP);
  const [initialSizes] = useState<SizeDraft[]>(() => [emptySize(true)]);
  const [sizes, setSizes] = useState<SizeDraft[]>(initialSizes);
  const [baseUnit, setBaseUnit] = useState<BaseUnit | null>(foodUnit);
  const [prep, setPrep] = useState<PrepDraft[]>([]);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [availability, setAvailability] = useState<AvailabilityChoice>(NO_AVAILABILITY);
  const [showSizeErrors, setShowSizeErrors] = useState(false);
  const [showListError, setShowListError] = useState(false);
  /** A draft can leave prices out, so only going live shows a missing price as a problem. */
  const [pricesNeeded, setPricesNeeded] = useState(true);
  const [serverSizes, setServerSizes] = useState<SizeLadderErrors | null>(null);
  /** What grov-be flagged that has no field on this form (a photo, the list, the whole request). */
  const [otherErrors, setOtherErrors] = useState<string[]>([]);

  // Anything typed or chosen counts, so leaving by a link or closing the tab asks first.
  const guard = useUnsavedGuard(
    form.formState.isDirty ||
      sizes !== initialSizes ||
      prep.length > 0 ||
      imagePaths.length > 0 ||
      availability.mode !== 'none' ||
      baseUnit !== foodUnit
  );

  const goTo = (index: number) => {
    setStep(index);
    setReached(previous => Math.max(previous, index));
  };

  // Move focus to the new step's heading so keyboard and screen reader users land on it.
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  const sizeErrors: SizeLadderErrors =
    serverSizes ??
    (showSizeErrors ? validateSizes(sizes, {requirePrice: pricesNeeded}) : {rows: {}});
  const prepErrors = showSizeErrors ? validatePrepOptions(prep) : {};
  const listError = showListError ? availabilityError(availability) : undefined;
  const sizesWrong = () =>
    !baseUnit ||
    hasSizeErrors(validateSizes(sizes, {requirePrice: true})) ||
    Object.keys(validatePrepOptions(prep)).length > 0;

  const send = (values: DetailsValues, asDraft = false) => {
    create.mutate(
      {
        body: toCreateBody({
          values: detailsSchema.parse(values),
          sizes: toSizeBody(asDraft ? draftSizes(sizes) : sizes),
          imagePaths,
          availability,
          baseUnit: baseUnit ?? foodUnit ?? 'g',
          draft: asDraft,
        }),
        idempotencyKey: idempotencyKey.current,
      },
      {
        onSuccess: saved => {
          guard.allow();
          const done = () => {
            toast.success(
              asDraft ? `${saved.displayName} saved as a draft` : `${saved.displayName} added`
            );
            void navigate(productPath(saved.id));
          };
          const savePrep = () => {
            if (prep.length === 0) return done();
            // Prep options are their own call; the product already exists if this one fails.
            replacePrep.mutate(
              {id: saved.id, body: {prepOptions: toPrepBody(prep)}},
              {
                onSuccess: done,
                onError: error => {
                  toastError(
                    error,
                    `${saved.displayName} was added, but its prep options didn’t save. Add them again here.`
                  );
                  void navigate(productPath(saved.id, 'sizes'));
                },
              }
            );
          };
          if (!food) return savePrep();
          // The link to the food is its own call too; the product exists even if it fails.
          linkFood.mutate(
            {foodId: food.id, productId: saved.id},
            {
              onSuccess: savePrep,
              onError: error => {
                toastError(
                  error,
                  `${saved.displayName} was added, but couldn’t be linked to ${food.name}. Link it from the Foods page.`
                );
                savePrep();
              },
            }
          );
        },
        onError: error => {
          if (!isApiError(error)) return;
          if (error.status >= 400 && error.status < 500)
            idempotencyKey.current = crypto.randomUUID();
          const {placed, unplaced} = applyFieldErrors(form, error, {
            shelfLifeDaysOverride: 'shelfLifeDays',
          });
          const named = placed as (keyof DetailsValues)[];
          setOtherErrors(unplaced);
          const ladder = serverSizeErrors(sizes, path => error.fieldError(path));
          const ladderWrong = Boolean(ladder.ladder) || Object.keys(ladder.rows).length > 0;
          if (ladderWrong) setServerSizes(ladder);
          // Take the admin to the earliest step that has something to fix.
          const back = firstStepWithError(named);
          if (back !== null) goTo(back);
          else if (ladderWrong) goTo(SIZES_STEP);
        },
      }
    );
  };

  const next = async () => {
    if (step === DETAILS_STEP) {
      setShowListError(true);
      const valid = await form.trigger([...BASICS_FIELDS]);
      if (valid && !availabilityError(availability)) goTo(SIZES_STEP);
    } else if (step === SIZES_STEP) {
      setPricesNeeded(true);
      setShowSizeErrors(true);
      if (!sizesWrong()) goTo(MORE_STEP);
    } else {
      // Everything was checked step by step, but a value could have changed since: check once more.
      if (!(await form.trigger())) {
        const bad = Object.keys(form.formState.errors) as (keyof DetailsValues)[];
        goTo(firstStepWithError(bad) ?? DETAILS_STEP);
        return;
      }
      if (availabilityError(availability)) {
        setShowListError(true);
        goTo(DETAILS_STEP);
        return;
      }
      if (sizesWrong()) {
        setPricesNeeded(true);
        setShowSizeErrors(true);
        goTo(SIZES_STEP);
        return;
      }
      send(form.getValues());
    }
  };

  /** Save what's here without the checks that going live needs: a name and category are enough. */
  const saveDraft = async () => {
    if (!(await form.trigger())) {
      const bad = Object.keys(form.formState.errors) as (keyof DetailsValues)[];
      goTo(firstStepWithError(bad) ?? DETAILS_STEP);
      return;
    }
    const kept = draftSizes(sizes);
    const ladderWrong = kept.length > 0 && (!baseUnit || hasSizeErrors(validateSizes(kept)));
    if (ladderWrong || Object.keys(validatePrepOptions(prep)).length > 0) {
      setPricesNeeded(false);
      setShowSizeErrors(true);
      goTo(SIZES_STEP);
      return;
    }
    send(form.getValues(), true);
  };

  const busy = create.isPending || linkFood.isPending || replacePrep.isPending;
  const categoryName = categoryPath(form.getValues('categoryId'), categories.data ?? []);
  const defaultSize = sizes.find(size => size.isDefault);

  return (
    <>
      {guard.dialog}
      <Link
        to={paths.products}
        className="mb-3 inline-flex items-center gap-1 text-body-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" /> Products
      </Link>
      <PageHeader
        title="Add product"
        description="A product is one thing shoppers can buy, in one or more sizes. The system gives it a product code when you save."
      />

      <div className="grid max-w-3xl gap-6">
        <ProductStepper
          steps={PRODUCT_STEPS}
          current={step}
          reached={reached}
          onSelect={setStep}
          disabled={busy}
        />

        <form
          noValidate
          onSubmit={event => {
            // Enter in a field goes to the next step, never submits early.
            event.preventDefault();
            void next();
          }}
          className="grid gap-6"
        >
          <Card className="grid gap-6 p-5">
            <div className="grid gap-1">
              <h2 ref={heading} tabIndex={-1} className="text-title-md outline-none">
                {PRODUCT_STEPS[step]}
              </h2>
              <p className="text-body-sm text-ink-muted">{STEP_INTRO[step]}</p>
            </div>

            {step === DETAILS_STEP ? (
              <>
                {food ? (
                  <Alert tone="info" title={`Starting from ${food.name}`}>
                    The name and unit come from this food, and the product is linked to it when you
                    save.
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
                <ProductDetailsFields form={form} mode="create" part="basics" disabled={busy} />
                <section className="grid gap-3" aria-labelledby="photos-heading">
                  <h3 id="photos-heading" className="text-title-sm">
                    Photos
                  </h3>
                  <p className="text-body-sm text-ink-muted">
                    Optional. The first photo is the cover.
                  </p>
                  <ProductImages paths={imagePaths} onChange={setImagePaths} disabled={busy} />
                </section>
                <section className="grid gap-3" aria-labelledby="sold-heading">
                  <h3 id="sold-heading" className="text-title-sm">
                    Where it’s sold
                  </h3>
                  <AvailabilityPicker
                    value={availability}
                    onChange={choice => {
                      setAvailability(choice);
                      setShowListError(false);
                    }}
                    error={listError}
                    disabled={busy}
                  />
                </section>
              </>
            ) : null}

            {step === SIZES_STEP ? (
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
                      disabled={busy}
                      error={
                        showSizeErrors && !baseUnit ? 'Choose how this product is sold.' : undefined
                      }
                      onChange={choose => {
                        setBaseUnit(choose);
                        // Amounts typed in another unit would be wrong now; keep names and prices.
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
                        setServerSizes(null);
                      }}
                    />
                  )}
                  {baseUnit ? (
                    <SizesEditor
                      drafts={sizes}
                      unit={baseUnit}
                      onChange={changed => {
                        setSizes(changed);
                        setServerSizes(null);
                      }}
                      errors={sizeErrors}
                      disabled={busy}
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
                    onChange={setPrep}
                    errors={prepErrors}
                    disabled={busy}
                  />
                </section>
              </>
            ) : null}

            {step === MORE_STEP ? (
              <>
                <ProductDetailsFields form={form} mode="create" part="more" disabled={busy} />
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
                  <dd>{imagePaths.length}</dd>
                </dl>
              </>
            ) : null}
          </Card>

          {create.isError ? (
            <Alert tone="danger">
              {errorMessage(create.error)}
              {otherErrors.length > 0 ? (
                <ul className="mt-1 list-disc pl-5">
                  {otherErrors.map(message => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              ) : null}
            </Alert>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            {step > DETAILS_STEP ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            ) : null}
            <Button type="submit" loading={busy}>
              {step === MORE_STEP ? 'Add product' : 'Next'}
            </Button>
          </div>
          {/* Like a sheet's close button: a round icon below the content, centred. In the flow, so it never covers the form. */}
          <div className="flex items-center justify-center gap-3 pb-4 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              className="rounded-pill bg-surface-raised shadow-raised"
              onClick={() => void saveDraft()}
            >
              Save as draft
            </Button>
            <Button
              asChild
              variant="outline"
              size="icon"
              aria-label="Cancel and go back to products"
              className="rounded-pill bg-surface-raised shadow-raised"
            >
              <Link to={paths.products}>
                <X aria-hidden />
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
