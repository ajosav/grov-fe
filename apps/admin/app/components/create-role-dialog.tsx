import {type ReactNode, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';

import {useCreateRole, usePermissionCatalogue} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Skeleton,
  toast,
} from '@grov/ui';

const schema = z.object({
  name: z.string().trim().min(1, 'Name the role').max(80),
  description: z.string().trim().max(200),
  permissionKeys: z.array(z.string()).min(1, 'Pick at least one permission'),
});

export function CreateRoleDialog({trigger}: {trigger: ReactNode}) {
  const [open, setOpen] = useState(false);
  const catalogue = usePermissionCatalogue(open);
  const createRole = useCreateRole();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {name: '', description: '', permissionKeys: [] as string[]},
  });

  const submit = form.handleSubmit(({name, description, permissionKeys}) =>
    createRole.mutate(
      {name, description: description || undefined, permissionKeys},
      {
        onSuccess: role => {
          toast.success(`${role.name} created`);
          form.reset();
          setOpen(false);
        },
      }
    )
  );

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) createRole.reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent layout="side" className="max-w-xl content-start">
        <DialogHeader>
          <DialogTitle>New role</DialogTitle>
          <DialogDescription>
            You can only grant permissions you hold yourself, unless you are a super admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input autoFocus {...form.register('name')} />
          </Field>
          <Field label="Description" optional error={form.formState.errors.description?.message}>
            <Input {...form.register('description')} />
          </Field>

          <fieldset className="grid gap-4">
            <legend className="mb-2 text-body-sm font-semibold">Permissions</legend>
            {catalogue.isPending ? <Skeleton className="h-48" /> : null}
            {catalogue.isError ? (
              <Alert tone="danger">{errorMessage(catalogue.error)}</Alert>
            ) : null}
            <Controller
              control={form.control}
              name="permissionKeys"
              render={({field, fieldState}) => (
                <>
                  {catalogue.data?.map(group => (
                    <div
                      key={group.module}
                      className="grid gap-2 rounded-md border border-line p-4"
                    >
                      <p className="text-chip uppercase tracking-wide text-ink-muted">
                        {group.label}
                      </p>
                      {group.permissions.map(permission => {
                        const checked = field.value.includes(permission.key);
                        return (
                          <div key={permission.key} className="flex items-start gap-3 py-1">
                            <Checkbox
                              id={`perm-${permission.key}`}
                              checked={checked}
                              onCheckedChange={on =>
                                field.onChange(
                                  on
                                    ? [...field.value, permission.key]
                                    : field.value.filter(key => key !== permission.key)
                                )
                              }
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={`perm-${permission.key}`}
                              className="grid cursor-pointer"
                            >
                              <span className="text-body font-semibold">{permission.name}</span>
                              <span className="text-body-sm text-ink-muted">
                                {permission.description}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {fieldState.error ? (
                    <p role="alert" className="text-body-sm text-danger">
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </>
              )}
            />
          </fieldset>

          {createRole.isError ? (
            <Alert tone="danger">{errorMessage(createRole.error)}</Alert>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createRole.isPending}>
              Create role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
