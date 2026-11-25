import {useState} from 'react';

import {MailPlus} from 'lucide-react';

import {useInviteAction, useInvites} from '@grov/hooks';
import {type AdminInvite, type AdminInviteStatus, PERMISSIONS} from '@grov/models';
import {Can, errorMessage} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
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

import {formatMoment} from '../../lib/format/dates';

const EMPTY: Record<AdminInviteStatus, string> = {
  PENDING: 'No invites waiting',
  EXPIRED: 'No expired invites',
  ACCEPTED: 'No accepted invites yet',
  REVOKED: 'No revoked invites',
};

export function InvitesTable({status}: {status: AdminInviteStatus}) {
  const invites = useInvites(status);
  const act = useInviteAction();
  const [revoking, setRevoking] = useState<AdminInvite | null>(null);
  const rows = invites.data?.pages.flatMap(page => page.data) ?? [];

  if (invites.isPending) return <Skeleton className="h-48" />;
  if (invites.isError) {
    return (
      <Alert tone="danger" title="Couldn’t load invites">
        {errorMessage(invites.error)}
      </Alert>
    );
  }
  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState icon={<MailPlus />} title={EMPTY[status]} />
      </Card>
    );
  }

  const resend = (invite: AdminInvite) =>
    act.mutate(
      {id: invite.id, action: 'resend'},
      {
        onSuccess: () => toast.success(`Invite sent again to ${invite.email}`),
      }
    );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="hidden lg:table-cell">Stores</TableHead>
            <TableHead className="hidden md:table-cell">Invited by</TableHead>
            <TableHead>
              {status === 'ACCEPTED' ? 'Accepted' : status === 'REVOKED' ? 'Revoked' : 'Expires'}
            </TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(invite => (
            <TableRow key={invite.id}>
              <TableCell>
                <div className="font-semibold text-ink">{invite.email}</div>
                {invite.title ? (
                  <div className="text-body-sm text-ink-muted">{invite.title}</div>
                ) : null}
              </TableCell>
              <TableCell>
                <div className="flex max-w-64 flex-wrap gap-1">
                  {invite.roles.map(role => (
                    <Badge key={role.id}>{role.name}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden text-body-sm lg:table-cell">
                {invite.allStores ? 'All stores' : invite.stores.map(s => s.name).join(', ') || '—'}
              </TableCell>
              <TableCell className="hidden text-body-sm text-ink-muted md:table-cell">
                {invite.invitedBy?.name ?? '—'}
              </TableCell>
              <TableCell className="text-body-sm tabular">
                {status === 'ACCEPTED' && invite.acceptedAt
                  ? formatMoment(invite.acceptedAt)
                  : status === 'REVOKED' && invite.revokedAt
                    ? formatMoment(invite.revokedAt)
                    : formatMoment(invite.expiresAt)}
                {invite.sendCount > 1 ? (
                  <div className="text-ink-muted">Sent {invite.sendCount} times</div>
                ) : null}
              </TableCell>
              <TableCell className="text-right">
                <Can permission={PERMISSIONS.ACCESS.STAFF_INVITE}>
                  {invite.canManage ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={
                          act.isPending &&
                          act.variables?.id === invite.id &&
                          act.variables.action === 'resend'
                        }
                        onClick={() => resend(invite)}
                      >
                        Resend
                      </Button>
                      {status === 'PENDING' ? (
                        <Button variant="ghost" size="sm" onClick={() => setRevoking(invite)}>
                          Revoke
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </Can>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {invites.hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            loading={invites.isFetchingNextPage}
            onClick={() => void invites.fetchNextPage()}
          >
            Show more
          </Button>
        </div>
      ) : null}
      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={open => {
          if (!open) setRevoking(null);
        }}
        title={revoking ? `Revoke the invite for ${revoking.email}?` : ''}
        description="The link in their email stops working at once. You can invite them again later."
        confirmLabel="Revoke invite"
        tone="danger"
        loading={act.isPending}
        onConfirm={() => {
          if (!revoking) return;
          act.mutate(
            {id: revoking.id, action: 'revoke'},
            {
              onSuccess: () => {
                toast.success('Invite revoked');
                setRevoking(null);
              },
            }
          );
        }}
      >
        {act.isError ? <Alert tone="danger">{errorMessage(act.error)}</Alert> : null}
      </ConfirmDialog>
    </>
  );
}
