import {type ReactNode, useState} from 'react';

import {MoreHorizontal, UsersRound} from 'lucide-react';

import {type StaffAction, type StaffFilters, useMe, useStaff, useStaffAction} from '@grov/hooks';
import {PERMISSIONS, type StaffMember} from '@grov/models';
import {Can, errorMessage} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

import {formatDay} from '../../lib/format/dates';
import {StaffAccessDialog} from './staff-access-dialog';

const fullName = (m: StaffMember) => [m.firstName, m.lastName].filter(Boolean).join(' ');

const CONFIRM: Record<
  StaffAction,
  {title: (name: string) => string; body: string; label: string; done: (name: string) => string}
> = {
  suspend: {
    title: name => `Suspend ${name}?`,
    body: 'They’re signed out of the admin console at once. Their roles and stores are kept, so you can restore them later. Their customer account isn’t affected.',
    label: 'Suspend',
    done: name => `${name} is suspended`,
  },
  resume: {
    title: name => `Restore ${name}?`,
    body: 'They can sign in to the admin console again with the roles and stores they had.',
    label: 'Restore',
    done: name => `${name} can sign in again`,
  },
  remove: {
    title: name => `Remove ${name}’s admin access?`,
    body: 'Their roles and stores are taken away and they’re signed out of the admin console. Their customer account stays. To come back they need a new invite.',
    label: 'Remove access',
    done: name => `${name} no longer has admin access`,
  },
};

/** Staff with admin access; one table for the Staff page and a store's Staff tab. */
export function StaffTable({
  filters,
  emptyAction,
  showStores = true,
}: {
  filters: StaffFilters;
  emptyAction?: ReactNode;
  showStores?: boolean;
}) {
  const staff = useStaff(filters);
  const action = useStaffAction();
  const meId = useMe().data?.id;
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [confirm, setConfirm] = useState<{member: StaffMember; action: StaffAction} | null>(null);
  const rows = staff.data?.pages.flatMap(page => page.data) ?? [];
  const filtered = Boolean(filters.q || filters.status || filters.roleId);

  if (staff.isPending) return <Skeleton className="h-64" />;
  if (staff.isError) {
    return (
      <Alert tone="danger" title="Couldn’t load staff">
        {errorMessage(staff.error)}
      </Alert>
    );
  }
  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<UsersRound />}
          title={filtered ? 'No one matches' : 'No staff yet'}
          description={
            filtered
              ? 'Try another search or filter.'
              : 'Invite people to give them access to the admin console.'
          }
          action={filtered ? null : emptyAction}
        />
      </Card>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Person</TableHead>
            <TableHead>Roles</TableHead>
            {showStores ? <TableHead className="hidden lg:table-cell">Stores</TableHead> : null}
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Joined</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(member => {
            const name = fullName(member);
            const isYou = member.userId === meId;
            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {name}
                    {isYou ? <Badge tone="sky">You</Badge> : null}
                  </div>
                  <div className="text-body-sm text-ink-muted">{member.email}</div>
                  {member.title ? (
                    <div className="text-body-sm text-ink-muted">{member.title}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex max-w-72 flex-wrap gap-1">
                    {member.isSuperAdmin ? <Badge tone="night">Super admin</Badge> : null}
                    {member.roles
                      .filter(role => role.key !== 'SUPER_ADMIN')
                      .map(role => (
                        <Badge key={role.id} tone={role.status === 'ACTIVE' ? 'neutral' : 'palm'}>
                          {role.name}
                          {role.status === 'ARCHIVED' ? ' (archived)' : ''}
                        </Badge>
                      ))}
                    {member.roles.length === 0 ? (
                      <span className="text-body-sm text-ink-muted">No role</span>
                    ) : null}
                  </div>
                </TableCell>
                {showStores ? (
                  <TableCell className="hidden max-w-64 text-body-sm lg:table-cell">
                    {member.allStores ? (
                      <span className="font-semibold">All stores</span>
                    ) : member.stores.length === 0 ? (
                      <span className="text-ink-muted">None</span>
                    ) : (
                      <StoreList names={member.stores.map(s => s.name)} />
                    )}
                  </TableCell>
                ) : null}
                <TableCell>
                  {member.status === 'ACTIVE' ? (
                    <Badge tone="leaf">Active</Badge>
                  ) : (
                    <Badge tone="palm">Suspended</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden text-body-sm text-ink-muted xl:table-cell">
                  {member.activatedAt ? formatDay(member.activatedAt) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Can permission={PERMISSIONS.ACCESS.STAFF_MANAGE}>
                    {member.canManage ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`}>
                            <MoreHorizontal aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditing(member)}>
                            Change roles and stores
                          </DropdownMenuItem>
                          {member.status === 'ACTIVE' ? (
                            <DropdownMenuItem
                              onSelect={() => setConfirm({member, action: 'suspend'})}
                            >
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onSelect={() => setConfirm({member, action: 'resume'})}
                            >
                              Restore access
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-danger"
                            onSelect={() => setConfirm({member, action: 'remove'})}
                          >
                            Remove access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </Can>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {staff.hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            loading={staff.isFetchingNextPage}
            onClick={() => void staff.fetchNextPage()}
          >
            Show more
          </Button>
        </div>
      ) : null}

      <StaffAccessDialog
        member={editing}
        open={editing !== null}
        onOpenChange={open => {
          if (!open) setEditing(null);
        }}
      />
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={open => {
          if (!open) {
            setConfirm(null);
            action.reset();
          }
        }}
        title={confirm ? CONFIRM[confirm.action].title(fullName(confirm.member)) : ''}
        description={confirm ? CONFIRM[confirm.action].body : undefined}
        confirmLabel={confirm ? CONFIRM[confirm.action].label : ''}
        tone={confirm?.action === 'resume' ? 'default' : 'danger'}
        loading={action.isPending}
        onConfirm={() => {
          if (!confirm) return;
          const {member, action: kind} = confirm;
          action.mutate(
            {userId: member.userId, action: kind},
            {
              onSuccess: () => {
                toast.success(CONFIRM[kind].done(fullName(member)));
                setConfirm(null);
              },
            }
          );
        }}
      >
        {action.isError ? <Alert tone="danger">{errorMessage(action.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}

function StoreList({names}: {names: string[]}) {
  const shown = names.slice(0, 3);
  const more = names.length - shown.length;
  return (
    <span title={names.join(', ')}>
      {shown.join(', ')}
      {more > 0 ? <span className="text-ink-muted"> +{more}</span> : null}
    </span>
  );
}
