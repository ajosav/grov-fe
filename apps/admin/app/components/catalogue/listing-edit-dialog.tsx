import {useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';

import {usePutListing, usePutProductListing} from '@grov/hooks';
import type {StoreListing} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  DatePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  NumberInput,
  Segmented,
  toast,
} from '@grov/ui';

import {
  earliestResumeDay,
  formatQty,
  listingState,
  pauseUntilDay,
} from '../../lib/catalogue/listings';
import {formatAmount, unitNoun} from '../../lib/catalogue/units';

const schema = z
  .object({
    selling: z.enum(['selling', 'paused']),
    resumeOn: z.date().optional(),
    minOrderQty: z
      .string()
      .trim()
      .refine(value => value === '' || /^\d{1,9}(\.\d{1,3})?$/.test(value), {
        message: 'Use a number with up to 3 decimals, or leave empty',
      }),
  })
  .refine(values => values.selling === 'selling' || values.resumeOn, {
    path: ['resumeOn'],
    message: 'Pick the day sales resume',
  });
type Values = z.input<typeof schema>;

export type EditableListing = Pick<
  StoreListing,
  'productId' | 'displayName' | 'active' | 'pausedUntil' | 'minOrderQty'
>;

export interface ListingEditDialogProps {
  listing: EditableListing | null;
  onClose: () => void;
  storeId?: string;
  unit?: string;
}

export function ListingEditDialog({listing, onClose, storeId, unit}: ListingEditDialogProps) {
  return (
    <Dialog open={listing !== null} onOpenChange={open => (open ? undefined : onClose())}>
      <DialogContent layout="side" className="max-w-lg content-start">
        {listing ? (
          <EditForm listing={listing} onDone={onClose} storeId={storeId} unit={unit} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  listing,
  onDone,
  storeId,
  unit,
}: {
  listing: EditableListing;
  onDone: () => void;
  storeId?: string;
  unit?: string;
}) {
  const putActive = usePutListing();
  const putAt = usePutProductListing();
  const put = storeId ? putAt : putActive;
  const [earliest] = useState(() => earliestResumeDay());
  const paused = listingState(listing) === 'PAUSED';
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      selling: paused ? 'paused' : 'selling',
      resumeOn: paused && listing.pausedUntil ? new Date(listing.pausedUntil) : undefined,
      minOrderQty: formatQty(listing.minOrderQty) ?? '',
    },
  });
  const selling = form.watch('selling');

  const submit = form.handleSubmit(values => {
    const parsed = schema.parse(values);
    const body = {
      active: true,
      pausedUntil:
        parsed.selling === 'paused' && parsed.resumeOn ? pauseUntilDay(parsed.resumeOn) : null,
      minOrderQty: parsed.minOrderQty === '' ? null : parsed.minOrderQty,
    };
    const onSuccess = () => {
      toast.success(`${listing.displayName} saved`);
      onDone();
    };
    if (storeId) {
      putAt.mutate({productId: listing.productId, storeId, body}, {onSuccess});
    } else {
      putActive.mutate({productId: listing.productId, body}, {onSuccess});
    }
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{listing.displayName}</DialogTitle>
        <DialogDescription>
          Pause sales for a while, or set the smallest amount shoppers can order from this store.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={event => void submit(event)} noValidate className="grid gap-5">
        <Controller
          control={form.control}
          name="selling"
          render={({field}) => (
            <div className="grid gap-2">
              <span className="text-label">Sales</span>
              <Segmented<'selling' | 'paused'>
                label="Sales"
                value={field.value}
                onChange={field.onChange}
                options={[
                  {value: 'selling', label: 'Selling'},
                  {value: 'paused', label: 'Paused'},
                ]}
                className="w-fit"
              />
            </div>
          )}
        />

        {selling === 'paused' ? (
          <Controller
            control={form.control}
            name="resumeOn"
            render={({field}) => (
              <Field
                label="Sales resume on"
                hint="Shoppers can’t buy it here until this day starts."
                error={form.formState.errors.resumeOn?.message}
              >
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={{before: earliest}}
                />
              </Field>
            )}
          />
        ) : null}

        <Controller
          control={form.control}
          name="minOrderQty"
          render={({field}) => (
            <Field
              label="Minimum order"
              optional
              hint={
                formatAmount(field.value, unit ?? '')
                  ? `That’s ${formatAmount(field.value, unit ?? '')}.`
                  : unit
                    ? `In ${unitNoun(unit)}, the same unit as the sizes.`
                    : 'In the product’s base unit, the same unit as its sizes.'
              }
              error={form.formState.errors.minOrderQty?.message}
            >
              <NumberInput
                value={field.value}
                onChange={field.onChange}
                decimals={3}
                maxIntegerDigits={9}
              />
            </Field>
          )}
        />

        {put.isError ? <Alert tone="danger">{errorMessage(put.error)}</Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={put.isPending}>
            Save listing
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
