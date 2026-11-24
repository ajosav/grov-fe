import {MapPinned, Pencil, Plus} from 'lucide-react';
import {Link} from 'react-router';

import {useCities} from '@grov/hooks';
import {type AdminCity, appConfig, PERMISSIONS} from '@grov/models';
import {errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {CityDialog} from '../../components/stores/city-dialog';
import {CityStatusBadge} from '../../components/stores/status-badges';
import {formatConfigValue} from '../../lib/stores/delivery-config';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {paths} from '../../paths';
import type {Route} from './+types/cities';

export const handle = {
  requires: {allOf: [PERMISSIONS.CITIES.MANAGE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Cities · ${appConfig.brandName} admin`}];

export default function Cities() {
  const cities = useCities();
  return (
    <>
      <PageHeader
        title="Cities"
        description="Every store belongs to a city. A city’s delivery defaults apply to its stores unless a store sets its own."
        actions={
          <CityDialog
            trigger={
              <Button>
                <Plus aria-hidden /> Add city
              </Button>
            }
          />
        }
      />
      {cities.isPending ? (
        <Skeleton className="h-64" />
      ) : cities.isError ? (
        <Alert tone="danger" title="Couldn’t load cities">
          {errorMessage(cities.error)}
        </Alert>
      ) : cities.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MapPinned />}
            title="No cities yet"
            description="Add a city first. Stores are set up inside a city."
          />
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Stores</TableHead>
              <TableHead>Defaults</TableHead>
              <TableHead>Time zone</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.data.map(city => (
              <TableRow key={city.id}>
                <TableCell>
                  <div className="font-semibold text-ink">{city.name}</div>
                  <div className="text-body-sm text-ink-muted">{city.code}</div>
                </TableCell>
                <TableCell>
                  <CityStatusBadge status={city.status} />
                </TableCell>
                <TableCell className="text-right tabular">
                  {city.storeCount > 0 ? (
                    <Link
                      to={`${paths.stores}?cityId=${city.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {city.storeCount}
                    </Link>
                  ) : (
                    <span className="text-ink-muted">0</span>
                  )}
                </TableCell>
                <TableCell className="text-body-sm">
                  <DefaultsSummary city={city} />
                </TableCell>
                <TableCell className="text-body-sm text-ink-muted">{city.timezone}</TableCell>
                <TableCell className="text-right">
                  <CityDialog
                    city={city}
                    trigger={
                      <Button variant="ghost" size="sm" aria-label={`Edit ${city.name}`}>
                        <Pencil aria-hidden /> Edit
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

/** The defaults this city sets; anything it doesn't set uses the system default. */
function DefaultsSummary({city}: {city: AdminCity}) {
  const {config} = city;
  const parts = [
    config.deliveryDays && formatConfigValue('deliveryDays', config.deliveryDays),
    config.deliveryWindow && formatConfigValue('deliveryWindow', config.deliveryWindow),
    config.deliveryFee &&
      `${formatConfigValue('deliveryFee', config.deliveryFee, config.deliveryFeeBasis)} fee`,
  ].filter(Boolean);
  const count = Object.keys(config).length;
  if (count === 0) return <span className="text-ink-muted">System defaults</span>;
  return (
    <span>
      {parts.length > 0 ? parts.join(' · ') : null}
      <span className="text-ink-muted">
        {parts.length > 0 ? ' · ' : ''}
        {count} of 7 set
      </span>
    </span>
  );
}
