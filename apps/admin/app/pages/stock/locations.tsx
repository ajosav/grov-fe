import {useState} from 'react';

import {MapPin, Plus} from 'lucide-react';

import {useCreateLocation, useInventoryLocations, useUpdateLocation} from '@grov/hooks';
import {
  appConfig,
  type InventoryLocation,
  type InventoryLocationKind,
  PERMISSIONS,
  type TemperatureClass,
} from '@grov/models';
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
import {
  CREATABLE_LOCATION_KINDS,
  LOCATION_KIND,
  newKey,
  TEMPERATURE,
} from '../../lib/inventory/inventory-format';
import type {Route} from './+types/locations';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Locations · ${appConfig.brandName} admin`}];

type Editing = {mode: 'new'} | {mode: 'edit'; location: InventoryLocation} | null;

export default function StockLocations() {
  const locations = useInventoryLocations();
  const rows = locations.data ?? [];
  const {can} = usePermissions();
  const canManage = can(PERMISSIONS.STOCK.LOCATIONS_MANAGE);
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <>
      <PageHeader
        title="Locations"
        description="The places stock sits in this store: warehouse, cold rooms, bays. Receiving, quarantine and in-transit are kept by the system."
        actions={
          <Can permission={PERMISSIONS.STOCK.LOCATIONS_MANAGE}>
            <Button size="sm" onClick={() => setEditing({mode: 'new'})}>
              <Plus aria-hidden /> Add location
            </Button>
          </Can>
        }
      />
      <ListSection
        label="Locations"
        query={locations}
        count={rows.length}
        empty={{
          icon: <MapPin />,
          title: 'No locations yet',
          description:
            'Locations are created with the store. Add a warehouse or cold room to start.',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(location => (
              <TableRow key={location.id}>
                <TableCell className="font-semibold">
                  {location.name}
                  {location.system ? (
                    <span className="ml-2 text-body-sm font-normal text-ink-muted">System</span>
                  ) : null}
                </TableCell>
                <TableCell>{LOCATION_KIND[location.kind]}</TableCell>
                <TableCell>{TEMPERATURE[location.temperatureClass]}</TableCell>
                <TableCell>
                  <Badge tone={location.active ? 'leaf' : 'neutral'}>
                    {location.active ? 'In use' : 'Retired'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {canManage && !location.system ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing({mode: 'edit', location})}
                    >
                      Edit
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ListSection>

      <Dialog open={editing !== null} onOpenChange={open => (open ? undefined : setEditing(null))}>
        <DialogContent className="max-w-md">
          {editing ? (
            <LocationForm
              key={editing.mode === 'edit' ? editing.location.id : 'new'}
              location={editing.mode === 'edit' ? editing.location : undefined}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function LocationForm({location, onDone}: {location?: InventoryLocation; onDone: () => void}) {
  const create = useCreateLocation();
  const update = useUpdateLocation();
  const [idempotencyKey] = useState(newKey);
  const [name, setName] = useState(location?.name ?? '');
  const [kind, setKind] = useState<InventoryLocationKind>(
    location?.kind ?? CREATABLE_LOCATION_KINDS[1]
  );
  const [temperature, setTemperature] = useState<TemperatureClass>(
    location?.temperatureClass ?? 'AMBIENT'
  );
  const [active, setActive] = useState(location?.active ?? true);
  const pending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  const submit = () => {
    if (!name.trim()) return;
    const done = {
      onSuccess: () => {
        toast.success(location ? 'Location saved' : 'Location added');
        onDone();
      },
    };
    if (location) {
      update.mutate(
        {
          id: location.id,
          body: {name: name.trim(), temperatureClass: temperature, active},
        },
        done
      );
    } else {
      create.mutate(
        {
          idempotencyKey,
          body: {
            name: name.trim(),
            kind: kind as (typeof CREATABLE_LOCATION_KINDS)[number],
            temperatureClass: temperature,
          },
        },
        done
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{location ? 'Edit location' : 'Add a location'}</DialogTitle>
        <DialogDescription>
          {location
            ? 'Retire a location once it is empty. Its history stays.'
            : 'A place stock can sit in at this store.'}
        </DialogDescription>
      </DialogHeader>
      <form
        noValidate
        className="grid gap-5"
        onSubmit={event => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Name">
          <Input value={name} maxLength={80} onChange={e => setName(e.target.value)} />
        </Field>
        {location ? null : (
          <Field label="Kind">
            <Select value={kind} onValueChange={value => setKind(value as InventoryLocationKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREATABLE_LOCATION_KINDS.map(option => (
                  <SelectItem key={option} value={option}>
                    {LOCATION_KIND[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Temperature">
          <Select
            value={temperature}
            onValueChange={value => setTemperature(value as TemperatureClass)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TEMPERATURE) as TemperatureClass[]).map(option => (
                <SelectItem key={option} value={option}>
                  {TEMPERATURE[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {location ? (
          <Field label="Status">
            <Select
              value={active ? 'on' : 'off'}
              onValueChange={value => setActive(value === 'on')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on">In use</SelectItem>
                <SelectItem value="off">Retired</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        {error ? <Alert tone="danger">{errorMessage(error)}</Alert> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={pending} disabled={!name.trim()}>
            {location ? 'Save' : 'Add location'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
