import {useState} from 'react';

import {useUpdateStaffAccess} from '@grov/hooks';
import type {StaffMember} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@grov/ui';

import {AccessPicker, type AccessValue} from './access-picker';

const accessOf = (member: StaffMember): AccessValue => ({
  roleIds: member.roles.map(role => role.id),
  storeIds: member.stores.map(store => store.id),
  allStores: member.allStores && !member.isSuperAdmin,
});

/** Change a staff member's roles and stores (replaces the whole set). */
export function StaffAccessDialog({
  member,
  open,
  onOpenChange,
}: {
  member: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent layout="side" className="max-w-xl content-start">
        {open && member ? (
          <AccessForm key={member.userId} member={member} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AccessForm({member, onDone}: {member: StaffMember; onDone: () => void}) {
  const update = useUpdateStaffAccess();
  const [initial] = useState(() => accessOf(member));
  const [grant, setGrant] = useState<AccessValue>(initial);
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ');

  const save = () =>
    update.mutate(
      {
        userId: member.userId,
        body: {...grant, storeIds: grant.allStores ? [] : grant.storeIds},
      },
      {
        onSuccess: () => {
          toast.success(`${name}’s access updated`);
          onDone();
        },
      }
    );

  return (
    <>
      <DialogHeader>
        <DialogTitle>Access for {name}</DialogTitle>
        <DialogDescription>
          Changes apply on their next action in the console. Unticking a role or store takes it
          away.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-5">
        <AccessPicker value={grant} onChange={setGrant} initial={initial} />
        {grant.roleIds.length === 0 ? (
          <Alert tone="warning">
            With no role they can sign in but can’t do anything. To take their access away, use
            Remove instead.
          </Alert>
        ) : null}
        {update.isError ? <Alert tone="danger">{errorMessage(update.error)}</Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button onClick={save} loading={update.isPending}>
            Save access
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
