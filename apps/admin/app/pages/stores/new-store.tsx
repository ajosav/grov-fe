import {useEffect, useMemo, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {ArrowLeft} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {Link, useNavigate} from 'react-router';

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
import {Alert, Button, toast, toE164Nigeria} from '@grov/ui';

import {LazyStoreMap} from '../../components/stores/lazy-store-map';
import {StoreDetailsFields} from '../../components/stores/new-store/store-details-fields';
import {StoreLocationFields} from '../../components/stores/new-store/store-location-fields';
import {StoreOpenNow} from '../../components/stores/new-store/store-open-now';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {circleZone, formatCoordinates, parseCoordinates} from '../../lib/stores/geo';
import {
  MAX_RADIUS_KM,
  MIN_RADIUS_KM,
  newStoreSchema,
  type NewStoreValues,
} from '../../lib/stores/new-store';
import {cityView, DEFAULT_RADIUS_KM, hasAllStores} from '../../lib/stores/store-rules';
import {paths, storePath} from '../../paths';
import type {Route} from './+types/new-store';

export const handle = {
  requires: {allOf: [PERMISSIONS.STORES.MANAGE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Add store · ${appConfig.brandName} admin`}];

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

  const form = useForm<NewStoreValues>({
    resolver: zodResolver(newStoreSchema),
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
    () =>
      pin && radiusKm >= MIN_RADIUS_KM && radiusKm <= MAX_RADIUS_KM
        ? circleZone(pin, radiusKm * 1000)
        : null,
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
          <StoreDetailsFields
            form={form}
            cities={cities.data}
            citiesPending={cities.isPending}
            slugEdited={slugEdited}
            onSlugEdited={() => setSlugEdited(true)}
          />
          <StoreLocationFields form={form} />
          <StoreOpenNow control={form.control} />

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
