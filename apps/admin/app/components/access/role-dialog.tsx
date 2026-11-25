import {type ReactNode, useState} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';

import {useCreateRole, usePermissionCatalogue, useUpdateRole} from '@grov/hooks';
import type {Role} from '@grov/models';
import {errorMessage, usePermissions} from '@grov/shared';
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
  Switch,
  toast,
} from '@grov/ui';

const schema = z.object({
  name: z.string().trim().min(1, 'Name the role').max(80),
  description: z.string().trim().max(200),
  permissionKeys: z.array(z.string()).min(1, 'Pick at least one permission'),
});

export interface RoleDialogProps {
  trigger?: ReactNode;
  /** Edit this role; omit to create one. */
  role?: Role;
  /** Controlled open state (editing from a row menu). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Create a role, or edit one. Built-in roles keep their name; super admin isn't editable. */
export function RoleDialog({trigger, role, open: controlled, onOpenChange}: RoleDialogProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlled ?? uncontrolled;
  const setOpen = (next: boolean) => {
    setUncontrolled(next);
    onOpenChange?.(next);
  };
  const catalogue = usePermissionCatalogue(open);
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const save = role ? updateRole : createRole;
  const {access} = usePermissions();
  const isSuper = access?.admin?.roles.includes('SUPER_ADMIN') ?? false;
  const held = new Set(access?.admin?.permissions ?? []);
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissionKeys: role?.permissionKeys ?? ([] as string[]),
    },
  });

  const submit = form.handleSubmit(({name, description, permissionKeys}) => {
    const onSuccess = (saved: Role) => {
      toast.success(role ? `${saved.name} saved` : `${saved.name} created`);
      form.reset();
      setOpen(false);
    };
    if (role) {
      updateRole.mutate(
        {
          id: role.id,
          body: {
            ...(role.isSystem || name === role.name ? {} : {name}),
            description: description || null,
            permissionKeys,
          },
        },
        {onSuccess}
      );
    } else {
      createRole.mutate({name, description: description || undefined, permissionKeys}, {onSuccess});
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) save.reset();
      }}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent layout="side" className="max-w-xl content-start">
        <DialogHeader>
          <DialogTitle>{role ? `Edit ${role.name}` : 'New role'}</DialogTitle>
          <DialogDescription>
            {role && role.holderCount > 0
              ? `${role.holderCount} ${role.holderCount === 1 ? 'person holds' : 'people hold'} this role; changes apply on their next action. `
              : ''}
            You can only add or remove permissions you hold yourself.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <Field
            label="Name"
            hint={role?.isSystem ? 'Built-in roles keep their name.' : undefined}
            error={form.formState.errors.name?.message}
          >
            <Input disabled={role?.isSystem} {...form.register('name')} />
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
                      {(() => {
                        const usableKeys = group.permissions
                          .map(permission => permission.key)
                          .filter(key => isSuper || held.has(key));
                        const selected = usableKeys.filter(key => field.value.includes(key));
                        const allOn = usableKeys.length > 0 && selected.length === usableKeys.length;
                        const chosen = group.permissions.filter(permission =>
                          field.value.includes(permission.key)
                        ).length;
                        return (
                          <div className="flex items-center justify-between gap-3">
                            <label
                              htmlFor={`group-${group.module}`}
                              className="grid cursor-pointer gap-0.5"
                            >
                              <span className="text-chip uppercase tracking-wide text-ink-muted">
                                {group.label}
                              </span>
                              <span className="text-body-sm text-ink-muted">
                                {chosen} of {group.permissions.length} on
                              </span>
                            </label>
                            <Switch
                              id={`group-${group.module}`}
                              aria-label={`Toggle all ${group.label} permissions`}
                              checked={allOn}
                              disabled={usableKeys.length === 0}
                              onCheckedChange={on =>
                                field.onChange(
                                  on
                                    ? [...new Set([...field.value, ...usableKeys])]
                                    : field.value.filter(key => !usableKeys.includes(key))
                                )
                              }
                            />
                          </div>
                        );
                      })()}
                      {group.permissions.map(permission => {
                        const checked = field.value.includes(permission.key);
                        const usable = isSuper || held.has(permission.key);
                        return (
                          <div
                            key={permission.key}
                            className={`flex items-start gap-3 py-1 ${usable ? '' : 'opacity-60'}`}
                          >
                            <Checkbox
                              id={`perm-${permission.key}`}
                              checked={checked}
                              disabled={!usable}
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

          {save.isError ? <Alert tone="danger">{errorMessage(save.error)}</Alert> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={save.isPending}>
              {role ? 'Save role' : 'Create role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
