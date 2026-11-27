import {useEffect, useState} from 'react';

import {Plus, Search, Tractor} from 'lucide-react';
import {useSearchParams} from 'react-router';

import {
  useCreateFarm,
  useCreateSupplier,
  useDebounce,
  useSuppliers,
  useUpdateSupplier,
} from '@grov/hooks';
import {appConfig, PERMISSIONS, type Supplier} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@grov/ui';

import {ListSection} from '../../components/inventory/list-section';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {newKey} from '../../lib/inventory/inventory-format';
import type {Route} from './+types/suppliers';

export const handle = {
  requires: {allOf: [PERMISSIONS.SUPPLIERS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Suppliers · ${appConfig.brandName} admin`}];

type Scope = 'ACTIVE' | 'all';
type Dialogue = {kind: 'new'} | {kind: 'open'; id: string} | null;

export default function Suppliers() {
  const [params, setParams] = useSearchParams();
  const scope: Scope = params.get('status') === 'all' ? 'all' : 'ACTIVE';
  const urlQ = params.get('q') ?? '';
  const [text, setText] = useState(urlQ);
  const q = useDebounce(text.trim(), 300);
  const [dialogue, setDialogue] = useState<Dialogue>(null);

  const setParam = (key: string, value: string | undefined) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      {replace: true}
    );
  useEffect(() => {
    if (q !== urlQ.trim()) setParam('q', q || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a settled search writes the URL
  }, [q]);

  const list = useSuppliers({
    ...(urlQ ? {q: urlQ} : {}),
    ...(scope === 'ACTIVE' ? {status: 'ACTIVE' as const} : {}),
    limit: 50,
  });
  const rows = list.data?.pages.flatMap(page => page.data) ?? [];
  const open = dialogue?.kind === 'open' ? rows.find(row => row.id === dialogue.id) : undefined;

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="The people and businesses goods are bought from, and the farms they come from. Batches keep the link."
        actions={
          <Can permission={PERMISSIONS.SUPPLIERS.MANAGE}>
            <Button size="sm" onClick={() => setDialogue({kind: 'new'})}>
              <Plus aria-hidden /> Add supplier
            </Button>
          </Can>
        }
      />
      <ListSection
        label="Suppliers"
        query={list}
        count={rows.length}
        toolbar={
          <>
            <div className="relative w-full sm:w-64">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              />
              <Input
                type="search"
                aria-label="Search suppliers"
                placeholder="Search by name"
                autoComplete="off"
                className="h-9 pl-9"
                value={text}
                onChange={event => setText(event.target.value)}
              />
            </div>
            <Segmented<Scope>
              size="sm"
              label="Show"
              value={scope}
              onChange={value => setParam('status', value === 'ACTIVE' ? undefined : value)}
              options={[
                {value: 'ACTIVE', label: 'Active'},
                {value: 'all', label: 'All'},
              ]}
            />
          </>
        }
        empty={{
          icon: <Tractor />,
          title: 'No suppliers',
          description: 'Add the people and farms you buy from so every batch can be traced.',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden @3xl:table-cell">Phone</TableHead>
              <TableHead>Farms</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(supplier => (
              <TableRow
                key={supplier.id}
                className="cursor-pointer"
                onClick={() => setDialogue({kind: 'open', id: supplier.id})}
              >
                <TableCell>
                  <button
                    type="button"
                    className="font-semibold underline-offset-4 hover:underline focus-visible:underline"
                    onClick={event => {
                      event.stopPropagation();
                      setDialogue({kind: 'open', id: supplier.id});
                    }}
                  >
                    {supplier.name}
                  </button>
                  <div className="text-body-sm text-ink-muted">
                    {supplier.kind === 'PERSON' ? 'Individual' : 'Business'}
                  </div>
                </TableCell>
                <TableCell className="hidden @3xl:table-cell">{supplier.phone ?? '—'}</TableCell>
                <TableCell>{supplier.farms.length}</TableCell>
                <TableCell>
                  <Badge tone={supplier.status === 'ACTIVE' ? 'leaf' : 'neutral'}>
                    {supplier.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListSection>

      <Dialog
        open={dialogue !== null}
        onOpenChange={next => (next ? undefined : setDialogue(null))}
      >
        <DialogContent layout="side" className="max-w-lg content-start">
          {dialogue?.kind === 'new' ? <NewSupplier onDone={() => setDialogue(null)} /> : null}
          {dialogue?.kind === 'open' && open ? <SupplierDetail supplier={open} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function NewSupplier({onDone}: {onDone: () => void}) {
  const create = useCreateSupplier();
  const [idempotencyKey] = useState(newKey);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'PERSON' | 'BUSINESS'>('BUSINESS');
  const [phone, setPhone] = useState('');
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add a supplier</DialogTitle>
        <DialogDescription>You can add their farms after.</DialogDescription>
      </DialogHeader>
      <form
        noValidate
        className="grid gap-5"
        onSubmit={event => {
          event.preventDefault();
          if (!name.trim()) return;
          create.mutate(
            {
              idempotencyKey,
              body: {name: name.trim(), kind, ...(phone.trim() ? {phone: phone.trim()} : {})},
            },
            {
              onSuccess: () => {
                toast.success('Supplier added');
                onDone();
              },
            }
          );
        }}
      >
        <Field label="Name">
          <Input value={name} maxLength={160} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="Kind">
          <Select value={kind} onValueChange={value => setKind(value as 'PERSON' | 'BUSINESS')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUSINESS">Business</SelectItem>
              <SelectItem value="PERSON">Individual</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Phone" hint="Optional. Include the country code, e.g. +234.">
          <Input type="tel" value={phone} maxLength={20} onChange={e => setPhone(e.target.value)} />
        </Field>
        {create.isError ? <Alert tone="danger">{errorMessage(create.error)}</Alert> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending} disabled={!name.trim()}>
            Add supplier
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function SupplierDetail({supplier}: {supplier: Supplier}) {
  const {can} = usePermissions();
  const canManage = can(PERMISSIONS.SUPPLIERS.MANAGE);
  const update = useUpdateSupplier();
  const createFarm = useCreateFarm();
  const [farmKey, setFarmKey] = useState(newKey);
  const [farm, setFarm] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');

  return (
    <>
      <DialogHeader>
        <DialogTitle>{supplier.name}</DialogTitle>
        <DialogDescription>
          {supplier.kind === 'PERSON' ? 'Individual' : 'Business'}
          {supplier.phone ? ` · ${supplier.phone}` : ''}
        </DialogDescription>
      </DialogHeader>
      {canManage ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            loading={update.isPending}
            onClick={() =>
              update.mutate(
                {
                  id: supplier.id,
                  body: {status: supplier.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'},
                },
                {
                  onSuccess: () =>
                    toast.success(
                      supplier.status === 'ACTIVE'
                        ? 'Supplier set to inactive'
                        : 'Supplier active again'
                    ),
                }
              )
            }
          >
            {supplier.status === 'ACTIVE' ? 'Mark inactive' : 'Mark active'}
          </Button>
          {update.isError ? (
            <Alert tone="danger" className="mt-3">
              {errorMessage(update.error)}
            </Alert>
          ) : null}
        </div>
      ) : null}
      <h3 className="text-body font-semibold">Farms</h3>
      {supplier.farms.length === 0 ? (
        <p className="text-body-sm text-ink-muted">No farms recorded.</p>
      ) : (
        <ul className="grid gap-2">
          {supplier.farms.map(item => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.name}</div>
                <div className="text-body-sm text-ink-muted">
                  {[item.lga, item.state].filter(Boolean).join(', ') || 'Location not recorded'}
                </div>
              </div>
              <Badge tone={item.status === 'ACTIVE' ? 'leaf' : 'neutral'}>
                {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {canManage ? (
        <form
          noValidate
          className="grid gap-4 rounded-lg border border-line p-4"
          onSubmit={event => {
            event.preventDefault();
            if (!farm.trim()) return;
            createFarm.mutate(
              {
                supplierId: supplier.id,
                idempotencyKey: farmKey,
                body: {
                  name: farm.trim(),
                  ...(state.trim() ? {state: state.trim()} : {}),
                  ...(lga.trim() ? {lga: lga.trim()} : {}),
                },
              },
              {
                onSuccess: () => {
                  toast.success('Farm added');
                  setFarm('');
                  setState('');
                  setLga('');
                  setFarmKey(newKey());
                },
              }
            );
          }}
        >
          <h4 className="text-body-sm font-semibold">Add a farm</h4>
          <Field label="Farm name">
            <Input value={farm} maxLength={160} onChange={e => setFarm(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="State" hint="Optional.">
              <Input value={state} maxLength={60} onChange={e => setState(e.target.value)} />
            </Field>
            <Field label="LGA" hint="Optional.">
              <Input value={lga} maxLength={80} onChange={e => setLga(e.target.value)} />
            </Field>
          </div>
          {createFarm.isError ? (
            <Alert tone="danger">{errorMessage(createFarm.error)}</Alert>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={createFarm.isPending} disabled={!farm.trim()}>
              Add farm
            </Button>
          </div>
        </form>
      ) : null}
    </>
  );
}
