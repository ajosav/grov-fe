import {Plus, ShieldCheck} from 'lucide-react';

import {useRoles} from '@grov/hooks';
import {appConfig, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  Badge,
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

import {CreateRoleDialog} from '../../components/create-role-dialog';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/roles';

export const handle = {
  requires: {allOf: [PERMISSIONS.ACCESS.ROLES_READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Roles · ${appConfig.brandName} admin`}];

export default function Roles() {
  const roles = useRoles();
  return (
    <>
      <PageHeader
        title="Roles and permissions"
        description="A role is a named set of permissions. People get access through the roles they hold."
        actions={
          <Can permission={PERMISSIONS.ACCESS.ROLES_MANAGE}>
            <CreateRoleDialog
              trigger={
                <Button>
                  <Plus aria-hidden /> New role
                </Button>
              }
            />
          </Can>
        }
      />
      {roles.isPending ? (
        <Skeleton className="h-64" />
      ) : roles.isError ? (
        <Alert tone="danger" title="Couldn’t load roles">
          {errorMessage(roles.error)}
        </Alert>
      ) : roles.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShieldCheck />}
            title="No roles yet"
            description="Create the first role to give people access."
          />
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.data.map(role => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="font-semibold text-ink">{role.name}</div>
                  {role.description ? (
                    <div className="text-ink-muted">{role.description}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Badge tone="night">All permissions</Badge>
                  ) : (
                    <span className="tabular">{role.permissionKeys.length}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge tone={role.status === 'ACTIVE' ? 'leaf' : 'neutral'}>
                    {role.status === 'ACTIVE' ? 'Active' : 'Archived'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
