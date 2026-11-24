import {useId, useState} from 'react';

import {Search} from 'lucide-react';

import {useMyStores, useRoles} from '@grov/hooks';
import {errorMessage, usePermissions} from '@grov/shared';
import {Alert, Badge, Checkbox, cn, Input, Skeleton, Switch} from '@grov/ui';

import {canGrantAllStores, canGrantRole} from '../../lib/grants';

export interface AccessValue {
  roleIds: string[];
  storeIds: string[];
  allStores: boolean;
}

export interface AccessPickerProps {
  value: AccessValue;
  onChange: (value: AccessValue) => void;
  /** What the person holds now: these stay selectable even if archived. */
  initial?: AccessValue;
  errors?: {roleIds?: string; stores?: string};
}

/**
 * Roles and stores for an invite or a staff member. Choices the signed-in
 * admin couldn't grant are disabled, as grov-be would refuse them.
 */
export function AccessPicker({value, onChange, initial, errors = {}}: AccessPickerProps) {
  const {access} = usePermissions();
  const admin = access?.admin;
  const roles = useRoles();
  const stores = useMyStores();
  const [storeQuery, setStoreQuery] = useState('');
  const id = useId();

  const toggle = (list: string[], item: string, on: boolean) =>
    on ? [...new Set([...list, item])] : list.filter(x => x !== item);

  const visibleRoles = (roles.data ?? []).filter(
    role => role.status === 'ACTIVE' || initial?.roleIds.includes(role.id)
  );
  const storeOptions = (stores.data?.stores ?? []).filter(store =>
    store.name.toLowerCase().includes(storeQuery.trim().toLowerCase())
  );
  const mayGrantAll = canGrantAllStores(admin);

  return (
    <div className="grid gap-5">
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-label">Roles</legend>
        {roles.isPending ? <Skeleton className="h-40" /> : null}
        {roles.isError ? <Alert tone="danger">{errorMessage(roles.error)}</Alert> : null}
        <div className="divide-y divide-line rounded-md border border-line">
          {visibleRoles.map(role => {
            const grantable = canGrantRole(admin, role);
            const checked = value.roleIds.includes(role.id);
            const inputId = `${id}-role-${role.id}`;
            return (
              <div
                key={role.id}
                className={cn('flex items-start gap-3 px-3 py-2.5', !grantable && 'opacity-60')}
              >
                <Checkbox
                  id={inputId}
                  checked={checked}
                  disabled={!grantable}
                  onCheckedChange={on =>
                    onChange({...value, roleIds: toggle(value.roleIds, role.id, on === true)})
                  }
                  className="mt-0.5"
                />
                <label htmlFor={inputId} className="grid min-w-0 flex-1 cursor-pointer gap-0.5">
                  <span className="flex flex-wrap items-center gap-2 text-body font-semibold">
                    {role.name}
                    {role.locked ? <Badge tone="night">All permissions</Badge> : null}
                    {role.status === 'ARCHIVED' ? <Badge>Archived</Badge> : null}
                  </span>
                  <span className="text-body-sm text-ink-muted">
                    {!grantable
                      ? 'Has permissions you don’t hold'
                      : (role.description ??
                        `${role.permissionKeys.length} permission${role.permissionKeys.length === 1 ? '' : 's'}`)}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        {errors.roleIds ? (
          <p role="alert" className="text-body-sm text-danger">
            {errors.roleIds}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-label">Stores</legend>
        <div className="flex items-start gap-3">
          <Switch
            id={`${id}-all`}
            checked={value.allStores}
            disabled={!mayGrantAll}
            onCheckedChange={on => onChange({...value, allStores: on})}
            className="mt-0.5"
          />
          <span className="grid gap-0.5">
            <label htmlFor={`${id}-all`} className="text-body font-semibold">
              All stores
            </label>
            <span className="text-body-sm text-ink-muted">
              {mayGrantAll
                ? 'Every store, including ones added later. For finance, central catalogue and reporting.'
                : 'Only admins with access to all stores can give this.'}
            </span>
          </span>
        </div>

        {!value.allStores ? (
          <>
            {stores.isPending ? <Skeleton className="h-32" /> : null}
            {(stores.data?.stores.length ?? 0) > 6 ? (
              <div className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                />
                <Input
                  aria-label="Find a store"
                  placeholder="Find a store"
                  value={storeQuery}
                  onChange={e => setStoreQuery(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
            ) : null}
            <div className="max-h-64 divide-y divide-line overflow-y-auto rounded-md border border-line">
              {storeOptions.length === 0 && stores.isSuccess ? (
                <p className="px-3 py-3 text-body-sm text-ink-muted">No stores to show.</p>
              ) : null}
              {storeOptions.map(store => {
                const inputId = `${id}-store-${store.id}`;
                return (
                  <div key={store.id} className="flex items-center gap-3 px-3 py-2">
                    <Checkbox
                      id={inputId}
                      checked={value.storeIds.includes(store.id)}
                      onCheckedChange={on =>
                        onChange({
                          ...value,
                          storeIds: toggle(value.storeIds, store.id, on === true),
                        })
                      }
                    />
                    <label
                      htmlFor={inputId}
                      className="flex flex-1 cursor-pointer items-center gap-2"
                    >
                      <span className="text-body">{store.name}</span>
                      {store.status === 'INACTIVE' ? <Badge>Inactive</Badge> : null}
                    </label>
                  </div>
                );
              })}
            </div>
            <p className="text-body-sm text-ink-muted">
              {value.storeIds.length === 0
                ? 'No store: they can use only the parts of their roles that aren’t tied to a store.'
                : `${value.storeIds.length} store${value.storeIds.length === 1 ? '' : 's'} selected.`}
            </p>
          </>
        ) : null}
        {errors.stores ? (
          <p role="alert" className="text-body-sm text-danger">
            {errors.stores}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
