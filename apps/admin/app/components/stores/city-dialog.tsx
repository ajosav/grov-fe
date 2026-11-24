import {type ReactNode, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';

import {isApiError} from '@grov/api';
import {useCreateCity, useUpdateCity} from '@grov/hooks';
import type {AdminCity, CityStatus} from '@grov/models';
import {applyFieldErrors, errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@grov/ui';

import {type ConfigDraft, draftErrors, toDraft, toPatch} from '../../lib/stores/delivery-config';
import {DeliveryConfigFields, inheritedFrom} from './delivery-config-fields';
import {CITY_STATUS, CITY_STATUSES} from './status-badges';

const schema = z.object({
  code: z
    .string()
    .trim()
    .transform(v => v.toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{3}$/, 'Use three letters, like LOS')),
  name: z.string().trim().min(1, 'Name the city').max(80),
  status: z.enum(['PLANNED', 'PILOT', 'LIVE', 'PAUSED']),
  timezone: z.string().trim().min(1, 'Enter a time zone, like Africa/Lagos').max(64),
});
type Values = z.input<typeof schema>;

export interface CityDialogProps {
  /** Edit this city; omit to add one. */
  city?: AdminCity;
  trigger: ReactNode;
}

/** Add or edit a city: name, status, time zone and the delivery defaults its stores share. */
export function CityDialog({city, trigger}: CityDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent layout="side" className="max-w-2xl content-start">
        {open ? <CityForm city={city} onDone={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function CityForm({city, onDone}: {city?: AdminCity; onDone: () => void}) {
  const editing = Boolean(city);
  // One key per "add city" intent, reused if the admin retries (data.md → Idempotency).
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const create = useCreateCity();
  const update = useUpdateCity();
  const save = editing ? update : create;

  const [draft, setDraft] = useState<ConfigDraft>(() => toDraft(city?.config));
  const [showDraftErrors, setShowDraftErrors] = useState(false);
  const configErrors = draftErrors(draft);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: city?.code ?? '',
      name: city?.name ?? '',
      status: city?.status ?? 'PLANNED',
      timezone: city?.timezone ?? 'Africa/Lagos',
    },
  });

  const onError = (error: unknown) => {
    if (!isApiError(error)) return;
    applyFieldErrors(form, error);
    if (error.code === 'CITY_CODE_TAKEN') {
      form.setError('code', {message: 'Another city already uses this code'});
    }
  };

  const submit = form.handleSubmit(values => {
    setShowDraftErrors(true);
    if (Object.keys(configErrors).length > 0) return;
    const parsed = schema.parse(values);
    const config = toPatch(draft);
    if (city) {
      update.mutate(
        {
          id: city.id,
          body: {name: parsed.name, status: parsed.status, timezone: parsed.timezone, config},
        },
        {
          onSuccess: saved => {
            toast.success(`${saved.name} saved`);
            onDone();
          },
          onError,
        }
      );
    } else {
      create.mutate(
        {body: {...parsed, config}, idempotencyKey},
        {
          onSuccess: saved => {
            toast.success(`${saved.name} added`);
            onDone();
          },
          onError,
        }
      );
    }
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{city ? `Edit ${city.name}` : 'Add a city'}</DialogTitle>
        <DialogDescription>
          Delivery defaults apply to every store in the city unless a store sets its own.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <Field
            label="Code"
            hint={editing ? 'Codes can’t change.' : undefined}
            error={form.formState.errors.code?.message}
          >
            <Input
              autoFocus={!editing}
              disabled={editing}
              maxLength={3}
              autoComplete="off"
              className="uppercase"
              placeholder="LOS"
              {...form.register('code')}
            />
          </Field>
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input autoFocus={editing} autoComplete="off" {...form.register('name')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="status"
            render={({field}) => (
              <Field label="Status" hint={CITY_STATUS[field.value as CityStatus].hint}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITY_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {CITY_STATUS[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Field
            label="Time zone"
            hint="Delivery windows and cut-offs use this zone."
            error={form.formState.errors.timezone?.message}
          >
            <Input autoComplete="off" spellCheck={false} {...form.register('timezone')} />
          </Field>
        </div>

        <fieldset className="grid gap-3">
          <legend className="mb-1 text-title-sm">Delivery defaults</legend>
          <DeliveryConfigFields
            draft={draft}
            onChange={setDraft}
            errors={showDraftErrors ? configErrors : {}}
            setLabel={`Set for ${form.watch('name') || 'this city'}`}
            inherited={inheritedFrom({}, systemDefault)}
          />
        </fieldset>

        {save.isError ? <Alert tone="danger">{errorMessage(save.error)}</Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {city ? 'Save city' : 'Add city'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

/** grov-be doesn't expose the system defaults, so a city only says where they come from. */
const systemDefault = () => 'Uses the system default';
