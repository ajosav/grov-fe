import {type ReactNode, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';

import {isApiError} from '@grov/api';
import {useCreateCategory, useUpdateCategory} from '@grov/hooks';
import {type Category, ErrorCode} from '@grov/models';
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
  Switch,
  toast,
} from '@grov/ui';

import {CATEGORY_TINT_KEYS, CATEGORY_TINTS} from '../../lib/catalogue/categories';
import {NumberInput} from '../common/number-input';

const NO_PARENT = 'none';

// Mirrors grov-be's limits (category.schemas.ts).
const schema = z.object({
  name: z.string().trim().min(1, 'Name the category').max(120),
  parentId: z.string(),
  tintKey: z.enum(CATEGORY_TINT_KEYS as [string, ...string[]]),
  sort: z
    .string()
    .trim()
    .regex(/^\d{1,5}$/, 'Use a whole number from 0 to 10000')
    .refine(value => Number(value) <= 10_000, 'Use a whole number from 0 to 10000'),
  discretionaryRank: z
    .string()
    .trim()
    .refine(value => value === '' || (/^\d{1,4}$/.test(value) && Number(value) <= 1000), {
      message: 'Leave empty, or use a whole number from 0 to 1000',
    }),
  active: z.boolean(),
});
type Values = z.input<typeof schema>;

export interface CategoryDialogProps {
  /** Edit this category; omit to add one. */
  category?: Category;
  /** Pre-select a parent when adding a sub-category. */
  parentId?: string;
  /** Every category, to pick a parent from. */
  categories: readonly Category[];
  /** Called with the saved category, e.g. so a product form can select the one just added. */
  onSaved?: (category: Category) => void;
  trigger: ReactNode;
}

/** Add or edit a category: name, parent, tint, order and whether shoppers see it. */
export function CategoryDialog({
  category,
  parentId,
  categories,
  onSaved,
  trigger,
}: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent layout="side" className="max-w-lg content-start">
        {open ? (
          <CategoryForm
            category={category}
            parentId={parentId}
            categories={categories}
            onSaved={onSaved}
            onDone={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  parentId,
  categories,
  onSaved,
  onDone,
}: Omit<CategoryDialogProps, 'trigger'> & {onDone: () => void}) {
  const editing = Boolean(category);
  // One key per "add category" intent, reused if the admin retries (data.md → Idempotency).
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const save = editing ? update : create;

  // Nesting is one level: only top-level categories can be parents, and a
  // category that has sub-categories can't become one itself.
  const hasChildren = category ? categories.some(other => other.parentId === category.id) : false;
  const parents = categories.filter(other => other.parentId === null && other.id !== category?.id);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? '',
      parentId: category?.parentId ?? parentId ?? NO_PARENT,
      tintKey: category?.tintKey ?? 'GRAIN',
      sort: String(category?.sort ?? 100),
      discretionaryRank:
        category?.discretionaryRank === null || category?.discretionaryRank === undefined
          ? ''
          : String(category.discretionaryRank),
      active: category?.active ?? true,
    },
  });

  const onError = (error: unknown) => {
    if (!isApiError(error)) return;
    applyFieldErrors(form, error);
    if (error.code === ErrorCode.CATEGORY_SLUG_TAKEN) {
      form.setError('name', {message: 'A category with this name already exists'});
    }
  };

  const submit = form.handleSubmit(values => {
    const parsed = schema.parse(values);
    const parent = parsed.parentId === NO_PARENT ? null : parsed.parentId;
    const rank = parsed.discretionaryRank === '' ? null : Number(parsed.discretionaryRank);
    const tintKey = parsed.tintKey as Category['tintKey'];
    if (category) {
      update.mutate(
        {
          id: category.id,
          body: {
            name: parsed.name,
            parentId: parent,
            tintKey,
            sort: Number(parsed.sort),
            discretionaryRank: rank,
            active: parsed.active,
          },
        },
        {
          onSuccess: saved => {
            toast.success(`${saved.name} saved`);
            onSaved?.(saved);
            onDone();
          },
          onError,
        }
      );
    } else {
      create.mutate(
        {
          body: {
            name: parsed.name,
            ...(parent ? {parentId: parent} : {}),
            tintKey,
            sort: Number(parsed.sort),
            ...(rank === null ? {} : {discretionaryRank: rank}),
          },
          idempotencyKey,
        },
        {
          onSuccess: saved => {
            toast.success(`${saved.name} added`);
            onSaved?.(saved);
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
        <DialogTitle>{category ? `Edit ${category.name}` : 'Add a category'}</DialogTitle>
        <DialogDescription>
          Categories group products in Shop. They nest one level: a category, and its
          sub-categories.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={event => {
          // This dialog can sit inside another form (adding a product); don't submit that one too.
          event.stopPropagation();
          void submit(event);
        }}
        noValidate
        className="grid gap-5"
      >
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input autoFocus autoComplete="off" {...form.register('name')} />
        </Field>

        <Controller
          control={form.control}
          name="parentId"
          render={({field}) => (
            <Field
              label="Parent category"
              hint={
                hasChildren
                  ? 'This category has sub-categories, so it stays at the top level.'
                  : 'Leave as “None” for a top-level category.'
              }
            >
              <Select value={field.value} onValueChange={field.onChange} disabled={hasChildren}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>None (top level)</SelectItem>
                  {parents.map(parent => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="tintKey"
          render={({field}) => (
            <Field
              label="Type"
              hint={CATEGORY_TINTS[field.value as keyof typeof CATEGORY_TINTS]?.hint}
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_TINT_KEYS.map(tint => (
                    <SelectItem key={tint} value={tint}>
                      {CATEGORY_TINTS[tint].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="sort"
            render={({field}) => (
              <Field
                label="Sort order"
                hint="Lower numbers come first in Shop."
                error={form.formState.errors.sort?.message}
              >
                <NumberInput value={field.value} onChange={field.onChange} maxIntegerDigits={5} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="discretionaryRank"
            render={({field}) => (
              <Field
                label="Discretionary rank"
                optional
                hint="Reserved for Fit to budget. Not used yet."
                error={form.formState.errors.discretionaryRank?.message}
              >
                <NumberInput value={field.value} onChange={field.onChange} maxIntegerDigits={4} />
              </Field>
            )}
          />
        </div>

        {editing ? (
          <Controller
            control={form.control}
            name="active"
            render={({field}) => (
              <div className="flex items-start justify-between gap-4 rounded-md border border-line p-3">
                <div className="grid gap-0.5">
                  <label htmlFor="category-active" className="text-label">
                    Active
                  </label>
                  <p className="text-body-sm text-ink-muted">
                    Inactive categories are hidden from shoppers. Products can’t be added to them.
                  </p>
                </div>
                <Switch
                  id="category-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        ) : null}

        {save.isError ? <Alert tone="danger">{errorMessage(save.error)}</Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {category ? 'Save category' : 'Add category'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
