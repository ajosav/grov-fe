import {useState} from 'react';

import {Plus, Search} from 'lucide-react';
import {useSearchParams} from 'react-router';

import {useDebounce, useRoles} from '@grov/hooks';
import {type AdminInviteStatus, appConfig, PERMISSIONS, type StaffStatus} from '@grov/models';
import {Can, PageHeader} from '@grov/shared';
import {
  Button,
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@grov/ui';

import {InviteDialog} from '../../components/access/invite-dialog';
import {InvitesTable} from '../../components/access/invites-table';
import {StaffTable} from '../../components/access/staff-table';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/staff';

export const handle = {
  requires: {allOf: [PERMISSIONS.ACCESS.STAFF_READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Staff · ${appConfig.brandName} admin`}];

const ALL = 'all';

export default function Staff() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'invites' ? 'invites' : 'staff';
  const status = params.get('status');
  const roleId = params.get('roleId') ?? undefined;
  const inviteStatus = (
    ['PENDING', 'EXPIRED', 'ACCEPTED', 'REVOKED'].includes(params.get('invites') ?? '')
      ? params.get('invites')
      : 'PENDING'
  ) as AdminInviteStatus;
  const [query, setQuery] = useState(params.get('q') ?? '');
  const q = useDebounce(query.trim(), 300);
  const roles = useRoles();

  const set = (key: string, value: string | undefined) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      {replace: true}
    );

  const invite = (
    <Can permission={PERMISSIONS.ACCESS.STAFF_INVITE}>
      <InviteDialog
        trigger={
          <Button>
            <Plus aria-hidden /> Invite staff
          </Button>
        }
      />
    </Can>
  );

  return (
    <>
      <PageHeader
        title="Staff"
        description="People with access to the admin console: their roles, and the stores they work in."
        actions={invite}
      />
      <Tabs value={tab} onValueChange={value => set('tab', value === 'staff' ? undefined : value)}>
        <TabsList className="mb-5 [&_button]:h-8">
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-72">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
              />
              <Input
                aria-label="Search staff"
                placeholder="Search by name or email"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  set('q', e.target.value.trim() || undefined);
                }}
                className="h-10 pl-9"
              />
            </div>
            <Select
              value={roleId ?? ALL}
              onValueChange={v => set('roleId', v === ALL ? undefined : v)}
            >
              <SelectTrigger aria-label="Role" className="h-10 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All roles</SelectItem>
                {roles.data?.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Segmented<StaffStatus | typeof ALL>
              label="Status"
              value={status === 'ACTIVE' || status === 'SUSPENDED' ? status : ALL}
              onChange={v => set('status', v === ALL ? undefined : v)}
              options={[
                {value: ALL, label: 'All'},
                {value: 'ACTIVE', label: 'Active'},
                {value: 'SUSPENDED', label: 'Suspended'},
              ]}
              className="[&_button]:h-8"
            />
          </div>
          <StaffTable
            filters={{
              ...(q ? {q} : {}),
              ...(roleId ? {roleId} : {}),
              ...(status === 'ACTIVE' || status === 'SUSPENDED' ? {status} : {}),
            }}
            emptyAction={invite}
          />
        </TabsContent>

        <TabsContent value="invites">
          <Segmented<AdminInviteStatus>
            label="Invite status"
            value={inviteStatus}
            onChange={v => set('invites', v === 'PENDING' ? undefined : v)}
            options={[
              {value: 'PENDING', label: 'Waiting'},
              {value: 'EXPIRED', label: 'Expired'},
              {value: 'ACCEPTED', label: 'Accepted'},
              {value: 'REVOKED', label: 'Revoked'},
            ]}
            className="mb-4 [&_button]:h-8"
          />
          <InvitesTable status={inviteStatus} />
        </TabsContent>
      </Tabs>
    </>
  );
}
