import {useState} from 'react';

import {MoreHorizontal, Plus, ShieldCheck} from 'lucide-react';
import {Link} from 'react-router';

import {useArchiveRole, useRoles} from '@grov/hooks';
import {appConfig, PERMISSIONS, type Role} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@grov/ui';

import {RoleDialog} from '../../components/access/role-dialog';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {paths} from '../../paths';
import type {Route} from './+types/roles';

export const handle = {
  requires: {allOf: [PERMISSIONS.ACCESS.ROLES_READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Roles · ${appConfig.brandName} admin`}];

export default function Roles() {
  const roles = useRoles();
  const archive = useArchiveRole();
  const {can} = usePermissions();
  const canManage = can(PERMISSIONS.ACCESS.ROLES_MANAGE);
  const [editing, setEditing] = useState<Role | null>(null);
  const [archiving, setArchiving] = useState<Role | null>(null);

  const restore = (role: Role) =>
    archive.mutate(
      {id: role.id, archived: false},
      {
        onSuccess: () => toast.success(`${role.name} restored`),
      }
    );

  return (
    <>
      <PageHeader
        title="Roles and permissions"
        description="A role is a named set of permissions. People get access through the roles they hold, in the stores they’re given."
        actions={
          <Can permission={PERMISSIONS.ACCESS.ROLES_MANAGE}>
            <RoleDialog
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
              <TableHead className="text-right">People</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.data.map(role => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {role.name}
                    {role.locked ? (
                      <Badge tone="night">Locked</Badge>
                    ) : role.isSystem ? (
                      <Badge tone="sky">Built in</Badge>
                    ) : null}
                  </div>
                  {role.description ? (
                    <div className="text-body-sm text-ink-muted">{role.description}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  {role.locked ? (
                    <span className="text-body-sm">All permissions</span>
                  ) : (
                    <span className="tabular">{role.permissionKeys.length}</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular">
                  {role.holderCount > 0 ? (
                    <Link
                      to={`${paths.staff}?roleId=${role.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {role.holderCount}
                    </Link>
                  ) : (
                    <span className="text-ink-muted">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge tone={role.status === 'ACTIVE' ? 'leaf' : 'neutral'}>
                    {role.status === 'ACTIVE' ? 'Active' : 'Archived'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {canManage && !role.locked ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${role.name}`}
                        >
                          <MoreHorizontal aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {role.status === 'ACTIVE' ? (
                          <DropdownMenuItem onSelect={() => setEditing(role)}>
                            Edit
                          </DropdownMenuItem>
                        ) : null}
                        {role.isSystem ? null : role.status === 'ACTIVE' ? (
                          <DropdownMenuItem
                            className="text-danger"
                            onSelect={() => setArchiving(role)}
                          >
                            Archive
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onSelect={() => restore(role)}>
                            Restore
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {editing ? (
        <RoleDialog
          role={editing}
          open
          onOpenChange={open => {
            if (!open) setEditing(null);
          }}
        />
      ) : null}
      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={open => {
          if (!open) {
            setArchiving(null);
            archive.reset();
          }
        }}
        title={archiving ? `Archive ${archiving.name}?` : ''}
        description={
          archiving && archiving.holderCount > 0
            ? `${archiving.holderCount} ${archiving.holderCount === 1 ? 'person loses' : 'people lose'} its permissions at once. Restoring the role gives them back.`
            : 'Nobody holds it. You can restore it later.'
        }
        confirmLabel="Archive role"
        tone="danger"
        loading={archive.isPending}
        onConfirm={() => {
          if (!archiving) return;
          archive.mutate(
            {id: archiving.id, archived: true},
            {
              onSuccess: () => {
                toast.success(`${archiving.name} archived`);
                setArchiving(null);
              },
            }
          );
        }}
      >
        {archive.isError ? <Alert tone="danger">{errorMessage(archive.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
