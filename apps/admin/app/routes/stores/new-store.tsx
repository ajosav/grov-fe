import {useEffect, useMemo, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {ArrowLeft} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {Link, useNavigate} from 'react-router';
import {z} from 'zod';

import {isApiError} from '@grov/api';
import {useCities, useCreateStore, useSetDeliveryZone, useStores} from '@grov/hooks';
import {appConfig, PERMISSIONS, type Pin} from '@grov/models';
import {
  applyFieldErrors,
  errorMessage,
  NoAccess,
  PageHeader,
  toastError,
  usePermissions,
} from '@grov/shared';
import {
  Alert,
  Button,
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
  Switch,
  toast,
  toE164Nigeria,
} from '@grov/ui';

import {LazyStoreMap} from '../../components/stores/lazy-store-map';
import {circleZone, formatCoordinates, parseCoordinates, ZONE_RULES} from '../../lib/geo';
import type {AdminRouteHandle} from '../../lib/route-access';
import {cityView, DEFAULT_RADIUS_KM, hasAllStores, slugify} from '../../lib/stores';
import {paths, storePath} from '../../paths';
import type {Route} from './+types/new-store';

export const handle = {
  requires: {allOf: [PERMISSIONS.STORES.MANAGE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Add store · ${appConfig.brandName} admin`}];

const minKm = ZONE_RULES.circleRadiusMinMetres / 1000;
const maxKm = ZONE_RULES.circleRadiusMaxMetres / 1000;

const schema = z.object({
  name: z.string().trim().min(1, 'Name the store').max(120),
  slug: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters')
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lower-case letters, numbers and single hyphens'),
  cityId: z.string().min(1, 'Pick the city'),
  address: z.string().trim().min(1, 'Enter the street address riders collect from').max(300),
  phone: z
    .string()
    .trim()
    .refine(
      v => v === '' || toE164Nigeria(v) !== null,
      'Enter a Nigerian phone number, like 0803 123 4567'
    ),
  coordinates: z
    .string()
    .refine(
      v => parseCoordinates(v) !== null,
      'Drop the pin on the map, or paste coordinates like 7.4429, 3.9078'
    ),
  radiusKm: z
    .number({error: 'Enter a radius in km'})
    .min(minKm, `Use at least ${minKm} km`)
    .max(maxKm, `Use at most ${maxKm} km`),
  openNow: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function NewStore() {
  const {access} = usePermissions();
  if (!hasAllStores(access?.admin)) {
    return (
      <NoAccess
        title="Only admins over every store can add one"
        description="Ask an admin with access to all stores to add it, then to give you access."
      />
    );
  }
  return <NewStoreForm />;
}

function NewStoreForm() {
  const navigate = useNavigate();
  const cities = useCities();
  const create = useCreateStore();
  const setZone = useSetDeliveryZone();
  // One key per "add store" intent, reused if the admin retries (data.md → Idempotency).
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [slugEdited, setSlugEdited] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      cityId: '',
      address: '',
      phone: '',
      coordinates: '',
      radiusKm: DEFAULT_RADIUS_KM,
      openNow: false,
    },
  });

  // Pick the city for them when there's only one.
  const cityId = form.watch('cityId');
  const onlyCity = cities.data?.length === 1 ? cities.data[0]?.id : undefined;
  useEffect(() => {
    if (onlyCity && !form.getValues('cityId')) form.setValue('cityId', onlyCity);
  }, [onlyCity, form]);
  const city = cities.data?.find(c => c.id === cityId);
  const others = useStores({cityId: cityId || undefined});
  const nearby = others.data?.pages[0]?.data[0]?.location;
  const fallbackCenter: Pin = nearby ?? cityView(city?.code);

  const pin = parseCoordinates(form.watch('coordinates'));
  const radiusKm = form.watch('radiusKm');
  const preview = useMemo(
    () => (pin && radiusKm >= minKm && radiusKm <= maxKm ? circleZone(pin, radiusKm * 1000) : null),
    // pin is re-created each render; its numbers are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pin?.lat, pin?.lng, radiusKm]
  );

  const movePin = (next: Pin) =>
    form.setValue('coordinates', formatCoordinates(next), {shouldValidate: true});

  const submit = form.handleSubmit(values => {
    const location = parseCoordinates(values.coordinates);
    if (!location) return;
    create.mutate(
      {
        idempotencyKey,
        body: {
          name: values.name,
          slug: values.slug,
          cityId: values.cityId,
          address: values.address,
          location,
          phoneNumber: values.phone ? (toE164Nigeria(values.phone) ?? values.phone) : undefined,
          status: values.openNow ? 'ACTIVE' : 'INACTIVE',
        },
      },
      {
        onSuccess: store =>
          setZone.mutate(
            {
              id: store.id,
              body: {kind: 'CIRCLE', radiusMetres: Math.round(values.radiusKm * 1000)},
            },
            {
              onSuccess: () => {
                toast.success(`${store.name} added`);
                void navigate(storePath(store.id, 'zone'));
              },
              onError: error => {
                toastError(
                  error,
                  `${store.name} was added, but its delivery zone wasn’t saved. Set it here.`
                );
                void navigate(storePath(store.id, 'zone'));
              },
            }
          ),
        onError: error => {
          if (!isApiError(error)) return;
          applyFieldErrors(form, error, {phoneNumber: 'phone'});
          if (error.code === 'STORE_SLUG_TAKEN') {
            form.setError('slug', {message: 'Another store already uses this slug'});
          }
        },
      }
    );
  });

  const errors = form.formState.errors;
  const busy = create.isPending || setZone.isPending;

  return (
    <>
      <Link
        to={paths.stores}
        className="mb-3 inline-flex items-center gap-1 text-body-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" /> Stores
      </Link>
      <PageHeader
        title="Add a store"
        description="Where it is and the area it delivers to. You can reshape the zone and adjust delivery settings once it’s added."
      />

      <form
        onSubmit={submit}
        noValidate
        className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
      >
        <div className="grid content-start gap-5">
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
                {...form.register('slug', {onChange: () => setSlugEdited(true)})}
              />
            </Field>
            <Controller
              control={form.control}
              name="cityId"
              render={({field}) => (
                <Field label="City" error={errors.cityId?.message}>
                  {cities.isPending ? (
                    <Skeleton className="h-12" />
                  ) : (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.data?.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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
              hint={`A circle around the pin, ${minKm}–${maxKm} km. You can reshape it afterwards.`}
              error={errors.radiusKm?.message}
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  step={0.5}
                  min={minKm}
                  max={maxKm}
                  className="w-28 tabular"
                  {...form.register('radiusKm', {valueAsNumber: true})}
                />
                <span className="text-body-sm text-ink-muted">km</span>
              </div>
            </Field>
          </Card>

          <Card className="p-5">
            <Controller
              control={form.control}
              name="openNow"
              render={({field}) => (
                <div className="flex items-start gap-3">
                  <Switch
                    id="open-now"
                    aria-describedby="open-now-hint"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                  <span className="grid gap-0.5">
                    <label htmlFor="open-now" className="text-label">
                      Serve customers straight away
                    </label>
                    <span id="open-now-hint" className="text-body-sm text-ink-muted">
                      Leave off to finish setting up first: zone, delivery settings, stock and
                      staff. Until it’s active, no address is served by this store.
                    </span>
                  </span>
                </div>
              )}
            />
          </Card>

          {create.isError ? <Alert tone="danger">{errorMessage(create.error)}</Alert> : null}
          <div className="flex gap-3">
            <Button type="submit" loading={busy}>
              Add store
            </Button>
            <Button variant="outline" asChild>
              <Link to={paths.stores}>Cancel</Link>
            </Button>
          </div>
        </div>

        <div className="h-[28rem] lg:sticky lg:top-20 lg:h-[calc(100dvh-8rem)]">
          <LazyStoreMap
            label="Store location. Click to drop the pin."
            pin={pin}
            onPinChange={movePin}
            zone={preview}
            zonePreview
            fallbackCenter={fallbackCenter}
            className="h-full"
          />
        </div>
      </form>
    </>
  );
}
