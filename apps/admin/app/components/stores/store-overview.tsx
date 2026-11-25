import {useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {Check, Circle} from 'lucide-react';
import {Controller, useForm} from 'react-hook-form';
import {Link} from 'react-router';
import {z} from 'zod';

import {isApiError} from '@grov/api';
import {useCities, useUpdateStore} from '@grov/hooks';
import type {AdminStoreDetail} from '@grov/models';
import {applyFieldErrors, errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Card,
  cn,
  ConfirmDialog,
  Field,
  formatNigerianPhone,
  Input,
  PhoneInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
  toE164Nigeria,
} from '@grov/ui';

import {formatCoordinates, parseCoordinates} from '../../lib/stores/geo';
import {storePath} from '../../paths';
import {LazyStoreMap} from './lazy-store-map';

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
});
type Values = z.infer<typeof schema>;

const valuesOf = (store: AdminStoreDetail): Values => ({
  name: store.name,
  slug: store.slug,
  cityId: store.city.id,
  address: store.address,
  phone: store.phoneNumber ? formatNigerianPhone(store.phoneNumber) : '',
  coordinates: formatCoordinates(store.location),
});

export function StoreOverview({store, canManage}: {store: AdminStoreDetail; canManage: boolean}) {
  return (
    <div className="grid gap-6">
      <SetupStatus store={store} canManage={canManage} />
      <StoreDetailsForm key={store.updatedAt} store={store} canManage={canManage} />
    </div>
  );
}

/** What's done and what's left before the store serves customers. */
function SetupStatus({store, canManage}: {store: AdminStoreDetail; canManage: boolean}) {
  const update = useUpdateStore();
  const [confirm, setConfirm] = useState<null | 'ACTIVE' | 'INACTIVE'>(null);
  const active = store.status === 'ACTIVE';

  const steps = [
    {done: true, label: 'Location pinned', to: undefined},
    {
      done: store.hasDeliveryZone,
      label: store.hasDeliveryZone ? 'Delivery zone set' : 'Set the delivery zone',
      to: storePath(store.id, 'zone'),
    },
    {
      done: true,
      label: 'Delivery settings (uses the city’s defaults unless changed)',
      to: storePath(store.id, 'delivery'),
    },
  ];

  const changeStatus = (status: 'ACTIVE' | 'INACTIVE') =>
    update.mutate(
      {id: store.id, body: {status}},
      {
        onSuccess: saved => {
          toast.success(
            saved.status === 'ACTIVE'
              ? `${saved.name} is serving customers`
              : `${saved.name} is inactive`
          );
          setConfirm(null);
        },
      }
    );

  return (
    <Card className="grid gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-title-sm">
            {active ? 'Serving customers' : 'Not serving customers yet'}
          </h2>
          <p className="max-w-xl text-body-sm text-ink-muted">
            {active
              ? 'Addresses inside the zone are served by this store when it’s the nearest active one.'
              : 'An inactive store serves no address. Finish setting it up, then activate it.'}
          </p>
        </div>
        {canManage ? (
          active ? (
            <Button variant="outline" size="sm" onClick={() => setConfirm('INACTIVE')}>
              Deactivate
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!store.hasDeliveryZone}
              onClick={() => setConfirm('ACTIVE')}
            >
              Activate store
            </Button>
          )
        ) : null}
      </div>
      {!active ? (
        <ol className="grid gap-2">
          {steps.map(step => (
            <li key={step.label} className="flex items-center gap-2 text-body-sm">
              {step.done ? (
                <Check aria-hidden className="size-4 text-leaf-strong" />
              ) : (
                <Circle aria-hidden className="size-4 text-ink-muted" />
              )}
              <span className="sr-only">{step.done ? 'Done:' : 'To do:'}</span>
              {step.to && !step.done ? (
                <Link to={step.to} className="font-semibold underline underline-offset-4">
                  {step.label}
                </Link>
              ) : (
                <span className={cn(step.done && 'text-ink-muted')}>{step.label}</span>
              )}
            </li>
          ))}
        </ol>
      ) : null}
      {update.isError && !confirm ? (
        <Alert tone="danger">{errorMessage(update.error)}</Alert>
      ) : null}

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={open => {
          if (!open) {
            setConfirm(null);
            update.reset();
          }
        }}
        title={confirm === 'ACTIVE' ? `Activate ${store.name}?` : `Deactivate ${store.name}?`}
        description={
          confirm === 'ACTIVE'
            ? 'Addresses in its zone can start ordering from this store straight away.'
            : 'New orders in its zone go to another covering store, or nobody is served. Orders already placed stay with this store.'
        }
        confirmLabel={confirm === 'ACTIVE' ? 'Activate' : 'Deactivate'}
        tone={confirm === 'INACTIVE' ? 'danger' : 'default'}
        loading={update.isPending}
        onConfirm={() => confirm && changeStatus(confirm)}
      >
        {update.isError ? <Alert tone="danger">{errorMessage(update.error)}</Alert> : null}
      </ConfirmDialog>
    </Card>
  );
}

function StoreDetailsForm({store, canManage}: {store: AdminStoreDetail; canManage: boolean}) {
  const update = useUpdateStore();
  const cities = useCities();
  const form = useForm<Values>({resolver: zodResolver(schema), defaultValues: valuesOf(store)});
  const errors = form.formState.errors;
  const pin = parseCoordinates(form.watch('coordinates'));
  const cityChanged = form.watch('cityId') !== store.city.id;
  const pinMoved =
    pin !== null && (pin.lat !== store.location.lat || pin.lng !== store.location.lng);

  const submit = form.handleSubmit(values => {
    const location = parseCoordinates(values.coordinates);
    if (!location) return;
    const phone = values.phone ? (toE164Nigeria(values.phone) ?? values.phone) : null;
    update.mutate(
      {
        id: store.id,
        body: {
          name: values.name,
          slug: values.slug,
          cityId: values.cityId,
          address: values.address,
          phoneNumber: phone,
          location,
        },
      },
      {
        onSuccess: saved => toast.success(`${saved.name} saved`),
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

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]"
    >
      <Card className="grid content-start gap-4 p-5">
        <h2 className="text-title-sm">Details</h2>
        <fieldset disabled={!canManage} className="grid gap-4">
          <Field label="Name" error={errors.name?.message}>
            <Input autoComplete="off" {...form.register('name')} />
          </Field>
          <Field label="Slug" hint="A short id for reports and links." error={errors.slug?.message}>
            <Input autoComplete="off" spellCheck={false} {...form.register('slug')} />
          </Field>
          <Controller
            control={form.control}
            name="cityId"
            render={({field}) => (
              <Field
                label="City"
                hint={
                  cityChanged
                    ? 'Delivery defaults will come from the new city. Settings set for this store stay.'
                    : undefined
                }
                error={errors.cityId?.message}
              >
                <Select value={field.value} onValueChange={field.onChange} disabled={!canManage}>
                  <SelectTrigger>
                    <SelectValue placeholder={store.city.name} />
                  </SelectTrigger>
                  <SelectContent>
                    {(cities.data ?? [store.city]).map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Field label="Phone" optional error={errors.phone?.message}>
            <PhoneInput autoComplete="off" {...form.register('phone')} />
          </Field>
          <Field
            label="Street address"
            hint="Where riders collect orders."
            error={errors.address?.message}
          >
            <Input autoComplete="off" {...form.register('address')} />
          </Field>
          <Field
            label="Map pin"
            hint={
              pinMoved
                ? 'Moving the pin doesn’t move the delivery zone. Check the zone after saving.'
                : canManage
                  ? 'Drag the pin, click the map, or paste coordinates.'
                  : undefined
            }
            error={errors.coordinates?.message}
          >
            <Input
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              className="tabular"
              {...form.register('coordinates')}
            />
          </Field>
        </fieldset>
        {update.isError ? <Alert tone="danger">{errorMessage(update.error)}</Alert> : null}
        {canManage ? (
          <div className="flex gap-3">
            <Button type="submit" loading={update.isPending} disabled={!form.formState.isDirty}>
              Save details
            </Button>
            {form.formState.isDirty ? (
              <Button variant="ghost" onClick={() => form.reset(valuesOf(store))}>
                Discard
              </Button>
            ) : null}
          </div>
        ) : null}
      </Card>
      <div className="h-80 lg:h-auto lg:min-h-[28rem]">
        <LazyStoreMap
          label={`Location of ${store.name}`}
          pin={pin ?? store.location}
          onPinChange={
            canManage
              ? next =>
                  form.setValue('coordinates', formatCoordinates(next), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
              : undefined
          }
          zone={store.deliveryZone}
          fallbackCenter={store.location}
          className="h-full"
        />
      </div>
    </form>
  );
}
